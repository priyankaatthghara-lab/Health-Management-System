package com.lifelink.service;

/**
 * Generic contract for domain entities that have a typed primary identifier.
 *
 * @param <ID> Type of the entity identifier.
 */
public interface Identifiable<ID> {
    ID getId();
}
