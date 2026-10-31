const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../database/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
const { validatePassword } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role = 'customer', phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.'
      });
    }

    // Check unique email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const validRole = ['admin', 'staff', 'customer'].includes(role) ? role : 'customer';

    const insertRes = await query(
      `INSERT INTO users (email, password_hash, full_name, role, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      [email.toLowerCase().trim(), password_hash, full_name, validRole, phone || null]
    );

    // If customer, also link or create a customer record
    if (validRole === 'customer') {
      await query(
        `INSERT INTO customers (user_id, name, email, phone, company_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [insertRes.lastID, full_name, email.toLowerCase().trim(), phone || '', `${full_name}'s Organization`]
      );
    }

    const token = jwt.sign(
      { id: insertRes.lastID, email: email.toLowerCase().trim(), role: validRole },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: insertRes.lastID,
        email: email.toLowerCase().trim(),
        full_name,
        role: validRole
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration failed.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userRes = await query(
      'SELECT id, email, password_hash, full_name, role, phone, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (!userRes.rows || userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  const user = await query('SELECT id, email FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  if (!user.rows || user.rows.length === 0) {
    // Don't reveal account existence for security
    return res.json({ success: true, message: 'If that email exists, a password reset link has been dispatched to it.' });
  }

  const token = 'RST-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  await query(
    "UPDATE users SET reset_token = $1, reset_token_expiry = datetime('now', '+1 hour') WHERE id = $2",
    [token, user.rows[0].id]
  );

  return res.json({
    success: true,
    message: 'Password reset link dispatched.',
    demo_reset_token: token // Returned for seamless testing in demo environment
  });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must have at least 8 characters, one uppercase, one lowercase and one special symbol.'
    });
  }

  const userRes = await query('SELECT id FROM users WHERE reset_token = $1', [token]);
  if (!userRes.rows || userRes.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
  }

  const password_hash = bcrypt.hashSync(newPassword, 10);
  await query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [
    password_hash,
    userRes.rows[0].id
  ]);

  return res.json({ success: true, message: 'Password has been updated successfully. You can now login.' });
};

exports.listUsers = async (req, res) => {
  const result = await query('SELECT id, email, full_name, role, phone, is_active, created_at FROM users ORDER BY id ASC');
  return res.json({ success: true, users: result.rows });
};

exports.createStaff = async (req, res) => {
  const { email, password, full_name, phone } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must have >8 characters, 1 uppercase, 1 lowercase and 1 special symbol.'
    });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  if (existing.rows && existing.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'User already exists.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  await query(
    'INSERT INTO users (email, password_hash, full_name, role, phone) VALUES ($1, $2, $3, $4, $5)',
    [email.toLowerCase().trim(), hash, full_name, 'staff', phone || '']
  );

  return res.status(201).json({ success: true, message: 'Internal staff account created successfully.' });
};
