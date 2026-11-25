# LifeLink — Blood Donation & Healthcare Management Platform

LifeLink is a desktop **Java Swing + JDBC** healthcare management platform focused on **blood bank operations, donor eligibility screening, blood inventory lifecycle tracking, ABO/Rh compatibility matching, and urgency-based hospital request triage**.

It runs **100% locally and free** using an embedded pure-Java H2 SQL database (`lib/h2-2.2.224.jar`) — no paid APIs, cloud accounts, or external database servers required.

---

## Key Features

- **Live Dashboard**: Real-time KPI cards (Available Units, Eligible Donors, Pending & Critical Requests), 8-group blood stock monitor (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), and live background audit logs.
- **Donor Registry & Medical Eligibility**: Register donors with automated validation (age 18–65, weight >= 50 kg, 90-day donation cooldown), filter compatible donors for any recipient blood group, and record 450 ml donations.
- **Blood Inventory & Compatibility Checker**: Track collected/expiry dates, run FEFO (First Expired, First Out) matching, sweep expired units, and check ABO/Rh donor-recipient compatibility.
- **Hospital Request Triage**: Prioritize requests by urgency (`CRITICAL > HIGH > NORMAL`) using a `PriorityQueue`, and fulfill requests atomically via JDBC transactions.
- **Background Sync Worker**: A daemon thread (`InventorySyncWorker`) periodically audits expired blood units and low-stock thresholds under thread synchronization and updates the Swing UI safely.

---

## Repository Structure

```text
healthcaremanagementjava/
├── README.md                                  # Setup, requirements, architecture, and run guide
├── .gitignore                                 # Excludes compiled classes and local DB files
├── run.bat                                    # One-click Windows compile & launch script
├── run.sh                                     # One-click Linux/macOS compile & launch script
├── lib/
│   └── h2-2.2.224.jar                         # Embedded pure-Java H2 JDBC driver
├── sql/
│   └── schema.sql                             # SQL DDL schema reference
└── src/
    └── com/lifelink/
        ├── Main.java                          # Application entry point
        ├── exception/
        │   ├── BloodBankException.java        # Base checked exception
        │   ├── IneligibleDonorException.java  # Donor medical/cooldown exception
        │   └── InsufficientStockException.java# Inventory shortfall exception
        ├── model/
        │   ├── Person.java                    # Abstract base class (Inheritance & Polymorphism)
        │   ├── Donor.java                     # Extends Person, implements Eligible
        │   ├── PatientRecipient.java          # Extends Person (hospital recipient)
        │   ├── BloodGroup.java                # ABO/Rh enum + compatibility matrix
        │   ├── BloodUnit.java                 # Inventory blood bag entity
        │   └── BloodRequest.java              # Urgency-comparable hospital request
        ├── dao/
        │   ├── DatabaseManager.java           # JDBC DriverManager + schema & seed initializer
        │   ├── GenericDAO.java                # Generic CRUD interface <T, ID>
        │   ├── DonorDAO.java                  # JDBC CRUD for donors
        │   ├── InventoryDAO.java              # JDBC CRUD, expiry sweep & FEFO queries
        │   └── RequestDAO.java                # JDBC CRUD for hospital requests
        ├── service/
        │   ├── Identifiable.java              # Generic ID contract
        │   ├── Eligible.java                  # Eligibility verification interface
        │   ├── BloodBankService.java          # Business logic, Generics, Sync & Transactions
        │   └── InventorySyncWorker.java       # Background multithreaded monitor
        └── ui/
            ├── MainFrame.java                 # Main Swing window & tabbed navigation
            ├── DashboardPanel.java            # KPIs, stock grid & audit feed
            ├── DonorPanel.java                # Donor registration & donation recording
            ├── InventoryPanel.java            # Inventory table & compatibility checker
            └── RequestPanel.java              # Hospital request submission & fulfillment
```

---

## Requirements

- **Java Development Kit (JDK) 17 or higher** (tested on OpenJDK 21)
- No Maven, Gradle, or external MySQL/PostgreSQL installation required (`lib/h2-2.2.224.jar` is included).

---

## How to Run

### Option 1: One-Click Script
**Windows (Command Prompt / PowerShell):**
```bat
run.bat
```

**Linux / macOS:**
```bash
chmod +x run.sh
./run.sh
```

### Option 2: Manual `javac` & `java` Commands
From the repository root:

**Windows:**
```powershell
mkdir out -Force
Get-ChildItem -Recurse -Filter *.java src | ForEach-Object { $_.FullName } | Out-File -Encoding ascii sources.txt
javac -cp "lib\h2-2.2.224.jar" -d out "@sources.txt"
Remove-Item sources.txt
java -cp "out;lib\h2-2.2.224.jar" com.lifelink.Main
```

**Linux / macOS:**
```bash
mkdir -p out
find src -name "*.java" > sources.txt
javac -cp "lib/h2-2.2.224.jar" -d out @sources.txt
rm -f sources.txt
java -cp "out:lib/h2-2.2.224.jar" com.lifelink.Main
```

On first launch, `DatabaseManager` automatically creates the local H2 database in `./data/lifelink_db` and seeds sample donors, blood units, and hospital requests.

---

## Rubric Alignment

1. **OOP Implementation (Polymorphism, Inheritance, Exception Handling, Interfaces)**:
   - Inheritance: `Person` -> `Donor`, `PatientRecipient`
   - Polymorphism: `getRoleSummary()` overridden across `Person` subclasses; `GenericDAO<T, ID>` implementations
   - Interfaces: `Eligible`, `Identifiable<ID>`, `GenericDAO<T, ID>`
   - Custom Checked Exceptions: `BloodBankException`, `IneligibleDonorException`, `InsufficientStockException`
2. **Collections & Generics**:
   - `GenericDAO<T, ID>`, generic `indexById` and `filterItems` helpers, `EnumMap<BloodGroup, Integer>`, `EnumSet<BloodGroup>`, `PriorityQueue<BloodRequest>`, `List`.
3. **Multithreading & Synchronization**:
   - `InventorySyncWorker` daemon thread + `synchronized (stockLock)` in `BloodBankService` + `SwingUtilities.invokeLater` UI updates.
4. **Database Operations & JDBC Connectivity**:
   - Dedicated `dao` package (`DatabaseManager`, `DonorDAO`, `InventoryDAO`, `RequestDAO`) using `DriverManager`, `PreparedStatement`, `ResultSet`, `try-with-resources`, and atomic JDBC transactions (`setAutoCommit(false)` / `commit()` / `rollback()`).
