package com.lifelink.exception;

/**
 * Thrown when a donor does not meet medical or cooldown eligibility criteria.
 */
public class IneligibleDonorException extends BloodBankException {
    public IneligibleDonorException(String message) {
        super(message);
    }
}
