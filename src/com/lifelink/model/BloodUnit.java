package com.lifelink.model;

import com.lifelink.service.Identifiable;

import java.time.LocalDate;

/**
 * Represents a single unit (bag) of donated blood in inventory.
 */
public class BloodUnit implements Identifiable<Integer> {
    public enum Status {
        AVAILABLE,
        RESERVED,
        ISSUED,
        EXPIRED
    }

    private int id;
    private Integer donorId;
    private BloodGroup bloodGroup;
    private int volumeMl;
    private LocalDate collectedDate;
    private LocalDate expiryDate;
    private Status status;

    public BloodUnit(int id, Integer donorId, BloodGroup bloodGroup, int volumeMl,
                     LocalDate collectedDate, LocalDate expiryDate, Status status) {
        this.id = id;
        this.donorId = donorId;
        this.bloodGroup = bloodGroup;
        this.volumeMl = volumeMl;
        this.collectedDate = collectedDate;
        this.expiryDate = expiryDate;
        this.status = status;
    }

    @Override
    public Integer getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Integer getDonorId() {
        return donorId;
    }

    public void setDonorId(Integer donorId) {
        this.donorId = donorId;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public int getVolumeMl() {
        return volumeMl;
    }

    public void setVolumeMl(int volumeMl) {
        this.volumeMl = volumeMl;
    }

    public LocalDate getCollectedDate() {
        return collectedDate;
    }

    public void setCollectedDate(LocalDate collectedDate) {
        this.collectedDate = collectedDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public boolean isExpiredOn(LocalDate date) {
        return expiryDate != null && expiryDate.isBefore(date);
    }
}
