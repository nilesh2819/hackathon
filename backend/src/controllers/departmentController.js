const { query } = require('../../database/db');

exports.listDepartments = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        d.*,
        COALESCE(SUM(sa.allocated_seats), 0) AS total_seats_allocated,
        COALESCE(SUM(sa.active_seats), 0) AS total_active_seats,
        COALESCE(SUM(sa.unused_seats), 0) AS total_unused_seats,
        COALESCE(SUM(sa.cost_allocation), 0) AS current_monthly_spend
      FROM departments d
      LEFT JOIN seat_allocations sa ON d.id = sa.department_id
      GROUP BY d.id
      ORDER BY d.id ASC
    `);

    return res.json({ success: true, departments: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve departments.', error: err.message });
  }
};
