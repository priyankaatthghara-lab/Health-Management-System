package com.lifelink.model;

/**
 * Represents a hospital patient requiring a blood transfusion.
 * Demonstrates inheritance and polymorphism alongside Donor.
 */
public class PatientRecipient extends Person {
    private String hospitalName;
    private String ward;

    public PatientRecipient(int id, String fullName, int age, String phone, String city,
                            BloodGroup bloodGroup, String hospitalName, String ward) {
        super(id, fullName, age, phone, city, bloodGroup);
        this.hospitalName = hospitalName;
        this.ward = ward;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getWard() {
        return ward;
    }

    public void setWard(String ward) {
        this.ward = ward;
    }

    @Override
    public String getRoleSummary() {
        return String.format("Recipient [%s] at %s (%s)",
                getBloodGroup().getLabel(), hospitalName, ward);
    }
}
