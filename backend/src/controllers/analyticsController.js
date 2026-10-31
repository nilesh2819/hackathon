const { query } = require('../../database/db');

exports.getFinancialDashboard = async (req, res) => {
  try {
    // 1. Core KPIs
    const mrrRes = await query("SELECT COALESCE(SUM(monthly_amount), 0) AS mrr, count(*) AS active_count FROM subscriptions WHERE status = 'active'");
    const revenueRes = await query("SELECT COALESCE(SUM(amount), 0) AS total_collected FROM payments WHERE status = 'completed'");
    const outstandingRes = await query("SELECT COALESCE(SUM(balance_due), 0) AS outstanding_total FROM invoices WHERE status IN ('confirmed', 'overdue')");
    const overdueRes = await query("SELECT count(*) AS overdue_count, COALESCE(SUM(balance_due), 0) AS overdue_amount FROM invoices WHERE status = 'overdue'");

    const mrr = parseFloat(mrrRes.rows[0].mrr) || 0;
    const arr = mrr * 12;
    const activeSubs = parseInt(mrrRes.rows[0].active_count, 10) || 0;
    const totalRevenue = parseFloat(revenueRes.rows[0].total_collected) || 0;
    const outstanding = parseFloat(outstandingRes.rows[0].outstanding_total) || 0;
    const overdueCount = parseInt(overdueRes.rows[0].overdue_count, 10) || 0;
    const overdueAmount = parseFloat(overdueRes.rows[0].overdue_amount) || 0;

    // 2. Revenue Trends (Monthly payments breakdown)
    const trendRes = await query(`
      SELECT 
        substr(payment_date, 1, 7) AS month,
        SUM(amount) AS revenue,
        COUNT(id) AS transaction_count
      FROM payments
      WHERE status = 'completed'
      GROUP BY substr(payment_date, 1, 7)
      ORDER BY month ASC
    `);

    // 3. Product Performance Breakdown
    const productPerf = await query(`
      SELECT 
        p.name AS product_name,
        p.code AS product_code,
        p.type AS product_type,
        COUNT(s.id) AS subscription_count,
        COALESCE(SUM(s.monthly_amount), 0) AS total_mrr
      FROM products p
      LEFT JOIN plans pl ON p.id = pl.product_id
      LEFT JOIN subscriptions s ON pl.id = s.plan_id AND s.status = 'active'
      GROUP BY p.id, p.name, p.code, p.type
      ORDER BY total_mrr DESC
    `);

    // 4. Plan Performance Breakdown
    const planPerf = await query(`
      SELECT 
        pl.name AS plan_name,
        pl.billing_frequency,
        COUNT(s.id) AS active_subscribers,
        COALESCE(SUM(s.monthly_amount), 0) AS mrr
      FROM plans pl
      LEFT JOIN subscriptions s ON pl.id = s.plan_id AND s.status = 'active'
      GROUP BY pl.id, pl.name, pl.billing_frequency
      ORDER BY mrr DESC
      LIMIT 8
    `);

    return res.json({
      success: true,
      kpis: {
        mrr,
        arr,
        active_subscriptions: activeSubs,
        total_revenue_collected: totalRevenue,
        outstanding_payments: outstanding,
        overdue_invoices_count: overdueCount,
        overdue_invoices_amount: overdueAmount
      },
      revenue_trends: trendRes.rows,
      product_performance: productPerf.rows,
      plan_performance: planPerf.rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve financial analytics.', error: err.message });
  }
};
