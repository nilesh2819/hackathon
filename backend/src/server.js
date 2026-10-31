const app = require('./app');
const { initDatabase, getDbType } = require('../database/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🚀 Initializing RECLAIM AI Backend Engine...');
    await initDatabase();
    console.log(`📊 Active Database Engine: [${getDbType().toUpperCase()}]`);

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`✨ RECLAIM AI Backend running on http://localhost:${PORT}`);
      console.log(`🔐 Admin: admin@brightloop.io | Password: Admin@123#`);
      console.log(`👥 Staff: staff@brightloop.io | Password: Staff@123#`);
      console.log(`👤 Customer: customer@acme.com | Password: Customer@123#`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start RECLAIM AI server:', err);
    process.exit(1);
  }
}

startServer();
