const bcrypt = require('bcryptjs');
const { query, initDatabase } = require('./db');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('🌱 Starting RECLAIM AI database seeding for Brightloop Software...');
  await initDatabase();

  // Create tables using schema.sql with clean comment stripping
  const rawSchema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf-8');
  const strippedSchema = rawSchema.replace(/--.*$/gm, '');
  const statements = strippedSchema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await query(statement);
    } catch (err) {
      if (!statement.toLowerCase().startsWith('drop table')) {
        console.warn('Notice executing schema statement:', err.message, '\nStatement:', statement.substring(0, 60));
      }
    }
  }
  console.log('✅ Schema tables verified.');

  // Password hashes (Complies with >8 chars, uppercase, lowercase, special char)
  const adminHash = bcrypt.hashSync('Admin@123#', 10);
  const staffHash = bcrypt.hashSync('Staff@123#', 10);
  const customerHash = bcrypt.hashSync('Customer@123#', 10);

  // 1. Insert Users
  await query(`
    INSERT INTO users (id, email, password_hash, full_name, role, phone) VALUES
    (1, 'admin@brightloop.io', $1, 'Eleanor Vance (Chief Admin)', 'admin', '+91 98765 43210'),
    (2, 'staff@brightloop.io', $2, 'Marcus Brody (Sales & Billing Staff)', 'staff', '+91 98765 43211'),
    (3, 'customer@acme.com', $3, 'Sarah Connor (VP Technology, Acme Corp)', 'customer', '+91 98765 43212'),
    (4, 'tech@novatech.io', $3, 'David Chen (IT Director, NovaTech)', 'customer', '+91 98765 43213'),
    (5, 'finance@zenith.com', $3, 'Rachel Green (Finance Lead, Zenith Media)', 'customer', '+91 98765 43214')
  `, [adminHash, staffHash, customerHash]);

  // 2. Insert Departments
  const departments = [
    ['Marketing', 'MKT', 'Sophie Taylor', 'sophie.taylor@brightloop.io', 120000.00],
    ['Engineering', 'ENG', 'Alex Rivera', 'alex.rivera@brightloop.io', 250000.00],
    ['Sales', 'SLS', 'Jordan Lee', 'jordan.lee@brightloop.io', 180000.00],
    ['Product Management', 'PRD', 'Elena Rostova', 'elena.rostova@brightloop.io', 150000.00],
    ['Human Resources', 'HR', 'Maya Patel', 'maya.patel@brightloop.io', 80000.00],
    ['Operations', 'OPS', 'Liam Gallagher', 'liam.gallagher@brightloop.io', 110000.00],
    ['Finance', 'FIN', 'Carlos Silva', 'carlos.silva@brightloop.io', 95000.00]
  ];

  for (let i = 0; i < departments.length; i++) {
    const d = departments[i];
    await query(
      `INSERT INTO departments (id, name, code, manager_name, manager_email, budget_allocated)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [i + 1, d[0], d[1], d[2], d[3], d[4]]
    );
  }

  // 3. Insert Taxes
  await query(`
    INSERT INTO taxes (id, name, rate_percent, is_compound, description) VALUES
    (1, 'GST Standard (18%)', 18.00, FALSE, 'Goods and Services Tax standard B2B rate'),
    (2, 'GST Reduced (12%)', 12.00, FALSE, 'Reduced rate for educational and non-profit tiers'),
    (3, 'VAT EU/UK (20%)', 20.00, FALSE, 'Value Added Tax for European enterprise clients'),
    (4, 'US State Sales Tax (8%)', 8.00, FALSE, 'Average US state digital software tax')
  `);

  // 4. Insert Discounts
  await query(`
    INSERT INTO discounts (id, code, name, type, value, min_purchase_amount, min_quantity, start_date, end_date, max_uses, times_used, applies_to) VALUES
    (1, 'ENTERPRISE20', 'Enterprise Volume Discount', 'percentage', 20.00, 50000.00, 25, '2026-01-01', '2026-12-31', 500, 18, 'all'),
    (2, 'GROWTH10', 'Early Growth 10% Off', 'percentage', 10.00, 10000.00, 5, '2026-01-01', '2026-12-31', 1000, 42, 'all'),
    (3, 'FLAT5000', 'New Quarter Flat ₹5,000 Off', 'fixed', 5000.00, 30000.00, 10, '2026-01-01', '2026-12-31', 200, 15, 'all'),
    (4, 'STARTUP15', 'Startup Ecosystem Grant', 'percentage', 15.00, 5000.00, 1, '2026-01-01', '2026-12-31', 300, 27, 'all')
  `);

  // 5. Insert 10 Products
  const products = [
    [1, 'Brightloop CRM Suite', 'BL-CRM-01', 'software', 4500.00, 1200.00, 'Comprehensive customer relations, pipeline tracking and leads automation.', 'Primary sales software'],
    [2, 'Brightloop ERP Enterprise', 'BL-ERP-02', 'software', 12000.00, 3500.00, 'All-in-one financial, manufacturing, supply chain and inventory platform.', 'Core enterprise engine'],
    [3, 'Brightloop Helpdesk Pro', 'BL-HLP-03', 'software', 2500.00, 600.00, 'Omnichannel ticketing, SLA tracking and customer satisfaction metrics.', 'Support module'],
    [4, 'Brightloop Marketing Cloud', 'BL-MKT-04', 'software', 6000.00, 1500.00, 'Automated campaigns, newsletter engine and audience analytics.', 'High sharing potential'],
    [5, 'Brightloop DevCloud Workspace', 'BL-DEV-05', 'software', 8500.00, 2000.00, 'Cloud IDE, CI/CD runners and high-memory container environments.', 'High seat reallocation potential'],
    [6, 'Brightloop HR & Payroll', 'BL-HRP-06', 'software', 3500.00, 900.00, 'Automated payroll disbursement, leave tracking and onboarding flows.', 'Organization wide'],
    [7, 'Brightloop Project Tracker', 'BL-PRJ-07', 'software', 2000.00, 500.00, 'Agile sprint boards, Gantt charts and cross-team roadmaps.', 'Departmental tool'],
    [8, 'Brightloop Analytics Intelligence', 'BL-AI-08', 'software', 7500.00, 1800.00, 'Predictive BI, automated metric alerting and executive dashboards.', 'Advanced analytics'],
    [9, 'Brightloop Dedicated Cloud Storage (1TB)', 'BL-STR-09', 'addon', 1500.00, 300.00, 'Enterprise encrypted storage with redundant multi-region backup.', 'Addon storage tier'],
    [10, 'Brightloop 24/7 Dedicated Support', 'BL-SUP-10', 'service', 5000.00, 1000.00, '15-minute SLA with dedicated technical account manager.', 'Service package']
  ];

  for (const p of products) {
    await query(`
      INSERT INTO products (id, name, code, type, sales_price, cost_price, description, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, p);
  }

  // 6. Insert Product Variants (e.g. Odoo brand adds 560 as requested in challenge prompt!)
  await query(`
    INSERT INTO product_variants (id, product_id, variant_name, attribute_name, attribute_value, price_extra) VALUES
    (1, 1, 'Brand: Odoo Integrated', 'Brand', 'Odoo Edition', 560.00),
    (2, 1, 'Brand: Brightloop Standard', 'Brand', 'Standard Edition', 0.00),
    (3, 2, 'Deployment: High Availability Multi-Region', 'Deployment', 'Multi-Region HA', 2500.00),
    (4, 5, 'Compute: GPU Accelerated Node', 'Compute', 'NVIDIA A10G Dedicated', 4200.00),
    (5, 8, 'Data Model: Real-Time Stream Analytics', 'Processing', 'Kafka Stream', 1800.00)
  `);

  // 7. Insert 15 Subscription Plans
  const plans = [
    [1, 1, 'CRM Monthly Starter', 'monthly', 4500.00, 1, '2026-01-01', null, 0, 1, 1],
    [2, 1, 'CRM Annual Growth (Best Value)', 'yearly', 48000.00, 5, '2026-01-01', null, 0, 1, 1],
    [3, 2, 'ERP Enterprise Monthly', 'monthly', 12000.00, 5, '2026-01-01', null, 0, 1, 1],
    [4, 2, 'ERP Enterprise Annual Contract', 'yearly', 125000.00, 10, '2026-01-01', null, 0, 1, 1],
    [5, 3, 'Helpdesk Daily On-Demand Sprint', 'daily', 200.00, 1, '2026-01-01', '2026-12-31', 1, 0, 1],
    [6, 3, 'Helpdesk Monthly Team', 'monthly', 2500.00, 3, '2026-01-01', null, 0, 1, 1],
    [7, 4, 'Marketing Cloud Weekly Growth Campaign', 'weekly', 1800.00, 1, '2026-01-01', null, 0, 1, 1],
    [8, 4, 'Marketing Cloud Monthly Scale', 'monthly', 6000.00, 5, '2026-01-01', null, 0, 1, 1],
    [9, 5, 'DevCloud Workspace Monthly Seat', 'monthly', 4000.00, 10, '2026-01-01', null, 0, 1, 1],
    [10, 5, 'DevCloud Annual Dedicated Pods', 'yearly', 42000.00, 15, '2026-01-01', null, 0, 1, 1],
    [11, 6, 'HR & Payroll Monthly Standard', 'monthly', 3500.00, 1, '2026-01-01', null, 0, 1, 1],
    [12, 7, 'Project Tracker Weekly Agile', 'weekly', 650.00, 2, '2026-01-01', null, 0, 1, 1],
    [13, 7, 'Project Tracker Monthly Team', 'monthly', 2000.00, 5, '2026-01-01', null, 0, 1, 1],
    [14, 8, 'Analytics Intelligence Monthly Enterprise', 'monthly', 7500.00, 2, '2026-01-01', null, 0, 1, 1],
    [15, 9, 'Cloud Storage 1TB Monthly Addon', 'monthly', 1500.00, 1, '2026-01-01', null, 0, 1, 1]
  ];

  for (const pl of plans) {
    await query(`
      INSERT INTO plans (id, product_id, name, billing_frequency, price, minimum_quantity, start_date, end_date, auto_close, can_pause, can_renew)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, pl);
  }

  // 8. Insert Sharing Eligibility Rules (Provider-specific policies)
  await query(`
    INSERT INTO sharing_eligibility (id, product_id, is_shareable, max_departments_share, min_reallocation_batch, terms) VALUES
    (1, 1, TRUE, 5, 2, 'CRM seats may be cross-assigned between Sales, Marketing and Support units.'),
    (2, 2, FALSE, 1, 1, 'ERP accounts are single-tenant compliance locked and cannot be multi-department shared without compliance audit.'),
    (3, 4, TRUE, 8, 5, 'Marketing Cloud multi-seat licenses support full inter-departmental pooling.'),
    (4, 5, TRUE, 10, 5, 'DevCloud seat capacity is poolable across Engineering, QA, Data Science, and Marketing analytics.'),
    (5, 7, TRUE, 6, 2, 'Project Tracker supports universal workspace reassignment.')
  `);

  // 9. Insert 50 Customers
  const customerNames = [
    ['Acme Global Technologies', 'Sarah Connor', 'sarah@acmemail.com', 'Bengaluru, Karnataka'],
    ['NovaTech Digital Systems', 'David Chen', 'dchen@novatech.io', 'Hyderabad, Telangana'],
    ['Zenith Media Networks', 'Rachel Green', 'rachel@zenithmedia.com', 'Mumbai, Maharashtra'],
    ['Quantum Logistics Ltd', 'Vikram Malhotra', 'vikram@quantumlogistics.in', 'Gurugram, Haryana'],
    ['Cobalt BioLabs & Pharma', 'Dr. Anita Roy', 'anita.roy@cobaltlabs.org', 'Pune, Maharashtra'],
    ['Apex Retail Solutions', 'Siddharth Nair', 'snair@apexretail.com', 'Chennai, Tamil Nadu'],
    ['Horizon Health Alliance', 'Priya Sharma', 'psharma@horizonhealth.co', 'Noida, Uttar Pradesh'],
    ['CloudScale Infrastructure', 'Arun Joshi', 'arun@cloudscale.net', 'Bengaluru, Karnataka'],
    ['OmniFlow Automations', 'Elena Gomez', 'egomez@omniflow.io', 'Mumbai, Maharashtra'],
    ['Nexus Fintech Labs', 'Karthik Rao', 'karthik@nexusfin.com', 'Bengaluru, Karnataka'],
    ['Starlight Interactive', 'Jessica Alba', 'jessica@starlight.co', 'Pune, Maharashtra'],
    ['Silverline Manufacturing', 'Rajesh Kulkarni', 'rkulkarni@silverline.in', 'Ahmedabad, Gujarat'],
    ['BluePeak Financial Services', 'Meera Varma', 'meera@bluepeakfin.com', 'Mumbai, Maharashtra'],
    ['Prism Data Insights', 'Rohan Sengupta', 'rohan@prismdata.ai', 'Kolkata, West Bengal'],
    ['Hyperion Robotics Inc', 'Tanya Deshmukh', 'tanya@hyperionrob.com', 'Bengaluru, Karnataka'],
    ['Vanguard Logistics Global', 'Gaurav Khanna', 'gkhanna@vanguardlog.com', 'Delhi, NCR'],
    ['Evergreen Sustainable Energy', 'Aditi Verma', 'aditi@evergreenpower.in', 'Jaipur, Rajasthan'],
    ['Solaria Solar Systems', 'Naveen Reddy', 'nreddy@solaria.co', 'Hyderabad, Telangana'],
    ['IronClad Cyber Defense', 'Deepak Mittal', 'dmittal@ironcladsec.com', 'Bengaluru, Karnataka'],
    ['AeroTech Engineering Works', 'Kavita Sundaram', 'ksundaram@aerotech.in', 'Chennai, Tamil Nadu'],
    ['MetroLink Express Delivery', 'Ankit Jain', 'ajain@metrolink.com', 'Mumbai, Maharashtra'],
    ['Beacon Education Tech', 'Smriti Iyer', 'smriti@beaconed.org', 'Kochi, Kerala'],
    ['Pinnacle Architecture & Design', 'Farhan Akhtar', 'farhan@pinnaclearch.com', 'New Delhi, Delhi'],
    ['CrestView Hospitality', 'Neha Saxena', 'neha@crestviewhotels.in', 'Goa, India'],
    ['Synergy Consulting Partners', 'Amitabh Basu', 'abasu@synergyconsult.com', 'Kolkata, West Bengal'],
    ['TerraFirma Agro Foods', 'Sunil Pawar', 'spawar@terrafirma.in', 'Nashik, Maharashtra'],
    ['Astra Satellite Analytics', 'Nandini Das', 'ndas@astrasat.space', 'Bengaluru, Karnataka'],
    ['Velocity Mobility Labs', 'Varun Kapoor', 'varun@velocitymobility.com', 'Pune, Maharashtra'],
    ['Zenon Supply Chain Inc', 'Divya Menon', 'divya@zenonscm.com', 'Coimbatore, Tamil Nadu'],
    ['Frontier AI Systems', 'Kunal Trivedi', 'kunal@frontieraitech.io', 'Hyderabad, Telangana'],
    ['Equinox Legal Advisors', 'Bhavna Aggarwal', 'baggarwal@equinoxlaw.in', 'New Delhi, Delhi'],
    ['Krypton Hardware Labs', 'Sameer Quadri', 'sameer@kryptonhw.com', 'Bengaluru, Karnataka'],
    ['UrbanNest Smart Living', 'Sneha Kapoor', 'sneha@urbannest.in', 'Gurugram, Haryana'],
    ['Optima Digital Agency', 'Mohit Bansal', 'mohit@optimadigital.co', 'Chandigarh, Punjab'],
    ['GlobalEdge Translations', 'Ritika Sen', 'ritika@globaledgetrans.com', 'Mumbai, Maharashtra'],
    ['TrueNorth Aviation', 'Capt. Rakesh Puri', 'rpuri@truenorthair.in', 'Mumbai, Maharashtra'],
    ['Helix Genomics Institute', 'Dr. Shweta Ghosh', 'sghosh@helixgenomics.res.in', 'Bengaluru, Karnataka'],
    ['EchoWave Communications', 'Tarun Singhania', 'tarun@echowave.in', 'Indore, Madhya Pradesh'],
    ['Strata Rock Mining Systems', 'Devendra Pandey', 'dpandey@stratamining.com', 'Bhubaneswar, Odisha'],
    ['Mirage Fashion Tech', 'Ananya Panday', 'ananya@miragefashion.in', 'Mumbai, Maharashtra'],
    ['NorthStar Maritime Logistics', 'Capt. Joy Mukherjee', 'jmukherjee@northstarmaritime.com', 'Visakhapatnam, AP'],
    ['Pulse Telehealth Networks', 'Dr. Alok Verma', 'averma@pulsetelehealth.com', 'Lucknow, Uttar Pradesh'],
    ['Vector Graphics Studio', 'Pooja Hegde', 'pooja@vectorgraphics.design', 'Bengaluru, Karnataka'],
    ['Triton Marine Equipments', 'Manoj Pillai', 'mpillai@tritonmarine.in', 'Kochi, Kerala'],
    ['Cortex Neural Software', 'Akash Bharadwaj', 'akash@cortexneural.ai', 'Hyderabad, Telangana'],
    ['Zest Quick-Commerce', 'Manish Gupta', 'mgupta@zestcommerce.in', 'Bengaluru, Karnataka'],
    ['Lumina Photonics Labs', 'Geeta Nambiar', 'gnambiar@luminaphotonics.com', 'Chennai, Tamil Nadu'],
    ['Apex Dynamics Automations', 'Harish Chawla', 'hchawla@apexdynamics.co', 'Faridabad, Haryana'],
    ['Proximo Cloud Analytics', 'Leena Mathew', 'leena@proximocloud.io', 'Thiruvananthapuram, Kerala'],
    ['Brightloop Demonstration Internal', 'Eleanor Vance', 'customer@acme.com', 'Bengaluru, Karnataka']
  ];

  for (let i = 0; i < customerNames.length; i++) {
    const c = customerNames[i];
    await query(`
      INSERT INTO customers (id, user_id, name, email, phone, company_name, billing_address, tax_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      i + 1,
      (i === 0 ? 3 : (i === 1 ? 4 : (i === 2 ? 5 : null))),
      c[1],
      c[2],
      `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
      c[0],
      c[3],
      `29AAACB${1000 + i}C1Z${(i % 9) + 1}`
    ]);
  }

  // 10. Insert 100 Subscriptions with realistic plans, seats, pricing
  console.log('Generating 100 subscriptions across customers and plans...');
  const subStatuses = ['active', 'active', 'active', 'active', 'active', 'confirmed', 'paused', 'draft', 'closed'];

  for (let i = 1; i <= 100; i++) {
    const subNum = `SUB-2026-${String(i).padStart(4, '0')}`;
    const custId = ((i - 1) % 50) + 1;
    const planId = ((i - 1) % 15) + 1;
    const status = (i === 1) ? 'active' : subStatuses[i % subStatuses.length];
    
    // Choose seat count & amounts
    let seats = 10;
    if (planId === 9 || planId === 10) seats = 50 + (i % 5) * 10; // DevCloud 50-100 seats
    else if (planId === 8) seats = 20 + (i % 4) * 10;
    else seats = 5 + (i % 10) * 2;

    const monthlyAmount = seats * (planId === 9 ? 4000 : (planId === 8 ? 6000 : 2500));
    const startMonth = (i % 10) + 1;
    const startDate = `2026-0${Math.min(startMonth, 9)}-15`;
    const expiryDate = `2027-0${Math.min(startMonth, 9)}-15`;

    await query(`
      INSERT INTO subscriptions (
        id, subscription_number, customer_id, plan_id, status,
        start_date, expiry_date, billing_frequency, payment_terms,
        auto_renew, total_seats, allocated_seats, monthly_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      i,
      subNum,
      custId,
      planId,
      status,
      startDate,
      expiryDate,
      (planId === 2 || planId === 4 || planId === 10) ? 'yearly' : 'monthly',
      (i % 3 === 0) ? 'Immediate' : 'Net 30',
      (status !== 'closed'),
      seats,
      seats,
      monthlyAmount
    ]);

    // Insert subscription item
    await query(`
      INSERT INTO subscription_items (subscription_id, product_id, quantity, unit_price, tax_rate, amount)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      i,
      ((planId - 1) % 10) + 1,
      seats,
      monthlyAmount / seats,
      18.00,
      monthlyAmount
    ]);
  }

  // 11. SIGNATURE DEMONSTRATION ANCHOR (Section 6 & 14 requirement):
  // "Marketing has 20 unused seats. Engineering needs 15 additional seats.
  // RECLAIM AI detects the mismatch. It recommends transferring 15 eligible seats.
  // The admin reviews and approves the transfer."
  // Subscription #1: DevCloud Workspace Monthly (Cust #1 Acme / Brightloop)
  // Total Seats: 100.
  // Department Marketing (Dept 1): 50 seats allocated, 30 active, 20 UNUSED!
  // Department Engineering (Dept 2): 40 seats allocated, 40 active, 0 unused (NEEDS 15 SEATS)!
  // Department Product (Dept 4): 10 seats allocated, 9 active, 1 unused.
  await query(`
    UPDATE subscriptions
    SET total_seats = 100, allocated_seats = 100, monthly_amount = 400000.00
    WHERE id = 1
  `);

  await query(`
    INSERT INTO seat_allocations (subscription_id, department_id, allocated_seats, active_seats, unused_seats, cost_allocation, notes) VALUES
    (1, 1, 50, 30, 20, 200000.00, 'Marketing team cloud workspace licenses. 20 seats inactive for >45 days.'),
    (1, 2, 40, 40, 0, 160000.00, 'Core backend and AI engineers. High capacity utilization at 100%. Deficit of 15 seats.'),
    (1, 4, 10, 9, 1, 40000.00, 'Product management and design prototyping pods.')
  `);

  // Historical usage records for Subscription #1 (Showing Usage-to-Value score drop as marketing seats fell idle)
  const usageHistory = [
    [1, 1, '2026-06-01', 50, 48, 2, 96.00, 4166.67, false, 'telemetry'],
    [1, 1, '2026-07-01', 50, 45, 5, 90.00, 4444.44, false, 'telemetry'],
    [1, 1, '2026-08-01', 50, 38, 12, 76.00, 5263.15, false, 'telemetry'],
    [1, 1, '2026-09-01', 50, 32, 18, 64.00, 6250.00, false, 'telemetry'],
    [1, 1, '2026-10-01', 50, 30, 20, 60.00, 6666.67, false, 'telemetry'],
    // Engineering usage
    [1, 2, '2026-10-01', 40, 40, 0, 100.00, 4000.00, false, 'telemetry'],
    // Simulated demo records for 5 other subscriptions to demonstrate simulated tagging
    [2, 3, '2026-10-01', 20, 14, 6, 70.00, 3571.42, true, 'simulated_benchmark'],
    [3, 1, '2026-10-01', 15, 8, 7, 53.33, 4687.50, true, 'simulated_benchmark'],
    [4, 2, '2026-10-01', 30, 28, 2, 93.33, 4285.71, true, 'simulated_benchmark']
  ];

  for (const u of usageHistory) {
    await query(`
      INSERT INTO usage_records (subscription_id, department_id, recorded_date, total_seats, active_seats, inactive_seats, utilization_rate, cost_per_active_seat, is_simulated, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, u);
  }

  // 12. Create the Demonstration Reallocation Request for Value Exchange
  // Marketing (Dept 1) -> Engineering (Dept 2): 15 seats matched!
  await query(`
    INSERT INTO reallocation_requests (
      id, request_number, product_id, source_subscription_id,
      source_department_id, target_department_id,
      seats_offered, seats_requested, seats_matched,
      status, financial_savings_amount, ai_recommendation_reason,
      requested_by, notes
    ) VALUES (
      1, 'REQ-2026-EX-001', 5, 1,
      1, 2,
      20, 15, 15,
      'pending', 60000.00,
      'RECLAIM AI detected 20 idle seats in Marketing (utilization 60%) alongside an active requisition for 15 seats in Engineering. Reallocating avoids ₹60,000 monthly (₹7,20,000 annual) new subscription cost with zero service disruption.',
      'Alex Rivera (VP Engineering)',
      'Engineering sprint onboarded 15 new platform developers. Need DevCloud licenses immediately.'
    )
  `);

  // Add 2 more sample reallocation requests (1 completed, 1 pending) to show history and active queue
  await query(`
    INSERT INTO reallocation_requests (
      id, request_number, product_id, source_subscription_id,
      source_department_id, target_department_id,
      seats_offered, seats_requested, seats_matched,
      status, financial_savings_amount, ai_recommendation_reason,
      requested_by, approved_by, approved_at, notes
    ) VALUES
    (
      2, 'REQ-2026-EX-002', 4, 1,
      1, 3,
      10, 8, 8,
      'completed', 48000.00,
      'Reallocated 8 unused Marketing Cloud licenses to Sales Outreach unit.',
      'Jordan Lee (Sales Lead)', 1, '2026-10-15 14:30:00',
      'Completed smoothly. Sales capacity satisfied without purchasing new tier.'
    ),
    (
      3, 'REQ-2026-EX-003', 1, 1,
      3, 5,
      12, 6, 6,
      'pending', 27000.00,
      'Detected 12 idle CRM seats in Sales following territory consolidation. HR requires 6 seats for onboarding.',
      'Maya Patel (HR Lead)', null, null,
      'Awaiting Admin approval.'
    )
  `);

  // 13. Insert Invoices (Paid, Confirmed, Draft, Overdue) & Payments
  console.log('Generating realistic recurring invoices and payment logs...');
  const invoiceStatuses = ['paid', 'paid', 'paid', 'confirmed', 'overdue', 'draft'];

  for (let i = 1; i <= 60; i++) {
    const invNum = `INV-2026-${String(i).padStart(4, '0')}`;
    const subId = i;
    const custId = ((i - 1) % 50) + 1;
    const status = (i <= 35) ? 'paid' : (i <= 48 ? 'confirmed' : (i <= 55 ? 'overdue' : 'draft'));
    const amount = 25000.00 + (i * 1200);
    const tax = amount * 0.18;
    const discount = (i % 4 === 0) ? 2000.00 : 0.00;
    const total = amount + tax - discount;
    const paid = (status === 'paid') ? total : 0.00;
    const balance = total - paid;
    const invoiceDate = `2026-09-${String((i % 25) + 1).padStart(2, '0')}`;
    const dueDate = (status === 'overdue') ? '2026-10-05' : '2026-11-20';

    await query(`
      INSERT INTO invoices (
        id, invoice_number, subscription_id, customer_id,
        invoice_date, due_date, status,
        subtotal, tax_total, discount_total, total_amount,
        amount_paid, balance_due, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      i,
      invNum,
      subId,
      custId,
      invoiceDate,
      dueDate,
      status,
      amount,
      tax,
      discount,
      total,
      paid,
      balance,
      `Recurring monthly subscription billing for SUB-2026-${String(subId).padStart(4, '0')}`
    ]);

    // Insert invoice items
    await query(`
      INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, discount_amount, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      i,
      ((i - 1) % 10) + 1,
      `Standard Plan Service & License Bundle`,
      1,
      amount,
      18.00,
      discount,
      total
    ]);

    // Insert payment record if paid
    if (status === 'paid') {
      const pMethods = ['Credit Card', 'Bank Transfer', 'UPI', 'Stripe'];
      await query(`
        INSERT INTO payments (
          payment_number, invoice_id, customer_id,
          payment_date, payment_method, amount,
          reference_notes, status, recorded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        `PAY-2026-${String(i).padStart(4, '0')}`,
        i,
        custId,
        invoiceDate,
        pMethods[i % pMethods.length],
        total,
        `Auto-cleared via merchant gateway ref #TXN${882000 + i}`,
        'completed',
        1
      ]);
    }
  }

  // 14. Quotations
  await query(`
    INSERT INTO quotations (id, quotation_number, customer_id, status, validity_date, subtotal, tax_amount, discount_amount, total_amount, notes, created_by) VALUES
    (1, 'QT-2026-0001', 1, 'converted', '2026-11-30', 400000.00, 72000.00, 20000.00, 452000.00, 'Acme Corp Annual DevCloud contract proposal with enterprise SLA.', 2),
    (2, 'QT-2026-0002', 2, 'accepted', '2026-11-15', 125000.00, 22500.00, 10000.00, 137500.00, 'NovaTech ERP Enterprise rollout proposal.', 2),
    (3, 'QT-2026-0003', 3, 'sent', '2026-12-01', 72000.00, 12960.00, 5000.00, 79960.00, 'Zenith Media marketing cloud 10-seat cluster.', 2),
    (4, 'QT-2026-0004', 4, 'draft', '2026-11-25', 54000.00, 9720.00, 0.00, 63720.00, 'Quantum Logistics fleet support plan draft.', 2)
  `);

  // Quotation items
  await query(`
    INSERT INTO quotation_items (quotation_id, product_id, plan_id, quantity, unit_price, tax_rate, amount) VALUES
    (1, 5, 9, 100, 4000.00, 18.00, 400000.00),
    (2, 2, 4, 1, 125000.00, 18.00, 125000.00),
    (3, 4, 8, 12, 6000.00, 18.00, 72000.00),
    (4, 3, 6, 20, 2700.00, 18.00, 54000.00)
  `);

  // 15. Audit logs and Notifications
  await query(`
    INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
    (1, 'Value Exchange Opportunity Detected', 'Marketing has 20 unused DevCloud seats. Engineering has requested 15 seats. Instant savings: ₹60,000/mo.', 'urgent', FALSE, '/exchange'),
    (1, '3 Overdue Invoices Need Attention', 'Overdue balance across 3 accounts stands at ₹86,400.', 'warning', FALSE, '/invoices'),
    (2, 'Quotation Converted to Subscription', 'Quotation QT-2026-0001 successfully activated as SUB-2026-0001.', 'success', FALSE, '/subscriptions'),
    (3, 'Upcoming Renewal Notice', 'Your subscription SUB-2026-0001 renews in 30 days.', 'info', FALSE, '/customer-portal')
  `);

  await query(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address) VALUES
    (1, 'SYSTEM_BOOTSTRAP', 'SYSTEM', 1, NULL, 'Brightloop Software seed database initialized with 50 customers and 100 subscriptions.', '127.0.0.1'),
    (1, 'REALLOCATION_SUGGESTION_CREATED', 'reallocation_requests', 1, NULL, 'AI matched Marketing (20 seats idle) to Engineering (15 seats needed).', '127.0.0.1')
  `);

  console.log('🎉 Seeding successfully completed! 50 customers, 100 subscriptions, 10 products, 15 plans, invoices, departments and demo value exchange loaded.');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };
