package com.lifelink.model;

import com.lifelink.service.Identifiable;

/**
 * Abstract base class representing a person in the healthcare & blood donation system.
 * Demonstrates inheritance and runtime polymorphism across Donor and PatientRecipient.
 */
public abstract class Person implements Identifiable<Integer> {
    private int id;
    private String fullName;
    private int age;
    private String phone;
    private String city;
    private BloodGroup bloodGroup;

    protected Person(int id, String fullName, int age, String phone, String city, BloodGroup bloodGroup) {
        this.id = id;
        this.fullName = fullName;
        this.age = age;
        this.phone = phone;
        this.city = city;
        this.bloodGroup = bloodGroup;
    }

    @Override
    public Integer getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    /**
     * Polymorphic summary of the person's role in the platform.
     */
    public abstract String getRoleSummary();

    /**
     * Polymorphic formatted profile card.
     */
    public String getProfileDetails() {
        return String.format("%s (%s) | Age: %d | City: %s | Phone: %s",
                fullName, bloodGroup.getLabel(), age, city, phone);
    }
}
