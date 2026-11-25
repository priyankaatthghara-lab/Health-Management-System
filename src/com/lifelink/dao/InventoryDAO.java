package com.lifelink.dao;

import com.lifelink.exception.BloodBankException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.BloodUnit;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * JDBC repository for managing BloodUnit inventory records.
 */
public class InventoryDAO implements GenericDAO<BloodUnit, Integer> {
    private final DatabaseManager dbManager;

    public InventoryDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    @Override
    public BloodUnit save(BloodUnit unit) throws BloodBankException {
        String sql = """
                INSERT INTO blood_inventory (donor_id, blood_group, volume_ml, collected_date, expiry_date, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            if (unit.getDonorId() != null) {
                ps.setInt(1, unit.getDonorId());
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.setString(2, unit.getBloodGroup().getLabel());
            ps.setInt(3, unit.getVolumeMl());
            ps.setDate(4, Date.valueOf(unit.getCollectedDate()));
            ps.setDate(5, Date.valueOf(unit.getExpiryDate()));
            ps.setString(6, unit.getStatus().name());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    unit.setId(keys.getInt(1));
                }
            }
            return unit;
        } catch (SQLException e) {
            throw new BloodBankException("Failed to save blood unit: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<BloodUnit> findById(Integer id) throws BloodBankException {
        String sql = "SELECT * FROM blood_inventory WHERE id = ?";
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
            throw new BloodBankException("Failed to find blood unit: " + e.getMessage(), e);
        }
    }

    @Override
    public List<BloodUnit> findAll() throws BloodBankException {
        String sql = "SELECT * FROM blood_inventory ORDER BY expiry_date ASC, id DESC";
        List<BloodUnit> units = new ArrayList<>();
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                units.add(mapRow(rs));
            }
            return units;
        } catch (SQLException e) {
            throw new BloodBankException("Failed to list blood inventory: " + e.getMessage(), e);
        }
    }

    @Override
    public void update(BloodUnit unit) throws BloodBankException {
        String sql = """
                UPDATE blood_inventory
                SET donor_id = ?, blood_group = ?, volume_ml = ?, collected_date = ?, expiry_date = ?, status = ?
                WHERE id = ?
                """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (unit.getDonorId() != null) {
                ps.setInt(1, unit.getDonorId());
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.setString(2, unit.getBloodGroup().getLabel());
            ps.setInt(3, unit.getVolumeMl());
            ps.setDate(4, Date.valueOf(unit.getCollectedDate()));
            ps.setDate(5, Date.valueOf(unit.getExpiryDate()));
            ps.setString(6, unit.getStatus().name());
            ps.setInt(7, unit.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new BloodBankException("Failed to update blood unit: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Integer id) throws BloodBankException {
        String sql = "DELETE FROM blood_inventory WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new BloodBankException("Failed to delete blood unit: " + e.getMessage(), e);
        }
    }

    /**
     * Marks any AVAILABLE units whose expiry_date is before today as EXPIRED.
     *
     * @return number of units marked expired
     */
    public int markExpiredUnits(LocalDate today) throws BloodBankException {
        String sql = "UPDATE blood_inventory SET status = 'EXPIRED' WHERE status = 'AVAILABLE' AND expiry_date < ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(today));
            return ps.executeUpdate();
        } catch (SQLException e) {
            throw new BloodBankException("Failed to mark expired units: " + e.getMessage(), e);
        }
    }

    /**
     * Aggregates available unit counts per blood group using an EnumMap.
     */
    public Map<BloodGroup, Integer> getAvailableCountsByGroup() throws BloodBankException {
        Map<BloodGroup, Integer> counts = new EnumMap<>(BloodGroup.class);
        for (BloodGroup bg : BloodGroup.values()) {
            counts.put(bg, 0);
        }
        String sql = """
                SELECT blood_group, COUNT(*) AS cnt
                FROM blood_inventory
                WHERE status = 'AVAILABLE' AND expiry_date >= CURRENT_DATE
                GROUP BY blood_group
                """;
        try (Connection conn = dbManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                BloodGroup bg = BloodGroup.fromString(rs.getString("blood_group"));
                counts.put(bg, rs.getInt("cnt"));
            }
            return counts;
        } catch (SQLException e) {
            throw new BloodBankException("Failed to aggregate inventory counts: " + e.getMessage(), e);
        }
    }

    /**
     * Finds oldest (FEFO - First Expired, First Out) available units matching any compatible blood group.
     */
    public List<BloodUnit> findCompatibleAvailableUnits(Connection conn, Set<BloodGroup> compatibleGroups, int limit)
            throws SQLException {
        if (compatibleGroups.isEmpty()) {
            return List.of();
        }
        String placeholders = String.join(",", compatibleGroups.stream().map(g -> "?").toList());
        String sql = """
                SELECT * FROM blood_inventory
                WHERE status = 'AVAILABLE'
                  AND expiry_date >= CURRENT_DATE
                  AND blood_group IN (""" + placeholders + """
                )
                ORDER BY expiry_date ASC, id ASC
                LIMIT ?
                """;
        List<BloodUnit> units = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int idx = 1;
            for (BloodGroup bg : compatibleGroups) {
                ps.setString(idx++, bg.getLabel());
            }
            ps.setInt(idx, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    units.add(mapRow(rs));
                }
            }
        }
        return units;
    }

    public void markUnitIssued(Connection conn, int unitId) throws SQLException {
        String sql = "UPDATE blood_inventory SET status = 'ISSUED' WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, unitId);
            ps.executeUpdate();
        }
    }

    private BloodUnit mapRow(ResultSet rs) throws SQLException {
        int donorIdVal = rs.getInt("donor_id");
        Integer donorId = rs.wasNull() ? null : donorIdVal;
        return new BloodUnit(
                rs.getInt("id"),
                donorId,
                BloodGroup.fromString(rs.getString("blood_group")),
                rs.getInt("volume_ml"),
                rs.getDate("collected_date").toLocalDate(),
                rs.getDate("expiry_date").toLocalDate(),
                BloodUnit.Status.valueOf(rs.getString("status"))
        );
    }
}
