const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const { query } = require('../../database/db');

function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasSpecial;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    try {
      const userRes = await query('SELECT id, email, full_name, role, phone, is_active FROM users WHERE id = $1', [decoded.id]);
      if (!userRes.rows || userRes.rows.length === 0 || !userRes.rows[0].is_active) {
        return res.status(403).json({ success: false, message: 'User account disabled or not found.' });
      }
      req.user = userRes.rows[0];
      next();
    } catch (dbErr) {
      return res.status(500).json({ success: false, message: 'Database authentication verification error.', error: dbErr.message });
    }
  });
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`
      });
    }
    next();
  };
}

module.exports = {
  validatePassword,
  authenticateToken,
  requireRole
};
