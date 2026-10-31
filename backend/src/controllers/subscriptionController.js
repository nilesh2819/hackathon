const { query } = require('../../database/db');

exports.listSubscriptions = async (req, res) => {
  try {
    const { status, customer_id, search, limit = 50, offset = 0 } = req.query;
    let sql = `
      SELECT 
        s.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.company_name,
        pl.name AS plan_name,
        pl.billing_frequency,
        p.name AS product_name,
        p.code AS product_code
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans pl ON s.plan_id = pl.id
      JOIN products p ON pl.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Customer role restriction: customers only view their own subscriptions
    if (req.user && req.user.role === 'customer') {
      sql += ' AND c.user_id = $' + (params.length + 1);
      params.push(req.user.id);
    } else if (customer_id) {
      sql += ' AND s.customer_id = $' + (params.length + 1);
      params.push(customer_id);
    }

    if (status && status !== 'all') {
      sql += ' AND s.status = $' + (params.length + 1);
      params.push(status);
    }

    if (search) {
      sql += ' AND (s.subscription_number LIKE $' + (params.length + 1) + ' OR c.company_name LIKE $' + (params.length + 1) + ' OR p.name LIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY s.id ASC LIMIT 100';

    const result = await query(sql, params);
    return res.json({ success: true, subscriptions: result.rows, total: result.rowCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscriptions.', error: err.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subRes = await query(`
      SELECT 
        s.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.company_name,
        c.billing_address,
        pl.name AS plan_name,
        pl.billing_frequency,
        p.name AS product_name,
        p.code AS product_code,
        p.sales_price
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans pl ON s.plan_id = pl.id
      JOIN products p ON pl.product_id = p.id
      WHERE s.id = $1
    `, [id]);

    if (!subRes.rows || subRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const allocations = await query(`
      SELECT sa.*, d.name AS department_name, d.code AS department_code, d.manager_name
      FROM seat_allocations sa
      JOIN departments d ON sa.department_id = d.id
      WHERE sa.subscription_id = $1
    `, [id]);

    const invoices = await query(`
      SELECT * FROM invoices WHERE subscription_id = $1 ORDER BY id DESC
    `, [id]);

    const usage = await query(`
      SELECT * FROM usage_records WHERE subscription_id = $1 ORDER BY recorded_date DESC LIMIT 12
    `, [id]);

    return res.json({
      success: true,
      subscription: subRes.rows[0],
      allocations: allocations.rows,
      invoices: invoices.rows,
      usage: usage.rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscription.', error: err.message });
  }
};

exports.updateLifecycle = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'pause', 'renew', 'close', 'activate'

    const validActions = {
      pause: 'paused',
      activate: 'active',
      renew: 'active',
      close: 'closed'
    };

    const newStatus = validActions[action];
    if (!newStatus) {
      return res.status(400).json({ success: false, message: `Invalid lifecycle action '${action}'. Allowed: pause, activate, renew, close.` });
    }

    if (action === 'renew') {
      await query(`
        UPDATE subscriptions
        SET status = 'active',
            expiry_date = date(expiry_date, '+1 year'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);
    } else {
      await query(`
        UPDATE subscriptions
        SET status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newStatus, id]);
    }

    return res.json({ success: true, message: `Subscription #${id} lifecycle updated to '${newStatus}'.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update subscription lifecycle.', error: err.message });
  }
};
