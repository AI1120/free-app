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

    // Validation
    if (!emailOrUsername || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email/username and password are required' 
        });
    }

    try {
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
            user: result.rows[0]
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
