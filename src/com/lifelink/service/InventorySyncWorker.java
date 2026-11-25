package com.lifelink.service;

import com.lifelink.exception.BloodBankException;

import javax.swing.SwingUtilities;
import java.util.function.Consumer;

/**
 * Background daemon thread demonstrating Multithreading & Synchronization.
 * Periodically audits blood inventory expiry and low-stock thresholds,
 * then safely dispatches updates to the Swing Event Dispatch Thread.
 */
public class InventorySyncWorker extends Thread {
    private static final long POLL_INTERVAL_MS = 15_000L;

    private final BloodBankService service;
    private final Consumer<BloodBankService.AuditReport> onAuditComplete;
    private volatile boolean running = true;

    public InventorySyncWorker(BloodBankService service,
                               Consumer<BloodBankService.AuditReport> onAuditComplete) {
        super("LifeLink-InventorySyncWorker");
        this.service = service;
        this.onAuditComplete = onAuditComplete;
        setDaemon(true);
    }

    public void shutdown() {
        running = false;
        interrupt();
    }

    @Override
    public void run() {
        while (running) {
            try {
                BloodBankService.AuditReport report = service.runExpiryAndStockAudit();
                if (onAuditComplete != null) {
                    SwingUtilities.invokeLater(() -> onAuditComplete.accept(report));
                }
                Thread.sleep(POLL_INTERVAL_MS);
            } catch (InterruptedException e) {
                if (!running) {
                    break;
                }
            } catch (BloodBankException e) {
                System.err.println("[InventorySyncWorker] Audit error: " + e.getMessage());
            }
        }
    }
}
