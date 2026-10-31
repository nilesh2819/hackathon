const { query } = require('../../database/db');

exports.listProducts = async (req, res) => {
  try {
    const productsRes = await query('SELECT * FROM products ORDER BY id ASC');
    const variantsRes = await query('SELECT * FROM product_variants ORDER BY id ASC');
    const plansRes = await query('SELECT * FROM plans WHERE is_active = 1 ORDER BY id ASC');

    const products = productsRes.rows.map(p => ({
      ...p,
      variants: variantsRes.rows.filter(v => v.product_id === p.id),
      plans: plansRes.rows.filter(pl => pl.product_id === p.id)
    }));

    return res.json({ success: true, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.', error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const pRes = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (!pRes.rows || pRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const variants = await query('SELECT * FROM product_variants WHERE product_id = $1', [id]);
    const plans = await query('SELECT * FROM plans WHERE product_id = $1', [id]);

    return res.json({
      success: true,
      product: {
        ...pRes.rows[0],
        variants: variants.rows,
        plans: plans.rows
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product.', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, code, type = 'software', sales_price = 0, cost_price = 0, description = '', notes = '', variants = [] } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Product name and code are required.' });
    }

    const insertRes = await query(`
      INSERT INTO products (name, code, type, sales_price, cost_price, description, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [name, code.toUpperCase(), type, sales_price, cost_price, description, notes]);

    const productId = insertRes.lastID;

    // Add variants if supplied
    if (Array.isArray(variants)) {
      for (const v of variants) {
        await query(`
          INSERT INTO product_variants (product_id, variant_name, attribute_name, attribute_value, price_extra)
          VALUES ($1, $2, $3, $4, $5)
        `, [productId, v.variant_name, v.attribute_name, v.attribute_value, v.price_extra || 0]);
      }
    }

    // By default create sharing eligibility record
    await query(`
      INSERT INTO sharing_eligibility (product_id, is_shareable, max_departments_share, min_reallocation_batch, terms)
      VALUES ($1, 1, 5, 1, 'Standard seat sharing enabled.')
    `, [productId]);

    return res.status(201).json({ success: true, message: 'Product created successfully.', product_id: productId });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create product.', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, type, sales_price, cost_price, description, notes, is_active } = req.body;

    await query(`
      UPDATE products
      SET name = COALESCE($1, name),
          code = COALESCE($2, code),
          type = COALESCE($3, type),
          sales_price = COALESCE($4, sales_price),
          cost_price = COALESCE($5, cost_price),
          description = COALESCE($6, description),
          notes = COALESCE($7, notes),
          is_active = COALESCE($8, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `, [name, code, type, sales_price, cost_price, description, notes, is_active, id]);

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update product.', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete or active toggle
    await query('UPDATE products SET is_active = 0 WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Product deactivated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete product.', error: err.message });
  }
};
