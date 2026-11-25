package com.lifelink.model;

import com.lifelink.exception.IneligibleDonorException;
import com.lifelink.service.Eligible;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Represents a registered blood donor.
 * Extends Person and implements Eligible for medical & cooldown validation.
 */
public class Donor extends Person implements Eligible {
    public static final int MIN_AGE = 18;
    public static final int MAX_AGE = 65;
    public static final double MIN_WEIGHT_KG = 50.0;
    public static final long COOLDOWN_DAYS = 90;

    private double weightKg;
    private LocalDate lastDonationDate;
    private int totalDonations;
    private boolean available;

    public Donor(int id, String fullName, int age, String phone, String city,
                 BloodGroup bloodGroup, double weightKg, LocalDate lastDonationDate,
                 int totalDonations, boolean available) {
        super(id, fullName, age, phone, city, bloodGroup);
        this.weightKg = weightKg;
        this.lastDonationDate = lastDonationDate;
        this.totalDonations = totalDonations;
        this.available = available;
    }

    public double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(double weightKg) {
        this.weightKg = weightKg;
    }

    public LocalDate getLastDonationDate() {
        return lastDonationDate;
    }

    public void setLastDonationDate(LocalDate lastDonationDate) {
        this.lastDonationDate = lastDonationDate;
    }

    public int getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(int totalDonations) {
        this.totalDonations = totalDonations;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    @Override
    public boolean isEligibleToDonate() {
        try {
            validateEligibility();
            return true;
        } catch (IneligibleDonorException e) {
            return false;
        }
    }

    @Override
    public void validateEligibility() throws IneligibleDonorException {
        if (!available) {
            throw new IneligibleDonorException("Donor is currently marked unavailable.");
        }
        if (getAge() < MIN_AGE || getAge() > MAX_AGE) {
            throw new IneligibleDonorException(
                    String.format("Donor age (%d) must be between %d and %d years.", getAge(), MIN_AGE, MAX_AGE));
        }
        if (weightKg < MIN_WEIGHT_KG) {
            throw new IneligibleDonorException(
                    String.format("Donor weight (%.1f kg) must be at least %.1f kg.", weightKg, MIN_WEIGHT_KG));
        }
        if (lastDonationDate != null) {
            long daysSinceLast = ChronoUnit.DAYS.between(lastDonationDate, LocalDate.now());
            if (daysSinceLast < COOLDOWN_DAYS) {
                long remaining = COOLDOWN_DAYS - daysSinceLast;
                throw new IneligibleDonorException(
                        String.format("Cooldown active: %d day(s) remaining before next donation.", remaining));
            }
        }
    }

    @Override
    public String getEligibilityRemarks() {
        try {
            validateEligibility();
            return "Eligible to donate";
        } catch (IneligibleDonorException e) {
            return e.getMessage();
        }
    }

    @Override
    public String getRoleSummary() {
        return String.format("Blood Donor [%s] - %d donation(s) - %s",
                getBloodGroup().getLabel(), totalDonations, getEligibilityRemarks());
    }
}
