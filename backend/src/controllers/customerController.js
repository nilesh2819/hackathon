const { query } = require('../../database/db');

exports.listCustomers = async (req, res) => {
  try {
    const { search = '', limit = 50, offset = 0 } = req.query;
    let sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) AS total_subscriptions,
        COALESCE(SUM(s.monthly_amount), 0) AS total_monthly_spend,
        COUNT(DISTINCT inv.id) AS total_invoices
      FROM customers c
      LEFT JOIN subscriptions s ON c.id = s.customer_id AND s.status = 'active'
      LEFT JOIN invoices inv ON c.id = inv.customer_id
    `;
    const params = [];

    if (search) {
      sql += ' WHERE c.name LIKE $1 OR c.email LIKE $1 OR c.company_name LIKE $1';
      params.push(`%${search}%`);
    }

    sql += ' GROUP BY c.id ORDER BY c.id ASC LIMIT 100';

    const result = await query(sql, params);
    return res.json({ success: true, customers: result.rows, total: result.rowCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list customers.', error: err.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const cRes = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (!cRes.rows || cRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const subscriptions = await query(`
      SELECT s.*, pl.name AS plan_name, p.name AS product_name
      FROM subscriptions s
      JOIN plans pl ON s.plan_id = pl.id
      JOIN products p ON pl.product_id = p.id
      WHERE s.customer_id = $1
      ORDER BY s.id DESC
    `, [id]);

    const invoices = await query(`
      SELECT * FROM invoices WHERE customer_id = $1 ORDER BY id DESC
    `, [id]);

    return res.json({
      success: true,
      customer: cRes.rows[0],
      subscriptions: subscriptions.rows,
      invoices: invoices.rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer.', error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company_name, billing_address, tax_number } = req.body;
    if (!name || !email || !company_name) {
      return res.status(400).json({ success: false, message: 'Name, email, and company name are required.' });
    }

    const insertRes = await query(`
      INSERT INTO customers (name, email, phone, company_name, billing_address, tax_number)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [name, email.toLowerCase().trim(), phone || '', company_name, billing_address || '', tax_number || '']);

    return res.status(201).json({ success: true, message: 'Customer created successfully.', customer_id: insertRes.lastID });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create customer.', error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company_name, billing_address, tax_number } = req.body;

    await query(`
      UPDATE customers
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          company_name = COALESCE($4, company_name),
          billing_address = COALESCE($5, billing_address),
          tax_number = COALESCE($6, tax_number),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [name, email, phone, company_name, billing_address, tax_number, id]);

    return res.json({ success: true, message: 'Customer updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update customer.', error: err.message });
  }
};
