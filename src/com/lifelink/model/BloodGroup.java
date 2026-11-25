package com.lifelink.model;

import java.util.EnumSet;
import java.util.Set;

/**
 * ABO and Rh blood group definitions with red blood cell compatibility rules.
 */
public enum BloodGroup {
    A_POS("A+"),
    A_NEG("A-"),
    B_POS("B+"),
    B_NEG("B-"),
    AB_POS("AB+"),
    AB_NEG("AB-"),
    O_POS("O+"),
    O_NEG("O-");

    private final String label;

    BloodGroup(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    @Override
    public String toString() {
        return label;
    }

    /**
     * Parses a display label (e.g., "O+") or enum name (e.g., "O_POS") into BloodGroup.
     */
    public static BloodGroup fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Blood group cannot be null");
        }
        String trimmed = value.trim().toUpperCase();
        for (BloodGroup bg : values()) {
            if (bg.label.equalsIgnoreCase(trimmed) || bg.name().equalsIgnoreCase(trimmed)) {
                return bg;
            }
        }
        throw new IllegalArgumentException("Unknown blood group: " + value);
    }

    /**
     * Returns all donor blood groups that can safely donate RBCs to this recipient group.
     */
    public Set<BloodGroup> getCompatibleDonorGroups() {
        return switch (this) {
            case O_NEG -> EnumSet.of(O_NEG);
            case O_POS -> EnumSet.of(O_NEG, O_POS);
            case A_NEG -> EnumSet.of(O_NEG, A_NEG);
            case A_POS -> EnumSet.of(O_NEG, O_POS, A_NEG, A_POS);
            case B_NEG -> EnumSet.of(O_NEG, B_NEG);
            case B_POS -> EnumSet.of(O_NEG, O_POS, B_NEG, B_POS);
            case AB_NEG -> EnumSet.of(O_NEG, A_NEG, B_NEG, AB_NEG);
            case AB_POS -> EnumSet.allOf(BloodGroup.class);
        };
    }

    public boolean canDonateTo(BloodGroup recipient) {
        return recipient != null && recipient.getCompatibleDonorGroups().contains(this);
    }
}
