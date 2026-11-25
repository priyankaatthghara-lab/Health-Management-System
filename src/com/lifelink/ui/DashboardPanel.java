package com.lifelink.ui;

import com.lifelink.exception.BloodBankException;
import com.lifelink.model.BloodGroup;
import com.lifelink.model.BloodRequest;
import com.lifelink.model.Donor;
import com.lifelink.service.BloodBankService;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingConstants;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.awt.GridLayout;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard view displaying live KPI metrics, blood group stock levels, and background audit alerts.
 */
public class DashboardPanel extends JPanel {
    private static final Color BG_LIGHT = new Color(248, 249, 252);
    private static final Color CARD_BG = Color.WHITE;
    private static final Color CRIMSON = new Color(185, 28, 28);
    private static final Color EMERALD = new Color(21, 128, 61);
    private static final Color AMBER = new Color(180, 83, 9);

    private final BloodBankService service;
    private final Runnable onNavigateToRequests;

    private final JLabel totalUnitsLabel = new JLabel("0", SwingConstants.CENTER);
    private final JLabel eligibleDonorsLabel = new JLabel("0", SwingConstants.CENTER);
    private final JLabel pendingRequestsLabel = new JLabel("0", SwingConstants.CENTER);
    private final JLabel criticalRequestsLabel = new JLabel("0", SwingConstants.CENTER);

    private final Map<BloodGroup, JLabel> groupCountLabels = new EnumMap<>(BloodGroup.class);
    private final Map<BloodGroup, JLabel> groupStatusLabels = new EnumMap<>(BloodGroup.class);
    private final JTextArea auditLogArea = new JTextArea(6, 40);

    public DashboardPanel(BloodBankService service, Runnable onNavigateToRequests) {
        this.service = service;
        this.onNavigateToRequests = onNavigateToRequests;
        setLayout(new BorderLayout(16, 16));
        setBackground(BG_LIGHT);
        setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));

        add(buildKpiRow(), BorderLayout.NORTH);
        add(buildStockGrid(), BorderLayout.CENTER);
        add(buildAuditPanel(), BorderLayout.SOUTH);
    }

    private JPanel buildKpiRow() {
        JPanel row = new JPanel(new GridLayout(1, 4, 12, 12));
        row.setOpaque(false);
        row.add(createKpiCard("Available Blood Units", totalUnitsLabel, CRIMSON));
        row.add(createKpiCard("Eligible Donors", eligibleDonorsLabel, EMERALD));
        row.add(createKpiCard("Pending Requests", pendingRequestsLabel, new Color(29, 78, 216)));
        row.add(createKpiCard("Critical Requests", criticalRequestsLabel, AMBER));
        return row;
    }

    private JPanel createKpiCard(String title, JLabel valueLabel, Color accent) {
        JPanel card = new JPanel(new BorderLayout(4, 6));
        card.setBackground(CARD_BG);
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(226, 232, 240)),
                BorderFactory.createEmptyBorder(14, 14, 14, 14)
        ));

        JLabel titleLbl = new JLabel(title, SwingConstants.CENTER);
        titleLbl.setFont(new Font("Segoe UI", Font.BOLD, 13));
        titleLbl.setForeground(new Color(71, 85, 105));

        valueLabel.setFont(new Font("Segoe UI", Font.BOLD, 28));
        valueLabel.setForeground(accent);

        card.add(titleLbl, BorderLayout.NORTH);
        card.add(valueLabel, BorderLayout.CENTER);
        return card;
    }

    private JPanel buildStockGrid() {
        JPanel wrapper = new JPanel(new BorderLayout(8, 8));
        wrapper.setOpaque(false);

        JLabel heading = new JLabel("Live Blood Inventory by Group (Available & Non-Expired)");
        heading.setFont(new Font("Segoe UI", Font.BOLD, 15));
        heading.setForeground(new Color(30, 41, 59));
        wrapper.add(heading, BorderLayout.NORTH);

        JPanel grid = new JPanel(new GridLayout(2, 4, 12, 12));
        grid.setOpaque(false);

        for (BloodGroup bg : BloodGroup.values()) {
            JPanel card = new JPanel(new BorderLayout(4, 4));
            card.setBackground(CARD_BG);
            card.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(new Color(226, 232, 240)),
                    BorderFactory.createEmptyBorder(12, 12, 12, 12)
            ));

            JLabel groupLbl = new JLabel(bg.getLabel(), SwingConstants.CENTER);
            groupLbl.setFont(new Font("Segoe UI", Font.BOLD, 20));
            groupLbl.setForeground(CRIMSON);

            JLabel countLbl = new JLabel("0 units", SwingConstants.CENTER);
            countLbl.setFont(new Font("Segoe UI", Font.BOLD, 16));
            countLbl.setForeground(new Color(15, 23, 42));

            JLabel statusLbl = new JLabel("CHECKING...", SwingConstants.CENTER);
            statusLbl.setFont(new Font("Segoe UI", Font.PLAIN, 11));

            groupCountLabels.put(bg, countLbl);
            groupStatusLabels.put(bg, statusLbl);

            card.add(groupLbl, BorderLayout.NORTH);
            card.add(countLbl, BorderLayout.CENTER);
            card.add(statusLbl, BorderLayout.SOUTH);
            grid.add(card);
        }

        wrapper.add(grid, BorderLayout.CENTER);
        return wrapper;
    }

    private JPanel buildAuditPanel() {
        JPanel panel = new JPanel(new BorderLayout(8, 8));
        panel.setBackground(CARD_BG);
        panel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(226, 232, 240)),
                BorderFactory.createEmptyBorder(10, 12, 10, 12)
        ));

        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);
        JLabel title = new JLabel("Background Monitor & Triage Alerts (Multithreaded Sync)");
        title.setFont(new Font("Segoe UI", Font.BOLD, 13));

        JPanel btnBar = new JPanel();
        btnBar.setOpaque(false);
        JButton refreshBtn = new JButton("Refresh Now");
        refreshBtn.addActionListener(e -> refreshData());
        JButton triageBtn = new JButton("Open Request Triage");
        triageBtn.addActionListener(e -> {
            if (onNavigateToRequests != null) {
                onNavigateToRequests.run();
            }
        });
        btnBar.add(refreshBtn);
        btnBar.add(triageBtn);

        top.add(title, BorderLayout.WEST);
        top.add(btnBar, BorderLayout.EAST);

        auditLogArea.setEditable(false);
        auditLogArea.setFont(new Font("Consolas", Font.PLAIN, 12));
        auditLogArea.setBackground(new Color(248, 250, 252));

        panel.add(top, BorderLayout.NORTH);
        panel.add(new JScrollPane(auditLogArea), BorderLayout.CENTER);
        return panel;
    }

    public void refreshData() {
        try {
            Map<BloodGroup, Integer> stock = service.getStockSummary();
            int totalUnits = 0;
            for (BloodGroup bg : BloodGroup.values()) {
                int count = stock.getOrDefault(bg, 0);
                totalUnits += count;
                groupCountLabels.get(bg).setText(count + (count == 1 ? " unit" : " units"));
                JLabel statusLbl = groupStatusLabels.get(bg);
                if (count == 0) {
                    statusLbl.setText("OUT OF STOCK");
                    statusLbl.setForeground(CRIMSON);
                } else if (count < BloodBankService.LOW_STOCK_THRESHOLD) {
                    statusLbl.setText("LOW STOCK");
                    statusLbl.setForeground(AMBER);
                } else {
                    statusLbl.setText("HEALTHY");
                    statusLbl.setForeground(EMERALD);
                }
            }

            List<Donor> donors = service.getAllDonors();
            long eligibleCount = donors.stream().filter(Donor::isEligibleToDonate).count();

            List<BloodRequest> requests = service.getAllRequestsPrioritized();
            long pendingCount = requests.stream()
                    .filter(r -> r.getStatus() == BloodRequest.Status.PENDING)
                    .count();
            long criticalCount = requests.stream()
                    .filter(r -> r.getStatus() == BloodRequest.Status.PENDING
                            && r.getUrgency() == BloodRequest.Urgency.CRITICAL)
                    .count();

            totalUnitsLabel.setText(String.valueOf(totalUnits));
            eligibleDonorsLabel.setText(eligibleCount + " / " + donors.size());
            pendingRequestsLabel.setText(String.valueOf(pendingCount));
            criticalRequestsLabel.setText(String.valueOf(criticalCount));
        } catch (BloodBankException e) {
            JOptionPane.showMessageDialog(this, e.getMessage(), "Dashboard Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public void appendAuditReport(BloodBankService.AuditReport report) {
        String time = report.checkedAt().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        String lowGroups = report.lowStockGroups().isEmpty()
                ? "None"
                : report.lowStockGroups().stream().map(BloodGroup::getLabel).reduce((a, b) -> a + ", " + b).orElse("");
        String line = String.format("[%s] Audit OK | Newly Expired: %d | Critical Pending: %d | Low Stock: %s%n",
                time, report.newlyExpiredUnits(), report.criticalPendingRequests(), lowGroups);
        auditLogArea.insert(line, 0);
        refreshData();
    }
}
