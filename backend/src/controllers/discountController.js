const { query } = require('../../database/db');

exports.listDiscounts = async (req, res) => {
  try {
    const result = await query('SELECT * FROM discounts ORDER BY id ASC');
    return res.json({ success: true, discounts: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list discounts.', error: err.message });
  }
};

exports.createDiscount = async (req, res) => {
  try {
    const {
      code,
      name,
      type = 'percentage',
      value = 10,
      min_purchase_amount = 0,
      min_quantity = 1,
      start_date = new Date().toISOString().split('T')[0],
      end_date = null,
      max_uses = 100,
      applies_to = 'all'
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Discount code and name are required.' });
    }

    const insertRes = await query(`
      INSERT INTO discounts (
        code, name, type, value, min_purchase_amount, min_quantity,
        start_date, end_date, max_uses, applies_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [code.toUpperCase().trim(), name, type, value, min_purchase_amount, min_quantity, start_date, end_date || null, max_uses, applies_to]);

    return res.status(201).json({ success: true, message: 'Discount created successfully.', discount_id: insertRes.lastID });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create discount.', error: err.message });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, min_purchase_amount, min_quantity, is_active } = req.body;

    await query(`
      UPDATE discounts
      SET name = COALESCE($1, name),
          value = COALESCE($2, value),
          min_purchase_amount = COALESCE($3, min_purchase_amount),
          min_quantity = COALESCE($4, min_quantity),
          is_active = COALESCE($5, is_active)
      WHERE id = $6
    `, [name, value, min_purchase_amount, min_quantity, is_active, id]);

    return res.json({ success: true, message: 'Discount updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update discount.', error: err.message });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE discounts SET is_active = 0 WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Discount deactivated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete discount.', error: err.message });
  }
};
