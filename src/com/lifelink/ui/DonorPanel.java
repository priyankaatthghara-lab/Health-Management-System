package com.lifelink.ui;

import com.lifelink.exception.BloodBankException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.BloodUnit;
import com.lifelink.model.Donor;
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
import javax.swing.ListSelectionModel;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.util.List;

/**
 * Donor registry, eligibility verification, and donation recording panel.
 */
public class DonorPanel extends JPanel {
    private final BloodBankService service;
    private final Runnable onDataChanged;

    private final JTextField nameField = new JTextField(14);
    private final JTextField ageField = new JTextField(5);
    private final JTextField phoneField = new JTextField(12);
    private final JTextField cityField = new JTextField(12);
    private final JTextField weightField = new JTextField(6);
    private final JComboBox<BloodGroup> bloodGroupBox = new JComboBox<>(BloodGroup.values());
    private final JComboBox<String> filterBox = new JComboBox<>();

    private final DefaultTableModel tableModel;
    private final JTable donorTable;

    public DonorPanel(BloodBankService service, Runnable onDataChanged) {
        this.service = service;
        this.onDataChanged = onDataChanged;

        setLayout(new BorderLayout(12, 12));
        setBorder(BorderFactory.createEmptyBorder(14, 14, 14, 14));

        add(buildRegistrationForm(), BorderLayout.NORTH);

        String[] cols = {"ID", "Full Name", "Blood Group", "Age", "Weight (kg)", "City", "Phone", "Donations", "Eligibility"};
        tableModel = new DefaultTableModel(cols, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        donorTable = new JTable(tableModel);
        donorTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        donorTable.setRowHeight(24);
        add(new JScrollPane(donorTable), BorderLayout.CENTER);

        add(buildActionBar(), BorderLayout.SOUTH);
        refreshTable();
    }

    private JPanel buildRegistrationForm() {
        JPanel form = new JPanel(new GridBagLayout());
        form.setBorder(BorderFactory.createTitledBorder("Register New Blood Donor"));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(4, 6, 4, 6);
        gbc.anchor = GridBagConstraints.WEST;

        gbc.gridx = 0; gbc.gridy = 0; form.add(new JLabel("Full Name:"), gbc);
        gbc.gridx = 1; form.add(nameField, gbc);
        gbc.gridx = 2; form.add(new JLabel("Blood Group:"), gbc);
        gbc.gridx = 3; form.add(bloodGroupBox, gbc);
        gbc.gridx = 4; form.add(new JLabel("Age (18-65):"), gbc);
        gbc.gridx = 5; form.add(ageField, gbc);

        gbc.gridx = 0; gbc.gridy = 1; form.add(new JLabel("Phone:"), gbc);
        gbc.gridx = 1; form.add(phoneField, gbc);
        gbc.gridx = 2; form.add(new JLabel("City:"), gbc);
        gbc.gridx = 3; form.add(cityField, gbc);
        gbc.gridx = 4; form.add(new JLabel("Weight (>=50 kg):"), gbc);
        gbc.gridx = 5; form.add(weightField, gbc);

        JButton registerBtn = new JButton("Register Donor");
        registerBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        registerBtn.addActionListener(e -> handleRegisterDonor());
        gbc.gridx = 6; gbc.gridy = 0; gbc.gridheight = 2;
        form.add(registerBtn, gbc);

        return form;
    }

    private JPanel buildActionBar() {
        JPanel bar = new JPanel(new BorderLayout());

        JPanel left = new JPanel(new FlowLayout(FlowLayout.LEFT));
        left.add(new JLabel("Filter Compatible Donors for Recipient:"));
        filterBox.addItem("ALL");
        for (BloodGroup bg : BloodGroup.values()) {
            filterBox.addItem(bg.getLabel());
        }
        filterBox.addActionListener(e -> refreshTable());
        left.add(filterBox);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton donateBtn = new JButton("Record Donation (450 ml)");
        donateBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        donateBtn.addActionListener(e -> handleRecordDonation());

        JButton refreshBtn = new JButton("Refresh");
        refreshBtn.addActionListener(e -> refreshTable());

        right.add(donateBtn);
        right.add(refreshBtn);

        bar.add(left, BorderLayout.WEST);
        bar.add(right, BorderLayout.EAST);
        return bar;
    }

    private void handleRegisterDonor() {
        try {
            int age = Integer.parseInt(ageField.getText().trim());
            double weight = Double.parseDouble(weightField.getText().trim());
            BloodGroup bg = (BloodGroup) bloodGroupBox.getSelectedItem();

            Donor saved = service.registerDonor(
                    nameField.getText(),
                    age,
                    phoneField.getText(),
                    cityField.getText(),
                    bg,
                    weight
            );

            nameField.setText("");
            ageField.setText("");
            phoneField.setText("");
            cityField.setText("");
            weightField.setText("");

            JOptionPane.showMessageDialog(this,
                    "Donor registered successfully (ID: " + saved.getId() + ").",
                    "Success", JOptionPane.INFORMATION_MESSAGE);
            refreshTable();
            onDataChanged.run();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this,
                    "Please enter valid numeric values for Age and Weight.",
                    "Validation Error", JOptionPane.WARNING_MESSAGE);
        } catch (BloodBankException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(),
                    "Eligibility / Registration Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void handleRecordDonation() {
        int row = donorTable.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Select a donor from the table first.",
                    "No Selection", JOptionPane.WARNING_MESSAGE);
            return;
        }
        int donorId = (int) tableModel.getValueAt(row, 0);
        try {
            BloodUnit unit = service.recordDonation(donorId, 450);
            JOptionPane.showMessageDialog(this,
                    String.format("Recorded 450 ml (%s) donation! Unit ID #%d expires on %s.",
                            unit.getBloodGroup().getLabel(), unit.getId(), unit.getExpiryDate()),
                    "Donation Recorded", JOptionPane.INFORMATION_MESSAGE);
            refreshTable();
            onDataChanged.run();
        } catch (BloodBankException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(),
                    "Cannot Record Donation", JOptionPane.ERROR_MESSAGE);
        }
    }

    public void refreshTable() {
        try {
            String selectedFilter = (String) filterBox.getSelectedItem();
            List<Donor> donors = (selectedFilter == null || "ALL".equals(selectedFilter))
                    ? service.getAllDonors()
                    : service.findEligibleDonorsFor(BloodGroup.fromString(selectedFilter));

            tableModel.setRowCount(0);
            for (Donor d : donors) {
                tableModel.addRow(new Object[]{
                        d.getId(),
                        d.getFullName(),
                        d.getBloodGroup().getLabel(),
                        d.getAge(),
                        d.getWeightKg(),
                        d.getCity(),
                        d.getPhone(),
                        d.getTotalDonations(),
                        d.getEligibilityRemarks()
                });
            }
        } catch (BloodBankException e) {
            JOptionPane.showMessageDialog(this, e.getMessage(), "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
