const { query } = require('../../database/db');

exports.listPlans = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pl.*,
        p.name AS product_name,
        p.code AS product_code,
        p.sales_price AS product_base_price
      FROM plans pl
      JOIN products p ON pl.product_id = p.id
      ORDER BY pl.id ASC
    `);
    return res.json({ success: true, plans: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list plans.', error: err.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const {
      product_id,
      name,
      billing_frequency = 'monthly',
      price = 0,
      minimum_quantity = 1,
      start_date = new Date().toISOString().split('T')[0],
      end_date = null,
      auto_close = false,
      can_pause = true,
      can_renew = true
    } = req.body;

    if (!product_id || !name) {
      return res.status(400).json({ success: false, message: 'Product ID and Plan Name are required.' });
    }

    const insertRes = await query(`
      INSERT INTO plans (
        product_id, name, billing_frequency, price, minimum_quantity,
        start_date, end_date, auto_close, can_pause, can_renew
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      product_id,
      name,
      billing_frequency,
      price,
      minimum_quantity,
      start_date,
      end_date || null,
      auto_close ? 1 : 0,
      can_pause ? 1 : 0,
      can_renew ? 1 : 0
    ]);

    return res.status(201).json({ success: true, message: 'Plan created successfully.', plan_id: insertRes.lastID });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create plan.', error: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, billing_frequency, price, minimum_quantity, start_date, end_date, auto_close, can_pause, can_renew, is_active } = req.body;

    await query(`
      UPDATE plans
      SET name = COALESCE($1, name),
          billing_frequency = COALESCE($2, billing_frequency),
          price = COALESCE($3, price),
          minimum_quantity = COALESCE($4, minimum_quantity),
          start_date = COALESCE($5, start_date),
          end_date = COALESCE($6, end_date),
          auto_close = COALESCE($7, auto_close),
          can_pause = COALESCE($8, can_pause),
          can_renew = COALESCE($9, can_renew),
          is_active = COALESCE($10, is_active)
      WHERE id = $11
    `, [name, billing_frequency, price, minimum_quantity, start_date, end_date, auto_close, can_pause, can_renew, is_active, id]);

    return res.json({ success: true, message: 'Plan updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update plan.', error: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE plans SET is_active = 0 WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Plan deactivated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete plan.', error: err.message });
  }
};
