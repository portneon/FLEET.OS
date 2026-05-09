# FleetOS: The Enterprise Fleet Management Knowledge Base

## 1. System Overview
FleetOS is a next-generation, high-performance fleet management system designed for logistics, transit, and organizational transport operations. It integrates real-time asset tracking, automated financial auditing, and modular transit planning into a single, cohesive ecosystem.

### Core Philosophy
- **Visibility**: Real-time status of every vehicle, driver, and trip.
- **Accuracy**: Automated financial ledgers, payroll forensics, and telemetry-driven analytics.
- **Efficiency**: Streamlined route planning and stop sequencing.
- **Aesthetics**: Premium, minimalist design focused on clarity and high-contrast typography.

---

## 2. Role-Based Access Control (RBAC)
FleetOS enforces strict organizational boundaries and role-based permissions:

| Role | Responsibilities |
| :--- | :--- |
| **ADMIN** | Full system access, organization management, and high-level configuration. |
| **DISPATCHER** | Manages vehicle manifests, schedules trips, and monitors live operations. |
| **FINANCE** | Audits ledgers, manages invoices, processes payroll, and tracks receivables/payables. |
| **ROUTE PLANNER** | Designs routes, defines stops, and optimizes transit paths. |
| **DRIVER** | Executes trips, updates status via telemetry, and manages personal wallet/loans. |
| **PASSENGER** | Books trips and tracks scheduled transit services. |

---

## 3. Functional Modules

### 3.1 Fleet & Asset Management
The "Active Manifest" serves as the central registry for all physical assets.
- **Vehicle Types**: Heavy Duty Truck (TRUCK), Cargo Van (VAN), Passenger Bus (BUS).
- **Key Attributes**: VIN (Unique 17-character ID), License Plate, Seating Capacity (for buses), and Operational Status (IDLE, ON_TRIP, MAINTENANCE).
- **Asset Lifecycle**: Tracking from purchase price and insurance costs to residual value and expected life years.

### 3.2 Transit & Operations
The backbone of FleetOS involves moving assets through defined spatial paths.
- **Routes & Stops**: A Route is a sequence of defined Stops. Each stop has precise GPS coordinates (Latitude/Longitude).
- **Trips**: The execution of a Route by a specific Vehicle and Driver.
- **Trip Status**: SCHEDULED → IN_PROGRESS → COMPLETED/CANCELLED.

### 3.3 Financial Intelligence
FleetOS features a robust "Money Jar" (Financial Ledger) that automates organizational accounting.
- **Invoicing**: Automated generation for customers (Individual or Business) based on trip bookings or contract services.
- **Payments**: Multi-method support (Cash, Card, Bank Transfer, UPI) with status tracking (SUCCESS, FAILED, REFUNDED).
- **Expense Categories**: Fuel, Maintenance, Salary, Insurance, Tax, Toll, Rent, Parking, Loan Payment.
- **Payroll Forensics**: Calculation of base salary, bonuses, and deductions with audit trails.
- **Receivables & Payables**: Real-time tracking of pending dues from customers and obligations to vendors.

### 3.4 Staff & Driver Performance
- **Driver Profiles**: Includes license details, experience metrics, and performance ratings.
- **Financial Autonomy**: Drivers have integrated Wallets for daily earnings and can request Loans managed within the platform.

---

## 4. Step-by-Step Workflows

### 4.1 How to Register a New Vehicle
1. Navigate to the **Fleet Operations** dashboard.
2. Click on **"Register Vehicle"** to open the registration manifest.
3. Select the **Vehicle Type** (Truck, Van, or Bus).
4. Enter the **VIN** and **License Plate**.
5. (For Buses) Specify the **Seating Capacity**.
6. Submit to add the unit to the **Active Manifest**.

### 4.2 How to Manage Driver Payroll
1. Access the **Finance Hub** and navigate to the **Payroll** tab.
2. Review the list of drivers and their generated payroll records for the current month.
3. Apply any **Bonuses** or **Deductions** based on performance or incident reports.
4. Click **"Confirm Payment"** to update the ledger and mark the payroll as PAID.

### 4.3 How to Create a Transit Route
1. Open the **Route Planner** module.
2. Define a **Route Name** (e.g., "North Corridor Express").
3. Add **Stops** from the global stop registry.
4. Arrange stops in the correct **Sequence** to define the path.
5. Save the route to make it available for trip scheduling.

---

## 5. Technical Specifications

### Architecture (The "Brain")
- **Backend**: Node.js & Express with TypeScript for type-safe operations.
- **Database**: MySQL managed via **Prisma ORM** for high-integrity relational mapping.
- **Frontend**: Next.js (React) with Tailwind CSS for premium UI styling.

### Key Data Entities
- **Organization**: The top-level container for all data.
- **User/Profile**: Authentication and role-specific metadata.
- **Telemetry**: Time-series GPS data for real-time vehicle tracking.
- **Ledger/Transaction**: Atomic records of every financial movement within the system.

---

## 6. Frequently Asked Questions (FAQ)

**Q: Why can't I see any vehicles in my manifest?**
A: Ensure you are logged in with an account associated with the correct Organization. Check the "Live Registry" header to verify your organizational context.

**Q: How is "Net Profit" calculated on the dashboard?**
A: FleetOS uses the formula: `Net Profit = (Total Paid Invoices) - (Total Expenses + Fuel Costs + Maintenance Costs + Paid Payroll)`.

**Q: Can I track a vehicle in real-time?**
A: Yes. Vehicles on an active trip stream **Telemetry** data (Latitude/Longitude), which is visualized on the Dispatcher's map view.

**Q: What happens if a payment fails?**
A: The system marks the Payment as FAILED and keeps the associated Invoice status as PENDING or OVERDUE, alerting the Finance module to follow up.
