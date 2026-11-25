package com.lifelink.service;

import com.lifelink.dao.DatabaseManager;
import com.lifelink.dao.DonorDAO;
import com.lifelink.dao.InventoryDAO;
import com.lifelink.dao.RequestDAO;
import com.lifelink.exception.BloodBankException;
import com.lifelink.exception.InsufficientStockException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.BloodRequest;
import com.lifelink.model.BloodUnit;
import com.lifelink.model.Donor;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;
import java.util.function.Predicate;

/**
 * Core service layer coordinating donors, inventory, requests, and thread-safe stock operations.
 */
public class BloodBankService {
    public static final int LOW_STOCK_THRESHOLD = 2;
    public static final int DEFAULT_SHELF_LIFE_DAYS = 42;

    private final DatabaseManager dbManager;
    private final DonorDAO donorDAO;
    private final InventoryDAO inventoryDAO;
    private final RequestDAO requestDAO;

    // Shared synchronization lock for inventory & request fulfillment
    private final Object stockLock = new Object();
    private Map<BloodGroup, Integer> cachedStock = new EnumMap<>(BloodGroup.class);

    public BloodBankService(DatabaseManager dbManager) {
        this.dbManager = dbManager;
        this.donorDAO = new DonorDAO(dbManager);
        this.inventoryDAO = new InventoryDAO(dbManager);
        this.requestDAO = new RequestDAO(dbManager);
        for (BloodGroup bg : BloodGroup.values()) {
            cachedStock.put(bg, 0);
        }
    }

    /**
     * Generic utility demonstrating Java Generics & Collections:
     * Indexes any list of Identifiable<Integer> entities by their ID.
     */
    public <T extends Identifiable<Integer>> Map<Integer, T> indexById(List<T> items) {
        Map<Integer, T> index = new HashMap<>();
        for (T item : items) {
            if (item.getId() != null) {
                index.put(item.getId(), item);
            }
        }
        return index;
    }

    /**
     * Generic filter helper using Predicate<T> and Collections.
     */
    public <T> List<T> filterItems(List<T> items, Predicate<T> predicate) {
        List<T> result = new ArrayList<>();
        for (T item : items) {
            if (predicate.test(item)) {
                result.add(item);
            }
        }
        return result;
    }

    public Donor registerDonor(String name, int age, String phone, String city,
                               BloodGroup bloodGroup, double weightKg) throws BloodBankException {
        if (name == null || name.isBlank()) {
            throw new BloodBankException("Donor name cannot be empty.");
        }
        if (phone == null || phone.isBlank()) {
            throw new BloodBankException("Phone number cannot be empty.");
        }
        Donor donor = new Donor(0, name.trim(), age, phone.trim(), city.trim(),
                bloodGroup, weightKg, null, 0, true);
        donor.validateEligibility();
        return donorDAO.save(donor);
    }

    public List<Donor> getAllDonors() throws BloodBankException {
        return donorDAO.findAll();
    }

    public List<Donor> findEligibleDonorsFor(BloodGroup recipientGroup) throws BloodBankException {
        Set<BloodGroup> compatible = recipientGroup.getCompatibleDonorGroups();
        return filterItems(donorDAO.findAll(),
                d -> d.isEligibleToDonate() && compatible.contains(d.getBloodGroup()));
    }

    /**
     * Thread-safe recording of a new donation: validates donor eligibility,
     * updates donor record, and adds a 450 ml unit to blood_inventory.
     */
    public BloodUnit recordDonation(int donorId, int volumeMl) throws BloodBankException {
        synchronized (stockLock) {
            Donor donor = donorDAO.findById(donorId)
                    .orElseThrow(() -> new BloodBankException("Donor not found with ID: " + donorId));
            donor.validateEligibility();

            LocalDate today = LocalDate.now();
            LocalDate expiry = today.plusDays(DEFAULT_SHELF_LIFE_DAYS);

            BloodUnit unit = new BloodUnit(0, donor.getId(), donor.getBloodGroup(),
                    volumeMl, today, expiry, BloodUnit.Status.AVAILABLE);
            BloodUnit saved = inventoryDAO.save(unit);

            donor.setLastDonationDate(today);
            donor.setTotalDonations(donor.getTotalDonations() + 1);
            donorDAO.update(donor);

            refreshStockCacheLocked();
            return saved;
        }
    }

    public BloodUnit addManualUnit(BloodGroup bloodGroup, int volumeMl, LocalDate collectedDate)
            throws BloodBankException {
        synchronized (stockLock) {
            BloodUnit unit = new BloodUnit(0, null, bloodGroup, volumeMl,
                    collectedDate, collectedDate.plusDays(DEFAULT_SHELF_LIFE_DAYS),
                    BloodUnit.Status.AVAILABLE);
            BloodUnit saved = inventoryDAO.save(unit);
            refreshStockCacheLocked();
            return saved;
        }
    }

    public List<BloodUnit> getAllInventory() throws BloodBankException {
        return inventoryDAO.findAll();
    }

    public Map<BloodGroup, Integer> getStockSummary() throws BloodBankException {
        synchronized (stockLock) {
            refreshStockCacheLocked();
            return new EnumMap<>(cachedStock);
        }
    }

    public BloodRequest submitRequest(String hospitalName, String patientName,
                                      BloodGroup bloodGroup, int unitsRequired,
                                      BloodRequest.Urgency urgency) throws BloodBankException {
        if (hospitalName == null || hospitalName.isBlank() || patientName == null || patientName.isBlank()) {
            throw new BloodBankException("Hospital name and patient name are required.");
        }
        if (unitsRequired <= 0) {
            throw new BloodBankException("Units required must be at least 1.");
        }
        BloodRequest request = new BloodRequest(0, hospitalName.trim(), patientName.trim(),
                bloodGroup, unitsRequired, urgency, BloodRequest.Status.PENDING, LocalDateTime.now());
        return requestDAO.save(request);
    }

    /**
     * Returns pending requests ordered by triage priority (CRITICAL > HIGH > NORMAL, then FIFO)
     * using java.util.PriorityQueue.
     */
    public List<BloodRequest> getAllRequestsPrioritized() throws BloodBankException {
        List<BloodRequest> all = requestDAO.findAll();
        PriorityQueue<BloodRequest> pendingQueue = new PriorityQueue<>();
        List<BloodRequest> completed = new ArrayList<>();

        for (BloodRequest req : all) {
            if (req.getStatus() == BloodRequest.Status.PENDING) {
                pendingQueue.offer(req);
            } else {
                completed.add(req);
            }
        }

        List<BloodRequest> ordered = new ArrayList<>();
        while (!pendingQueue.isEmpty()) {
            ordered.add(pendingQueue.poll());
        }
        ordered.addAll(completed);
        return ordered;
    }

    /**
     * Thread-safe, transactional fulfillment of a blood request using ABO/Rh compatibility
     * and FEFO (First Expired, First Out) unit selection.
     */
    public List<BloodUnit> fulfillRequest(int requestId) throws BloodBankException {
        synchronized (stockLock) {
            BloodRequest req = requestDAO.findById(requestId)
                    .orElseThrow(() -> new BloodBankException("Request not found: " + requestId));
            if (req.getStatus() != BloodRequest.Status.PENDING) {
                throw new BloodBankException("Request #" + requestId + " is already " + req.getStatus());
            }

            Set<BloodGroup> compatible = req.getBloodGroup().getCompatibleDonorGroups();

            try (Connection conn = dbManager.getConnection()) {
                conn.setAutoCommit(false);
                try {
                    List<BloodUnit> matchedUnits = inventoryDAO.findCompatibleAvailableUnits(
                            conn, compatible, req.getUnitsRequired());

                    if (matchedUnits.size() < req.getUnitsRequired()) {
                        conn.rollback();
                        throw new InsufficientStockException(String.format(
                                "Insufficient compatible stock for %s: needed %d unit(s), found %d.",
                                req.getBloodGroup().getLabel(), req.getUnitsRequired(), matchedUnits.size()));
                    }

                    for (BloodUnit unit : matchedUnits) {
                        inventoryDAO.markUnitIssued(conn, unit.getId());
                        unit.setStatus(BloodUnit.Status.ISSUED);
                    }
                    requestDAO.updateStatus(conn, req.getId(), BloodRequest.Status.FULFILLED);
                    conn.commit();

                    refreshStockCacheLocked();
                    return matchedUnits;
                } catch (SQLException e) {
                    conn.rollback();
                    throw new BloodBankException("Transaction failed while fulfilling request: " + e.getMessage(), e);
                } finally {
                    conn.setAutoCommit(true);
                }
            } catch (SQLException e) {
                throw new BloodBankException("Database connection error: " + e.getMessage(), e);
            }
        }
    }

    public void cancelRequest(int requestId) throws BloodBankException {
        BloodRequest req = requestDAO.findById(requestId)
                .orElseThrow(() -> new BloodBankException("Request not found: " + requestId));
        req.setStatus(BloodRequest.Status.CANCELLED);
        requestDAO.update(req);
    }

    /**
     * Executed periodically by InventorySyncWorker (and on-demand) under synchronization.
     */
    public AuditReport runExpiryAndStockAudit() throws BloodBankException {
        synchronized (stockLock) {
            int expiredNow = inventoryDAO.markExpiredUnits(LocalDate.now());
            refreshStockCacheLocked();

            List<BloodGroup> lowStockGroups = new ArrayList<>();
            for (Map.Entry<BloodGroup, Integer> entry : cachedStock.entrySet()) {
                if (entry.getValue() < LOW_STOCK_THRESHOLD) {
                    lowStockGroups.add(entry.getKey());
                }
            }

            int criticalPending = 0;
            for (BloodRequest r : requestDAO.findAll()) {
                if (r.getStatus() == BloodRequest.Status.PENDING
                        && r.getUrgency() == BloodRequest.Urgency.CRITICAL) {
                    criticalPending++;
                }
            }

            return new AuditReport(expiredNow, lowStockGroups, criticalPending, LocalDateTime.now());
        }
    }

    private void refreshStockCacheLocked() throws BloodBankException {
        cachedStock = inventoryDAO.getAvailableCountsByGroup();
    }

    public record AuditReport(
            int newlyExpiredUnits,
            List<BloodGroup> lowStockGroups,
            int criticalPendingRequests,
            LocalDateTime checkedAt
    ) {
    }
}
