package com.lifelink.dao;

import com.lifelink.exception.BloodBankException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.BloodRequest;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for managing hospital BloodRequest records.
 */
public class RequestDAO implements GenericDAO<BloodRequest, Integer> {
    private final DatabaseManager dbManager;

    public RequestDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    @Override
    public BloodRequest save(BloodRequest request) throws BloodBankException {
        String sql = """
                INSERT INTO blood_requests (hospital_name, patient_name, blood_group, units_required, urgency, status, requested_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, request.getHospitalName());
            ps.setString(2, request.getPatientName());
            ps.setString(3, request.getBloodGroup().getLabel());
            ps.setInt(4, request.getUnitsRequired());
            ps.setString(5, request.getUrgency().name());
            ps.setString(6, request.getStatus().name());
            ps.setTimestamp(7, Timestamp.valueOf(request.getRequestedAt()));
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    request.setId(keys.getInt(1));
                }
            }
            return request;
        } catch (SQLException e) {
            throw new BloodBankException("Failed to save blood request: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<BloodRequest> findById(Integer id) throws BloodBankException {
        String sql = "SELECT * FROM blood_requests WHERE id = ?";
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
            throw new BloodBankException("Failed to fetch blood request: " + e.getMessage(), e);
        }
    }

    @Override
    public List<BloodRequest> findAll() throws BloodBankException {
        String sql = "SELECT * FROM blood_requests ORDER BY requested_at DESC";
        List<BloodRequest> requests = new ArrayList<>();
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                requests.add(mapRow(rs));
            }
            return requests;
        } catch (SQLException e) {
            throw new BloodBankException("Failed to list blood requests: " + e.getMessage(), e);
        }
    }

    @Override
    public void update(BloodRequest request) throws BloodBankException {
        String sql = """
                UPDATE blood_requests
                SET hospital_name = ?, patient_name = ?, blood_group = ?, units_required = ?, urgency = ?, status = ?
                WHERE id = ?
                """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, request.getHospitalName());
            ps.setString(2, request.getPatientName());
            ps.setString(3, request.getBloodGroup().getLabel());
            ps.setInt(4, request.getUnitsRequired());
            ps.setString(5, request.getUrgency().name());
            ps.setString(6, request.getStatus().name());
            ps.setInt(7, request.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new BloodBankException("Failed to update blood request: " + e.getMessage(), e);
        }
    }

    public void updateStatus(Connection conn, int requestId, BloodRequest.Status status) throws SQLException {
        String sql = "UPDATE blood_requests SET status = ? WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, requestId);
            ps.executeUpdate();
        }
    }

    @Override
    public void deleteById(Integer id) throws BloodBankException {
        String sql = "DELETE FROM blood_requests WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new BloodBankException("Failed to delete blood request: " + e.getMessage(), e);
        }
    }

    private BloodRequest mapRow(ResultSet rs) throws SQLException {
        Timestamp ts = rs.getTimestamp("requested_at");
        LocalDateTime requestedAt = ts != null ? ts.toLocalDateTime() : LocalDateTime.now();
        return new BloodRequest(
                rs.getInt("id"),
                rs.getString("hospital_name"),
                rs.getString("patient_name"),
                BloodGroup.fromString(rs.getString("blood_group")),
                rs.getInt("units_required"),
                BloodRequest.Urgency.valueOf(rs.getString("urgency")),
                BloodRequest.Status.valueOf(rs.getString("status")),
                requestedAt
        );
    }
}
