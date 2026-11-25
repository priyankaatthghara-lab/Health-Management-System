package com.lifelink.exception;

/**
 * Thrown when requested blood units cannot be fulfilled from available compatible stock.
 */
public class InsufficientStockException extends BloodBankException {
    public InsufficientStockException(String message) {
        super(message);
    }
}
