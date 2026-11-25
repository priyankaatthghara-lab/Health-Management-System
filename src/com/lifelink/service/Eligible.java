package com.lifelink.service;

import com.lifelink.exception.IneligibleDonorException;

/**
 * Interface defining medical eligibility verification for blood donation.
 */
public interface Eligible {
    boolean isEligibleToDonate();

    void validateEligibility() throws IneligibleDonorException;

    String getEligibilityRemarks();
}
