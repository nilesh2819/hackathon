const { query } = require('../../database/db');
const { generateInvoicePdf } = require('../utils/pdfGenerator');

exports.listInvoices = async (req, res) => {
  try {
    const { status, customer_id, search, limit = 50, offset = 0 } = req.query;
    let sql = `
      SELECT 
        inv.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.company_name,
        s.subscription_number
      FROM invoices inv
      JOIN customers c ON inv.customer_id = c.id
      LEFT JOIN subscriptions s ON inv.subscription_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user && req.user.role === 'customer') {
      sql += ' AND c.user_id = $' + (params.length + 1);
      params.push(req.user.id);
    } else if (customer_id) {
      sql += ' AND inv.customer_id = $' + (params.length + 1);
      params.push(customer_id);
    }

    if (status && status !== 'all') {
      sql += ' AND inv.status = $' + (params.length + 1);
      params.push(status);
    }

    if (search) {
      sql += ' AND (inv.invoice_number LIKE $' + (params.length + 1) + ' OR c.company_name LIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY inv.id DESC LIMIT 100';

    const result = await query(sql, params);
    return res.json({ success: true, invoices: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoices.', error: err.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invRes = await query(`
      SELECT 
        inv.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.company_name,
        c.billing_address,
        c.tax_number,
        s.subscription_number,
        s.payment_terms,
        pl.name AS plan_name,
        pl.billing_frequency
      FROM invoices inv
      JOIN customers c ON inv.customer_id = c.id
      LEFT JOIN subscriptions s ON inv.subscription_id = s.id
      LEFT JOIN plans pl ON s.plan_id = pl.id
      WHERE inv.id = $1
    `, [id]);

    if (!invRes.rows || invRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const items = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);
    const payments = await query('SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC', [id]);

    return res.json({
      success: true,
      invoice: {
        ...invRes.rows[0],
        items: items.rows,
        payments: payments.rows
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve invoice.', error: err.message });
  }
};

exports.generateRecurringInvoice = async (req, res) => {
  try {
    const { subscription_id } = req.body;
    if (!subscription_id) {
      return res.status(400).json({ success: false, message: 'Subscription ID is required.' });
    }

    const subRes = await query(`
      SELECT s.*, c.id AS cust_id, c.name AS customer_name, pl.name AS plan_name, pl.price AS plan_price
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans pl ON s.plan_id = pl.id
      WHERE s.id = $1
    `, [subscription_id]);

    if (!subRes.rows || subRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const sub = subRes.rows[0];

    // Duplicate billing prevention rule: Check if an invoice was already generated this month!
    const today = new Date();
    const currentMonthPrefix = today.toISOString().substring(0, 7); // e.g. '2026-10'

    const existingCheck = await query(`
      SELECT id, invoice_number, invoice_date 
      FROM invoices 
      WHERE subscription_id = $1 AND invoice_date LIKE $2
    `, [subscription_id, `${currentMonthPrefix}%`]);

    if (existingCheck.rows && existingCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Duplicate Billing Prevented: An invoice (#${existingCheck.rows[0].invoice_number}) has already been generated for subscription #${sub.subscription_number} in cycle ${currentMonthPrefix}.`
      });
    }

    const countRes = await query('SELECT count(*) as c FROM invoices');
    const invNum = `INV-2026-${String(parseInt(countRes.rows[0].c, 10) + 1).padStart(4, '0')}`;

    const subtotal = parseFloat(sub.monthly_amount) || 50000;
    const taxTotal = subtotal * 0.18;
    const discountTotal = 0.00;
    const totalAmount = subtotal + taxTotal - discountTotal;
    const invoiceDate = today.toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const insertRes = await query(`
      INSERT INTO invoices (
        invoice_number, subscription_id, customer_id,
        invoice_date, due_date, status,
        subtotal, tax_total, discount_total, total_amount,
        amount_paid, balance_due, notes
      ) VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7, $8, $9, 0.00, $9, $10)
    `, [
      invNum,
      sub.id,
      sub.cust_id,
      invoiceDate,
      dueDate,
      subtotal,
      taxTotal,
      discountTotal,
      totalAmount,
      `Automated recurring subscription billing for ${sub.plan_name}`
    ]);

    const invoiceId = insertRes.lastID;

    // Insert line item
    await query(`
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, discount_amount, total_amount)
      VALUES ($1, $2, $3, $4, 18.00, 0.00, $5)
    `, [invoiceId, `${sub.plan_name} (${sub.total_seats} seats)`, sub.total_seats, subtotal / sub.total_seats, totalAmount]);

    return res.status(201).json({
      success: true,
      message: `Invoice #${invNum} generated automatically for subscription #${sub.subscription_number}.`,
      invoice_id: invoiceId,
      invoice_number: invNum
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate recurring invoice.', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed', 'paid', 'cancelled'

    if (!['draft', 'confirmed', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice status.' });
    }

    if (status === 'paid') {
      await query(`
        UPDATE invoices
        SET status = 'paid',
            amount_paid = total_amount,
            balance_due = 0.00,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);
    } else {
      await query(`
        UPDATE invoices
        SET status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [status, id]);
    }

    return res.json({ success: true, message: `Invoice #${id} status changed to '${status}'.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update invoice status.', error: err.message });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const invRes = await query(`
      SELECT 
        inv.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.company_name,
        c.billing_address,
        c.tax_number,
        s.subscription_number,
        s.payment_terms,
        pl.name AS plan_name,
        pl.billing_frequency
      FROM invoices inv
      JOIN customers c ON inv.customer_id = c.id
      LEFT JOIN subscriptions s ON inv.subscription_id = s.id
      LEFT JOIN plans pl ON s.plan_id = pl.id
      WHERE inv.id = $1
    `, [id]);

    if (!invRes.rows || invRes.rows.length === 0) {
      return res.status(404).send('Invoice not found');
    }

    const items = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);
    const invoice = {
      ...invRes.rows[0],
      items: items.rows
    };

    generateInvoicePdf(invoice, res);
  } catch (err) {
    return res.status(500).send('Error generating invoice PDF: ' + err.message);
  }
};
