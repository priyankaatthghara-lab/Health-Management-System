package com.lifelink.ui;

import com.lifelink.exception.BloodBankException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.BloodRequest;
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
import javax.swing.ListSelectionModel;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Hospital blood request submission and urgency-prioritized fulfillment panel.
 */
public class RequestPanel extends JPanel {
    private static final DateTimeFormatter TS_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final BloodBankService service;
    private final Runnable onDataChanged;

    private final JTextField hospitalField = new JTextField(15);
    private final JTextField patientField = new JTextField(14);
    private final JComboBox<BloodGroup> groupBox = new JComboBox<>(BloodGroup.values());
    private final JTextField unitsField = new JTextField("1", 4);
    private final JComboBox<BloodRequest.Urgency> urgencyBox = new JComboBox<>(BloodRequest.Urgency.values());

    private final DefaultTableModel tableModel;
    private final JTable requestTable;

    public RequestPanel(BloodBankService service, Runnable onDataChanged) {
        this.service = service;
        this.onDataChanged = onDataChanged;

        setLayout(new BorderLayout(12, 12));
        setBorder(BorderFactory.createEmptyBorder(14, 14, 14, 14));

        add(buildRequestForm(), BorderLayout.NORTH);

        String[] cols = {"Req ID", "Hospital", "Patient", "Blood Group", "Units", "Urgency", "Status", "Requested At"};
        tableModel = new DefaultTableModel(cols, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        requestTable = new JTable(tableModel);
        requestTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        requestTable.setRowHeight(24);
        add(new JScrollPane(requestTable), BorderLayout.CENTER);

        add(buildActionBar(), BorderLayout.SOUTH);
        refreshTable();
    }

    private JPanel buildRequestForm() {
        JPanel form = new JPanel(new GridBagLayout());
        form.setBorder(BorderFactory.createTitledBorder("Submit Hospital Blood Request"));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(4, 6, 4, 6);
        gbc.anchor = GridBagConstraints.WEST;

        gbc.gridx = 0; gbc.gridy = 0; form.add(new JLabel("Hospital:"), gbc);
        gbc.gridx = 1; form.add(hospitalField, gbc);
        gbc.gridx = 2; form.add(new JLabel("Patient:"), gbc);
        gbc.gridx = 3; form.add(patientField, gbc);
        gbc.gridx = 4; form.add(new JLabel("Blood Group:"), gbc);
        gbc.gridx = 5; form.add(groupBox, gbc);

        gbc.gridx = 0; gbc.gridy = 1; form.add(new JLabel("Units:"), gbc);
        gbc.gridx = 1; form.add(unitsField, gbc);
        gbc.gridx = 2; form.add(new JLabel("Urgency:"), gbc);
        gbc.gridx = 3; form.add(urgencyBox, gbc);

        JButton submitBtn = new JButton("Submit Request");
        submitBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        submitBtn.addActionListener(e -> handleSubmitRequest());
        gbc.gridx = 4; gbc.gridy = 1; gbc.gridwidth = 2;
        form.add(submitBtn, gbc);

        return form;
    }

    private JPanel buildActionBar() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 6));

        JButton fulfillBtn = new JButton("Fulfill Selected (Auto-Match Compatible FEFO)");
        fulfillBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        fulfillBtn.addActionListener(e -> handleFulfill());

        JButton cancelBtn = new JButton("Cancel Selected");
        cancelBtn.addActionListener(e -> handleCancel());

        JButton refreshBtn = new JButton("Refresh");
        refreshBtn.addActionListener(e -> refreshTable());

        bar.add(fulfillBtn);
        bar.add(cancelBtn);
        bar.add(refreshBtn);
        return bar;
    }

    private void handleSubmitRequest() {
        try {
            int units = Integer.parseInt(unitsField.getText().trim());
            BloodGroup bg = (BloodGroup) groupBox.getSelectedItem();
            BloodRequest.Urgency urgency = (BloodRequest.Urgency) urgencyBox.getSelectedItem();

            BloodRequest req = service.submitRequest(
                    hospitalField.getText(),
                    patientField.getText(),
                    bg,
                    units,
                    urgency
            );
            hospitalField.setText("");
            patientField.setText("");
            unitsField.setText("1");

            JOptionPane.showMessageDialog(this,
                    "Blood request #" + req.getId() + " submitted (" + urgency + ").",
                    "Request Submitted", JOptionPane.INFORMATION_MESSAGE);
            refreshTable();
            onDataChanged.run();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Enter a valid integer for Units.",
                    "Validation Error", JOptionPane.WARNING_MESSAGE);
        } catch (BloodBankException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void handleFulfill() {
        int row = requestTable.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Select a PENDING request to fulfill.",
                    "No Selection", JOptionPane.WARNING_MESSAGE);
            return;
        }
        int reqId = (int) tableModel.getValueAt(row, 0);
        try {
            List<BloodUnit> issued = service.fulfillRequest(reqId);
            String unitIds = issued.stream()
                    .map(u -> "#" + u.getId() + " (" + u.getBloodGroup().getLabel() + ")")
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            JOptionPane.showMessageDialog(this,
                    "Request #" + reqId + " fulfilled!\nIssued compatible units: " + unitIds,
                    "Fulfilled", JOptionPane.INFORMATION_MESSAGE);
            refreshTable();
            onDataChanged.run();
        } catch (BloodBankException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(),
                    "Fulfillment Blocked", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void handleCancel() {
        int row = requestTable.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Select a request to cancel.",
                    "No Selection", JOptionPane.WARNING_MESSAGE);
            return;
        }
        int reqId = (int) tableModel.getValueAt(row, 0);
        try {
            service.cancelRequest(reqId);
            refreshTable();
            onDataChanged.run();
        } catch (BloodBankException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public void refreshTable() {
        try {
            List<BloodRequest> requests = service.getAllRequestsPrioritized();
            tableModel.setRowCount(0);
            for (BloodRequest r : requests) {
                tableModel.addRow(new Object[]{
                        r.getId(),
                        r.getHospitalName(),
                        r.getPatientName(),
                        r.getBloodGroup().getLabel(),
                        r.getUnitsRequired(),
                        r.getUrgency(),
                        r.getStatus(),
                        r.getRequestedAt().format(TS_FMT)
                });
            }
        } catch (BloodBankException e) {
            JOptionPane.showMessageDialog(this, e.getMessage(), "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
