require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'reclaim-ai-super-secret-production-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};
