package com.lifelink.exception;

/**
 * Base checked exception for all domain and database errors in LifeLink.
 */
public class BloodBankException extends Exception {
    public BloodBankException(String message) {
        super(message);
    }

    public BloodBankException(String message, Throwable cause) {
        super(message, cause);
    }
}
