const { query } = require('../../database/db');

exports.listPayments = async (req, res) => {
  try {
    const { customer_id } = req.query;
    let sql = `
      SELECT 
        p.*,
        inv.invoice_number,
        c.name AS customer_name,
        c.company_name
      FROM payments p
      JOIN invoices inv ON p.invoice_id = inv.id
      JOIN customers c ON p.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user && req.user.role === 'customer') {
      sql += ' AND c.user_id = $' + (params.length + 1);
      params.push(req.user.id);
    } else if (customer_id) {
      sql += ' AND p.customer_id = $' + (params.length + 1);
      params.push(customer_id);
    }

    sql += ' ORDER BY p.id DESC LIMIT 100';

    const result = await query(sql, params);
    return res.json({ success: true, payments: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve payments.', error: err.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { invoice_id, payment_method = 'Bank Transfer', amount, reference_notes = '' } = req.body;
    if (!invoice_id || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invoice ID and valid positive amount are required.' });
    }

    const invRes = await query('SELECT * FROM invoices WHERE id = $1', [invoice_id]);
    if (!invRes.rows || invRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const invoice = invRes.rows[0];
    const payAmt = parseFloat(amount);
    const newPaid = (parseFloat(invoice.amount_paid) || 0) + payAmt;
    const newBalance = Math.max(0, (parseFloat(invoice.total_amount) || 0) - newPaid);
    const newStatus = newBalance <= 0.01 ? 'paid' : invoice.status;

    const countRes = await query('SELECT count(*) as c FROM payments');
    const payNum = `PAY-2026-${String(parseInt(countRes.rows[0].c, 10) + 1).padStart(4, '0')}`;

    const insertRes = await query(`
      INSERT INTO payments (
        payment_number, invoice_id, customer_id,
        payment_date, payment_method, amount,
        reference_notes, status, recorded_by
      ) VALUES ($1, $2, $3, date('now'), $4, $5, $6, 'completed', $7)
    `, [payNum, invoice.id, invoice.customer_id, payment_method, payAmt, reference_notes, req.user ? req.user.id : 1]);

    // Update invoice balances & status
    await query(`
      UPDATE invoices
      SET amount_paid = $1,
          balance_due = $2,
          status = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [newPaid, newBalance, newStatus, invoice.id]);

    return res.status(201).json({
      success: true,
      message: `Payment of INR ${payAmt.toLocaleString()} recorded successfully for Invoice #${invoice.invoice_number}. New status: '${newStatus}'.`,
      payment_id: insertRes.lastID,
      payment_number: payNum
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record payment.', error: err.message });
  }
};
