package com.lifelink.dao;

import com.lifelink.exception.BloodBankException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.Donor;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for managing Donor records.
 */
public class DonorDAO implements GenericDAO<Donor, Integer> {
    private final DatabaseManager dbManager;

    public DonorDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    @Override
    public Donor save(Donor donor) throws BloodBankException {
        String sql = """
                INSERT INTO donors (full_name, age, phone, city, blood_group, weight_kg, last_donation_date, total_donations, available)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            bindDonorParams(ps, donor);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    donor.setId(keys.getInt(1));
                }
            }
            return donor;
        } catch (SQLException e) {
            throw new BloodBankException("Failed to save donor: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<Donor> findById(Integer id) throws BloodBankException {
        String sql = "SELECT * FROM donors WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
                return Optional.empty();
            }
        } catch (SQLException e) {
            throw new BloodBankException("Failed to fetch donor by ID: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Donor> findAll() throws BloodBankException {
        String sql = "SELECT * FROM donors ORDER BY id DESC";
        List<Donor> donors = new ArrayList<>();
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                donors.add(mapRow(rs));
            }
            return donors;
        } catch (SQLException e) {
            throw new BloodBankException("Failed to list donors: " + e.getMessage(), e);
        }
    }

    @Override
    public void update(Donor donor) throws BloodBankException {
        String sql = """
                UPDATE donors
                SET full_name = ?, age = ?, phone = ?, city = ?, blood_group = ?,
                    weight_kg = ?, last_donation_date = ?, total_donations = ?, available = ?
                WHERE id = ?
                """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            bindDonorParams(ps, donor);
            ps.setInt(10, donor.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new BloodBankException("Failed to update donor: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Integer id) throws BloodBankException {
        String sql = "DELETE FROM donors WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new BloodBankException("Failed to delete donor: " + e.getMessage(), e);
        }
    }

    private void bindDonorParams(PreparedStatement ps, Donor donor) throws SQLException {
        ps.setString(1, donor.getFullName());
        ps.setInt(2, donor.getAge());
        ps.setString(3, donor.getPhone());
        ps.setString(4, donor.getCity());
        ps.setString(5, donor.getBloodGroup().getLabel());
        ps.setDouble(6, donor.getWeightKg());
        if (donor.getLastDonationDate() != null) {
            ps.setDate(7, Date.valueOf(donor.getLastDonationDate()));
        } else {
            ps.setNull(7, Types.DATE);
        }
        ps.setInt(8, donor.getTotalDonations());
        ps.setBoolean(9, donor.isAvailable());
    }

    private Donor mapRow(ResultSet rs) throws SQLException {
        Date lastDateSql = rs.getDate("last_donation_date");
        LocalDate lastDate = lastDateSql != null ? lastDateSql.toLocalDate() : null;
        return new Donor(
                rs.getInt("id"),
                rs.getString("full_name"),
                rs.getInt("age"),
                rs.getString("phone"),
                rs.getString("city"),
                BloodGroup.fromString(rs.getString("blood_group")),
                rs.getDouble("weight_kg"),
                lastDate,
                rs.getInt("total_donations"),
                rs.getBoolean("available")
        );
    }
}
