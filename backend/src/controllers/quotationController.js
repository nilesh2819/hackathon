const { query } = require('../../database/db');

exports.listQuotations = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        q.*,
        c.name AS customer_name,
        c.company_name,
        u.full_name AS creator_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.id DESC
    `);

    // Attach items
    const itemsRes = await query('SELECT qi.*, p.name AS product_name FROM quotation_items qi JOIN products p ON qi.product_id = p.id');
    const quotations = result.rows.map(q => ({
      ...q,
      items: itemsRes.rows.filter(it => it.quotation_id === q.id)
    }));

    return res.json({ success: true, quotations });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list quotations.', error: err.message });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    const { customer_id, validity_date, notes = '', items = [] } = req.body;
    if (!customer_id || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer ID and at least one item line are required.' });
    }

    const countRes = await query('SELECT count(*) as c FROM quotations');
    const qNum = `QT-2026-${String(parseInt(countRes.rows[0].c, 10) + 1).padStart(4, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;

    items.forEach(it => {
      const lineSub = (parseFloat(it.unit_price) || 0) * (parseInt(it.quantity, 10) || 1);
      const lineTax = lineSub * ((parseFloat(it.tax_rate) || 18) / 100);
      subtotal += lineSub;
      taxAmount += lineTax;
    });

    const totalAmount = subtotal + taxAmount;
    const vDate = validity_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const insertRes = await query(`
      INSERT INTO quotations (
        quotation_number, customer_id, status, validity_date,
        subtotal, tax_amount, discount_amount, total_amount, notes, created_by
      ) VALUES ($1, $2, 'draft', $3, $4, $5, 0.00, $6, $7, $8)
    `, [qNum, customer_id, vDate, subtotal, taxAmount, totalAmount, notes, req.user ? req.user.id : 1]);

    const quotationId = insertRes.lastID;

    for (const it of items) {
      const lineTotal = (it.unit_price * it.quantity) * (1 + (it.tax_rate || 18) / 100);
      await query(`
        INSERT INTO quotation_items (quotation_id, product_id, plan_id, quantity, unit_price, tax_rate, amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [quotationId, it.product_id, it.plan_id || null, it.quantity || 1, it.unit_price || 0, it.tax_rate || 18, lineTotal]);
    }

    return res.status(201).json({ success: true, message: 'Quotation created successfully.', quotation_id: quotationId, quotation_number: qNum });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create quotation.', error: err.message });
  }
};

exports.convertToSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const qRes = await query('SELECT * FROM quotations WHERE id = $1', [id]);
    if (!qRes.rows || qRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    const quotation = qRes.rows[0];
    if (quotation.status === 'converted') {
      return res.status(400).json({ success: false, message: 'This quotation has already been converted to a subscription.' });
    }

    const items = await query('SELECT * FROM quotation_items WHERE quotation_id = $1', [id]);
    const firstItem = items.rows[0] || { plan_id: 1, quantity: 1, unit_price: quotation.total_amount };

    const countSubs = await query('SELECT count(*) as c FROM subscriptions');
    const subNum = `SUB-2026-${String(parseInt(countSubs.rows[0].c, 10) + 1).padStart(4, '0')}`;

    const startDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const subRes = await query(`
      INSERT INTO subscriptions (
        subscription_number, customer_id, quotation_id, plan_id, status,
        start_date, expiry_date, billing_frequency, payment_terms,
        auto_renew, total_seats, allocated_seats, monthly_amount
      ) VALUES ($1, $2, $3, $4, 'active', $5, $6, 'monthly', 'Net 30', 1, $7, $7, $8)
    `, [
      subNum,
      quotation.customer_id,
      quotation.id,
      firstItem.plan_id || 1,
      startDate,
      expiryDate,
      firstItem.quantity || 10,
      quotation.total_amount
    ]);

    // Update quotation status
    await query("UPDATE quotations SET status = 'converted', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);

    return res.json({
      success: true,
      message: `Quotation #${quotation.quotation_number} converted into Active Subscription #${subNum}!`,
      subscription_id: subRes.lastID,
      subscription_number: subNum
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to convert quotation.', error: err.message });
  }
};
