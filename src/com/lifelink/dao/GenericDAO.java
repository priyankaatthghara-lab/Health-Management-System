package com.lifelink.dao;

import com.lifelink.exception.BloodBankException;

import java.util.List;
import java.util.Optional;

/**
 * Generic DAO contract defining standard CRUD operations for JDBC repositories.
 *
 * @param <T>  Domain entity type
 * @param <ID> Primary key type
 */
public interface GenericDAO<T, ID> {
    T save(T entity) throws BloodBankException;

    Optional<T> findById(ID id) throws BloodBankException;

    List<T> findAll() throws BloodBankException;

    void update(T entity) throws BloodBankException;

    void deleteById(ID id) throws BloodBankException;
}
