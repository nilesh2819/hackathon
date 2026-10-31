# RECLAIM AI: The Intelligent Subscription Value Exchange

> *"Pay for what you need. Reuse what you already own. Never waste subscription value."*

**RECLAIM AI** is an enterprise-grade subscription management and value optimization platform designed for **Brightloop Software**. Unlike traditional billing tools that merely send invoices, RECLAIM AI features a deep intelligence layer that actively detects idle subscription capacity, calculates real cost-to-value metrics, identifies cross-departmental sharing opportunities, and provides an interactive Value Exchange clearinghouse.

---

## 🌟 Signature Innovations

1. **Usage-to-Value Intelligence**:
   - Calculates purchased seats, active users, unutilized seats, and true cost-per-active-seat.
   - Computes a dynamic **Subscription Value Score (0–100)**.
   - Generates rightsizing and seat reduction recommendations.
   - Supports both verified live telemetry and simulated demo benchmarks.

2. **Subscription Sharing Intelligence**:
   - Enforces provider-specific sharing eligibility policies (e.g. ERP is single-tenant locked; DevCloud and Marketing Cloud support multi-seat pooling).
   - Detects surplus departments (e.g. Marketing holding 20 idle seats).
   - Identifies deficit units requiring additional seats (e.g. Engineering requiring 15 seats).
   - Calculates cross-departmental cost reallocation and potential savings.

3. **Subscription Value Exchange**:
   - Interactive 3-column clearinghouse: **Available Capacity**, **Resource Demand**, and the **AI Matching Engine**.
   - Admin approval workflow: preview suggested reallocations, view source/destination departments, verify avoided expenditure, and approve transfers with full immutable audit trails.

4. **AI-Powered Future Waste Predictor**:
   - Projects 90-day unutilized capacity, renewal waste, and savings potential across three scenarios: **Best Case**, **Expected Case**, and **Worst Case**.
   - Interactive parameter sliders: modify seat growth rate, dormancy risk, and optimization effort in real-time.

5. **AI Business Assistant**:
   - Conversational AI querying live relational tables (subscriptions, invoices, departments, products) without fabricating numbers.
   - Instant answers for MRR, overdue invoices, unused seats, and upcoming expirations.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, React Router v6, Axios.
- **Backend**: Node.js, Express.js, REST APIs, JWT Authentication, bcryptjs.
- **Database**: 
  - **PostgreSQL**: Production-grade relational schema with indexes, foreign keys, and constraints (`backend/database/schema.sql`).
  - **pgAdmin 4**: Full compatibility and query import support.
  - **Embedded SQLite Dual-Mode**: High-performance zero-configuration engine included so the entire application runs immediately without requiring an active PostgreSQL daemon.
- **Document Engine**: PDFKit for official branded PDF invoices with instant downloads.

---

## 🔐 Demonstration Credentials

| Role | Name | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Eleanor Vance | `admin@brightloop.io` | `Admin@123#` | Full system access, Value Exchange approvals, AI intelligence, Settings |
| **Staff** | Marcus Brody | `staff@brightloop.io` | `Staff@123#` | Customers, Quotations, Subscriptions, Invoices, Payments, Analytics |
| **Customer** | Sarah Connor (Acme) | `customer@acme.com` | `Customer@123#` | Personal subscriptions, Invoices, Usage insights, Payment history |

*Tip: The Login page and Navigation bar include **One-Click Persona Switcher Pills** to instantly switch between Admin, Staff, and Customer views during demonstrations.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+)
- (Optional) PostgreSQL & pgAdmin 4

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Initialize and seed the Brightloop Software database (50 customers, 100 subscriptions, 10 products, 15 plans)
npm run seed

# Run automated integration test suite (tests all 11 flows)
npm test

# Start the backend server (runs on http://localhost:5000)
npm start
```

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server (runs on http://localhost:3000)
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🗄️ PostgreSQL & pgAdmin 4 Configuration

To run RECLAIM AI directly against PostgreSQL using pgAdmin 4:

1. Open **pgAdmin 4**.
2. Right-click **Databases** > **Create** > **Database...**, and enter name: `reclaim_ai_db`.
3. Select `reclaim_ai_db`, open the **Query Tool** (Alt + Shift + Q).
4. Open the SQL file: `backend/database/schema.sql`.
5. Click **Execute / Refresh (F5)** to create all 21 relational tables and indexes.
6. Open `backend/.env` and configure:
   ```env
   USE_POSTGRES=true
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=your_postgres_password
   PGDATABASE=reclaim_ai_db
   ```
7. Run the seed script:
   ```bash
   node database/seed.js
   ```
8. Restart the backend server. It will display:
   `📊 Active Database Engine: [POSTGRES]`.

---

## 🎬 End-to-End Demonstration Scenario

Follow this live demonstration script:

1. **Sign In**:
   - Go to `http://localhost:3000`. Click the **Admin** one-click demo pill.
2. **Review Dashboard & Usage Intelligence**:
   - Observe **Platform Utilization (71%)** and **Platform Value Score (72/100)**.
   - Notice the top banner alerting: *Marketing holds 20 unused DevCloud seats, while Engineering needs 15 seats*.
3. **Inspect Usage-to-Value**:
   - Navigate to **Usage-to-Value**. Observe the bar chart showing active vs. idle seats and the calculated idle waste (INR 16,24,500 across platform).
4. **Subscription Value Exchange Execution**:
   - Navigate to **Value Exchange**.
   - Review the three sections:
     - **Available Capacity**: Marketing (20 idle DevCloud seats).
     - **Resource Demand**: Engineering (Requisition for 15 DevCloud seats).
     - **AI Matching Engine**: Match `#REQ-2026-EX-001` with Avoided Capital: **INR 60,000/month**.
   - Click **Approve Transfer**.
   - Notice the status updates to `Completed`, Marketing unused seats reduce to 5, Engineering receives the 15 seats, and an immutable audit log entry is recorded!
5. **Verify with AI Business Assistant**:
   - Navigate to **AI Assistant**.
   - Click the prompt pill: *"Which department wastes the most subscription expenditure?"*
   - Notice the AI accurately answers: *Marketing now holds only 5 unused seats*, reflecting the 15-seat transfer with zero hallucination!
6. **Future Waste Predictor**:
   - Navigate to **Waste Predictor**.
   - Adjust the **Optimization Effort** slider from 50% to 85% and watch the 90-day savings projection update dynamically.
7. **Invoices & PDF Generation**:
   - Navigate to **Invoices**. Click the download icon on any invoice to generate and view the official PDF invoice with tax breakdowns.
   - Click **Generate Recurring Invoice** on a subscription already billed this month to verify the **Duplicate Billing Protection** rule in action!
