package com.lifelink;

import com.lifelink.dao.DatabaseManager;
import com.lifelink.exception.BloodBankException;
import com.lifelink.service.BloodBankService;
import com.lifelink.ui.MainFrame;

import javax.swing.JOptionPane;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;

/**
 * Application entry point for LifeLink Blood Donation & Healthcare Management Platform.
 */
public class Main {
    public static void main(String[] args) {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {
            // Fall back to default Swing Look & Feel
        }

        DatabaseManager dbManager = new DatabaseManager();
        try {
            dbManager.initializeSchemaAndSeed();
        } catch (BloodBankException e) {
            JOptionPane.showMessageDialog(null,
                    "Database initialization failed:\n" + e.getMessage(),
                    "Startup Error", JOptionPane.ERROR_MESSAGE);
            System.exit(1);
        }

        BloodBankService service = new BloodBankService(dbManager);
        SwingUtilities.invokeLater(() -> {
            MainFrame frame = new MainFrame(service);
            frame.setVisible(true);
        });
    }
}
