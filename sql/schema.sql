-- LifeLink Blood Donation & Healthcare Management Schema (H2 / Standard SQL)

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
);

CREATE TABLE IF NOT EXISTS blood_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT,
    blood_group VARCHAR(10) NOT NULL,
    volume_ml INT NOT NULL DEFAULT 450,
    collected_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(150) NOT NULL,
    patient_name VARCHAR(120) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    units_required INT NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
