package com.lifelink.model;

import com.lifelink.service.Identifiable;

import java.time.LocalDateTime;

/**
 * Represents a hospital blood request, prioritized by clinical urgency.
 */
public class BloodRequest implements Identifiable<Integer>, Comparable<BloodRequest> {
    public enum Urgency {
        CRITICAL(1),
        HIGH(2),
        NORMAL(3);

        private final int rank;

        Urgency(int rank) {
            this.rank = rank;
        }

        public int getRank() {
            return rank;
        }
    }

    public enum Status {
        PENDING,
        FULFILLED,
        CANCELLED
    }

    private int id;
    private String hospitalName;
    private String patientName;
    private BloodGroup bloodGroup;
    private int unitsRequired;
    private Urgency urgency;
    private Status status;
    private LocalDateTime requestedAt;

    public BloodRequest(int id, String hospitalName, String patientName, BloodGroup bloodGroup,
                        int unitsRequired, Urgency urgency, Status status, LocalDateTime requestedAt) {
        this.id = id;
        this.hospitalName = hospitalName;
        this.patientName = patientName;
        this.bloodGroup = bloodGroup;
        this.unitsRequired = unitsRequired;
        this.urgency = urgency;
        this.status = status;
        this.requestedAt = requestedAt;
    }

    @Override
    public Integer getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public int getUnitsRequired() {
        return unitsRequired;
    }

    public void setUnitsRequired(int unitsRequired) {
        this.unitsRequired = unitsRequired;
    }

    public Urgency getUrgency() {
        return urgency;
    }

    public void setUrgency(Urgency urgency) {
        this.urgency = urgency;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    @Override
    public int compareTo(BloodRequest other) {
        int urgencyCmp = Integer.compare(this.urgency.getRank(), other.urgency.getRank());
        if (urgencyCmp != 0) {
            return urgencyCmp;
        }
        return this.requestedAt.compareTo(other.requestedAt);
    }
}
