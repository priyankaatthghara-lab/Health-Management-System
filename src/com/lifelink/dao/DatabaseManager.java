package com.lifelink.dao;

import com.lifelink.exception.BloodBankException;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Central JDBC connection manager and schema initializer.
 * Uses an embedded H2 SQL database stored locally in ./data/lifelink_db (zero external server required).
 */
public final class DatabaseManager {
    private static final String DEFAULT_JDBC_URL = "jdbc:h2:./data/lifelink_db;AUTO_SERVER=TRUE";
    private static final String DEFAULT_USER = "sa";
    private static final String DEFAULT_PASSWORD = "";

    private final String jdbcUrl;
    private final String username;
    private final String password;

    public DatabaseManager() {
        this(DEFAULT_JDBC_URL, DEFAULT_USER, DEFAULT_PASSWORD);
    }

    public DatabaseManager(String jdbcUrl, String username, String password) {
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.password = password;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(jdbcUrl, username, password);
    }

    /**
     * Initializes database tables and seeds realistic healthcare demo data if empty.
     */
    public void initializeSchemaAndSeed() throws BloodBankException {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.execute("""
                    CREATE TABLE IF NOT EXISTS donors (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        full_name VARCHAR(120) NOT NULL,
                        age INT NOT NULL,
                        phone VARCHAR(30) NOT NULL,
                        city VARCHAR(80) NOT NULL,
                        blood_group VARCHAR(10) NOT NULL,
                        weight_kg DOUBLE NOT NULL,
                        last_donation_date DATE,
                        total_donations INT NOT NULL DEFAULT 0,
                        available BOOLEAN NOT NULL DEFAULT TRUE
                    )
                    """);

            stmt.execute("""
                    CREATE TABLE IF NOT EXISTS blood_inventory (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        donor_id INT,
                        blood_group VARCHAR(10) NOT NULL,
                        volume_ml INT NOT NULL DEFAULT 450,
                        collected_date DATE NOT NULL,
                        expiry_date DATE NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
                        FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL
                    )
                    """);

            stmt.execute("""
                    CREATE TABLE IF NOT EXISTS blood_requests (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        hospital_name VARCHAR(150) NOT NULL,
                        patient_name VARCHAR(120) NOT NULL,
                        blood_group VARCHAR(10) NOT NULL,
                        units_required INT NOT NULL,
                        urgency VARCHAR(20) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                        requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                    """);

            seedInitialDataIfEmpty(conn);
        } catch (SQLException e) {
            throw new BloodBankException("Failed to initialize database schema: " + e.getMessage(), e);
        }
    }

    private void seedInitialDataIfEmpty(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM donors")) {
            if (rs.next() && rs.getInt(1) > 0) {
                return;
            }
        }

        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("""
                    INSERT INTO donors (full_name, age, phone, city, blood_group, weight_kg, last_donation_date, total_donations, available) VALUES
                    ('Aarav Sharma', 27, '9876543210', 'New Delhi', 'O+', 72.5, DATEADD('DAY', -120, CURRENT_DATE), 4, TRUE),
                    ('Priya Verma', 24, '9811223344', 'Noida', 'A+', 58.0, DATEADD('DAY', -105, CURRENT_DATE), 2, TRUE),
                    ('Rohan Mehta', 31, '9822334455', 'Gurugram', 'O-', 76.0, DATEADD('DAY', -150, CURRENT_DATE), 6, TRUE),
                    ('Sneha Iyer', 29, '9844556677', 'Greater Noida', 'B+', 61.5, DATEADD('DAY', -45, CURRENT_DATE), 3, TRUE),
                    ('Kabir Nair', 35, '9855667788', 'New Delhi', 'AB+', 80.0, NULL, 1, TRUE),
                    ('Ananya Gupta', 22, '9866778899', 'Ghaziabad', 'B-', 54.0, DATEADD('DAY', -110, CURRENT_DATE), 2, TRUE)
                    """);

            stmt.executeUpdate("""
                    INSERT INTO blood_inventory (donor_id, blood_group, volume_ml, collected_date, expiry_date, status) VALUES
                    (1, 'O+', 450, DATEADD('DAY', -10, CURRENT_DATE), DATEADD('DAY', 32, CURRENT_DATE), 'AVAILABLE'),
                    (1, 'O+', 450, DATEADD('DAY', -5, CURRENT_DATE), DATEADD('DAY', 37, CURRENT_DATE), 'AVAILABLE'),
                    (2, 'A+', 450, DATEADD('DAY', -8, CURRENT_DATE), DATEADD('DAY', 34, CURRENT_DATE), 'AVAILABLE'),
                    (3, 'O-', 450, DATEADD('DAY', -3, CURRENT_DATE), DATEADD('DAY', 39, CURRENT_DATE), 'AVAILABLE'),
                    (3, 'O-', 450, DATEADD('DAY', -12, CURRENT_DATE), DATEADD('DAY', 30, CURRENT_DATE), 'AVAILABLE'),
                    (4, 'B+', 450, DATEADD('DAY', -15, CURRENT_DATE), DATEADD('DAY', 27, CURRENT_DATE), 'AVAILABLE'),
                    (5, 'AB+', 450, DATEADD('DAY', -6, CURRENT_DATE), DATEADD('DAY', 36, CURRENT_DATE), 'AVAILABLE'),
                    (6, 'B-', 450, DATEADD('DAY', -45, CURRENT_DATE), DATEADD('DAY', -3, CURRENT_DATE), 'AVAILABLE')
                    """);

            stmt.executeUpdate("""
                    INSERT INTO blood_requests (hospital_name, patient_name, blood_group, units_required, urgency, status) VALUES
                    ('AIIMS Trauma Center', 'Vikram Singh', 'O+', 1, 'CRITICAL', 'PENDING'),
                    ('Apollo Hospital', 'Meera Joshi', 'A+', 1, 'HIGH', 'PENDING'),
                    ('Fortis Memorial', 'Rajesh Kumar', 'AB+', 1, 'NORMAL', 'PENDING')
                    """);
        }
    }
}
