package com.lifelink.ui;

import com.lifelink.service.BloodBankService;
import com.lifelink.service.InventorySyncWorker;

import javax.swing.BorderFactory;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;

/**
 * Main application window for LifeLink Blood Donation & Healthcare Management Platform.
 */
public class MainFrame extends JFrame {
    private final DashboardPanel dashboardPanel;
    private final DonorPanel donorPanel;
    private final InventoryPanel inventoryPanel;
    private final RequestPanel requestPanel;
    private final InventorySyncWorker syncWorker;

    public MainFrame(BloodBankService service) {
        super("LifeLink — Blood Donation & Healthcare Management Platform");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(1080, 720);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        JTabbedPane tabs = new JTabbedPane();
        tabs.setFont(new Font("Segoe UI", Font.BOLD, 13));

        Runnable refreshAll = this::refreshAllPanels;
        dashboardPanel = new DashboardPanel(service, () -> tabs.setSelectedIndex(3));
        donorPanel = new DonorPanel(service, refreshAll);
        inventoryPanel = new InventoryPanel(service, refreshAll);
        requestPanel = new RequestPanel(service, refreshAll);

        tabs.addTab("Dashboard", dashboardPanel);
        tabs.addTab("Donors & Eligibility", donorPanel);
        tabs.addTab("Blood Inventory", inventoryPanel);
        tabs.addTab("Hospital Requests", requestPanel);

        add(buildHeader(), BorderLayout.NORTH);
        add(tabs, BorderLayout.CENTER);

        syncWorker = new InventorySyncWorker(service, report -> {
            dashboardPanel.appendAuditReport(report);
            inventoryPanel.refreshTable();
        });
        syncWorker.start();

        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                syncWorker.shutdown();
            }
        });
    }

    private JPanel buildHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(new Color(153, 27, 27));
        header.setBorder(BorderFactory.createEmptyBorder(12, 18, 12, 18));

        JLabel title = new JLabel("LifeLink | Blood Donation & Healthcare Management");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("Segoe UI", Font.BOLD, 18));

        JLabel badge = new JLabel("JDBC Embedded H2  |  Sync Thread Active");
        badge.setForeground(new Color(254, 226, 226));
        badge.setFont(new Font("Segoe UI", Font.PLAIN, 12));

        header.add(title, BorderLayout.WEST);
        header.add(badge, BorderLayout.EAST);
        return header;
    }

    private void refreshAllPanels() {
        dashboardPanel.refreshData();
        donorPanel.refreshTable();
        inventoryPanel.refreshTable();
        requestPanel.refreshTable();
    }
}
