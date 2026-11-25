package com.lifelink.ui;

import com.lifelink.exception.BloodBankException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.BloodUnit;
import com.lifelink.service.BloodBankService;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Blood inventory management, expiry sweep, and ABO/Rh compatibility checker panel.
 */
public class InventoryPanel extends JPanel {
    private final BloodBankService service;
    private final Runnable onDataChanged;

    private final JComboBox<BloodGroup> addGroupBox = new JComboBox<>(BloodGroup.values());
    private final JTextField volumeField = new JTextField("450", 5);
    private final JComboBox<BloodGroup> compatRecipientBox = new JComboBox<>(BloodGroup.values());
    private final JLabel compatResultLabel = new JLabel(" ");

    private final DefaultTableModel tableModel;

    public InventoryPanel(BloodBankService service, Runnable onDataChanged) {
        this.service = service;
        this.onDataChanged = onDataChanged;

        setLayout(new BorderLayout(12, 12));
        setBorder(BorderFactory.createEmptyBorder(14, 14, 14, 14));

        add(buildTopControls(), BorderLayout.NORTH);

        String[] cols = {"Unit ID", "Blood Group", "Volume (ml)", "Donor ID", "Collected Date", "Expiry Date", "Status"};
        tableModel = new DefaultTableModel(cols, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        JTable table = new JTable(tableModel);
        table.setRowHeight(24);
        add(new JScrollPane(table), BorderLayout.CENTER);

        add(buildCompatibilityBar(), BorderLayout.SOUTH);
        refreshTable();
        updateCompatibilityLabel();
    }

    private JPanel buildTopControls() {
        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 6));
        top.setBorder(BorderFactory.createTitledBorder("Add Blood Unit / Inventory Maintenance"));

        top.add(new JLabel("Blood Group:"));
        top.add(addGroupBox);
        top.add(new JLabel("Volume (ml):"));
        top.add(volumeField);

        JButton addBtn = new JButton("Add Unit");
        addBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        addBtn.addActionListener(e -> handleAddUnit());
        top.add(addBtn);

        JButton sweepBtn = new JButton("Run Expiry Sweep");
        sweepBtn.addActionListener(e -> handleExpirySweep());
        top.add(sweepBtn);

        JButton refreshBtn = new JButton("Refresh");
        refreshBtn.addActionListener(e -> refreshTable());
        top.add(refreshBtn);

        return top;
    }

    private JPanel buildCompatibilityBar() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 8));
        bar.setBorder(BorderFactory.createTitledBorder("ABO / Rh Compatibility & Live Stock Checker"));

        bar.add(new JLabel("Recipient Blood Group:"));
        compatRecipientBox.addActionListener(e -> updateCompatibilityLabel());
        bar.add(compatRecipientBox);

        compatResultLabel.setFont(new Font("Segoe UI", Font.BOLD, 12));
        bar.add(compatResultLabel);
        return bar;
    }

    private void handleAddUnit() {
        try {
            BloodGroup bg = (BloodGroup) addGroupBox.getSelectedItem();
            int vol = Integer.parseInt(volumeField.getText().trim());
            if (vol <= 0) {
                throw new NumberFormatException();
            }
            BloodUnit unit = service.addManualUnit(bg, vol, LocalDate.now());
            JOptionPane.showMessageDialog(this,
                    "Added unit #" + unit.getId() + " (" + bg.getLabel() + ").",
                    "Unit Added", JOptionPane.INFORMATION_MESSAGE);
            refreshTable();
            updateCompatibilityLabel();
            onDataChanged.run();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Enter a valid positive volume in ml.",
                    "Validation Error", JOptionPane.WARNING_MESSAGE);
        } catch (BloodBankException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void handleExpirySweep() {
        try {
            BloodBankService.AuditReport report = service.runExpiryAndStockAudit();
            JOptionPane.showMessageDialog(this,
                    "Expiry sweep complete. Newly marked EXPIRED: " + report.newlyExpiredUnits(),
                    "Audit Complete", JOptionPane.INFORMATION_MESSAGE);
            refreshTable();
            updateCompatibilityLabel();
            onDataChanged.run();
        } catch (BloodBankException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Audit Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void updateCompatibilityLabel() {
        BloodGroup recipient = (BloodGroup) compatRecipientBox.getSelectedItem();
        if (recipient == null) {
            return;
        }
        Set<BloodGroup> compatible = recipient.getCompatibleDonorGroups();
        try {
            Map<BloodGroup, Integer> stock = service.getStockSummary();
            int totalCompatibleUnits = 0;
            for (BloodGroup g : compatible) {
                totalCompatibleUnits += stock.getOrDefault(g, 0);
            }
            String groupsStr = compatible.stream()
                    .map(BloodGroup::getLabel)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            compatResultLabel.setText(String.format("Compatible Donors: [%s] | Total Available: %d unit(s)",
                    groupsStr, totalCompatibleUnits));
        } catch (BloodBankException e) {
            compatResultLabel.setText("Error checking stock");
        }
    }

    public void refreshTable() {
        try {
            List<BloodUnit> units = service.getAllInventory();
            tableModel.setRowCount(0);
            for (BloodUnit u : units) {
                tableModel.addRow(new Object[]{
                        u.getId(),
                        u.getBloodGroup().getLabel(),
                        u.getVolumeMl(),
                        u.getDonorId() == null ? "External" : u.getDonorId(),
                        u.getCollectedDate(),
                        u.getExpiryDate(),
                        u.getStatus()
                });
            }
            updateCompatibilityLabel();
        } catch (BloodBankException e) {
            JOptionPane.showMessageDialog(this, e.getMessage(), "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
