const aiService = require('../services/aiIntelligenceService');
const { query } = require('../../database/db');

// 1. Usage-to-Value Intelligence
exports.getUsageToValue = async (req, res) => {
  try {
    const { subscription_id } = req.query;
    const data = await aiService.getUsageToValueDashboard(subscription_id ? parseInt(subscription_id, 10) : null);
    return res.json({ success: true, ...data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate Usage-to-Value intelligence.', error: err.message });
  }
};

exports.recordManualUsage = async (req, res) => {
  try {
    const { subscription_id, department_id, total_seats, active_seats, is_simulated = false } = req.body;
    if (!subscription_id || total_seats === undefined || active_seats === undefined) {
      return res.status(400).json({ success: false, message: 'Subscription ID, total seats, and active seats are required.' });
    }

    const tSeats = parseInt(total_seats, 10);
    const aSeats = parseInt(active_seats, 10);
    const inSeats = Math.max(0, tSeats - aSeats);
    const utilRate = tSeats > 0 ? ((aSeats / tSeats) * 100).toFixed(2) : 0;
    const costPerActive = aSeats > 0 ? (4000.00).toFixed(2) : 0;

    await query(`
      INSERT INTO usage_records (
        subscription_id, department_id, recorded_date,
        total_seats, active_seats, inactive_seats,
        utilization_rate, cost_per_active_seat, is_simulated, source
      ) VALUES ($1, $2, date('now'), $3, $4, $5, $6, $7, $8, $9)
    `, [
      subscription_id,
      department_id || 1,
      tSeats,
      aSeats,
      inSeats,
      utilRate,
      costPerActive,
      is_simulated ? 1 : 0,
      is_simulated ? 'simulated_benchmark' : 'manual_entry'
    ]);

    // Update seat allocations table
    if (department_id) {
      await query(`
        UPDATE seat_allocations
        SET allocated_seats = $1,
            active_seats = $2,
            unused_seats = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE subscription_id = $4 AND department_id = $5
      `, [tSeats, aSeats, inSeats, subscription_id, department_id]);
    }

    return res.status(201).json({
      success: true,
      message: `Usage metrics logged successfully. Current utilization: ${utilRate}%.`,
      is_simulated: Boolean(is_simulated)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record usage telemetry.', error: err.message });
  }
};

// 2. Sharing Intelligence
exports.getSharingIntelligence = async (req, res) => {
  try {
    const data = await aiService.getSharingIntelligence();
    return res.json({ success: true, ...data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch Sharing Intelligence.', error: err.message });
  }
};

// 3. Subscription Value Exchange
exports.getValueExchange = async (req, res) => {
  try {
    const data = await aiService.getSharingIntelligence();
    const usage = await aiService.getUsageToValueDashboard();

    // Available Capacity (Departments holding surplus idle seats)
    const availableCapacity = data.surplus_departments.map(d => ({
      department_id: d.department_id,
      department_name: d.department_name,
      product_name: d.product_name,
      available_seats: d.unused_seats,
      current_waste_cost: (d.unused_seats * 4000).toFixed(2),
      sharing_status: d.is_shareable ? 'Eligible for Transfer' : 'Provider Restricted',
      terms: d.sharing_terms
    }));

    // Resource Demand (Departments that have requested additional capacity)
    const demandQueue = data.reallocation_opportunities.map(o => ({
      request_id: o.id,
      request_number: o.request_number,
      target_department: o.target_department,
      product_name: o.product_name,
      seats_requested: o.seats_requested,
      status: o.status,
      requested_by: o.requested_by
    }));

    return res.json({
      success: true,
      available_capacity: availableCapacity,
      resource_demand: demandQueue,
      matching_proposals: data.reallocation_opportunities,
      metrics: data.metrics
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load Value Exchange engine.', error: err.message });
  }
};

exports.processExchangeReallocation = async (req, res) => {
  try {
    const { request_id, action, notes } = req.body;
    if (!request_id || !action) {
      return res.status(400).json({ success: false, message: 'Request ID and action (approve/reject) are required.' });
    }

    const adminId = req.user ? req.user.id : 1;
    const result = await aiService.processReallocation(request_id, action, adminId, notes);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Future Waste Predictor
exports.predictFutureWaste = async (req, res) => {
  try {
    const assumptions = req.body || {};
    const predictions = await aiService.getFutureWastePredictions(assumptions);
    return res.json({ success: true, ...predictions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate waste prediction model.', error: err.message });
  }
};

// 5. AI Business Assistant
exports.askAssistant = async (req, res) => {
  try {
    const { query: prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'User question is required.' });
    }
    const response = await aiService.handleAssistantQuery(prompt);
    return res.json({ success: true, ...response });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'AI Assistant query processing error.', error: err.message });
  }
};
