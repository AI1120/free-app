# Setup Guide for Online PostgreSQL Database

## 🌟 Recommended: Neon (Easiest & Free)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up" (use GitHub or email)
3. Create a new project

### Step 2: Get Connection String
1. In your Neon dashboard, click on your project
2. Copy the **Connection String** (looks like this):
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Configure Backend
1. Open `.env` file in the `database` folder
2. Replace the `DATABASE_URL` with your connection string:
   ```
   DATABASE_URL=postgresql://your-connection-string-here
   ```

### Step 4: Install Dependencies
```bash
cd database
npm install
```

### Step 5: Initialize Database
Start the server:
```bash
node server-online.js
```

Then call the init endpoint (one time only):
```bash
curl -X POST http://localhost:3000/api/init-db
```

Or open in browser: http://localhost:3000/api/init-db

### Step 6: Test the API
```bash
# Register a user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"emailOrUsername\":\"test@example.com\",\"password\":\"password123\"}"
```

---

## 🐘 Alternative: ElephantSQL

### Step 1: Create Account
1. Go to https://www.elephantsql.com
2. Sign up for free
3. Create a new instance (Tiny Turtle - Free)

### Step 2: Get Connection Details
1. Click on your instance
2. Copy the **URL** from the details page

### Step 3: Update .env
```
DATABASE_URL=postgres://username:password@lucky.db.elephantsql.com/username
```

---

## 🔥 Alternative: Supabase

### Step 1: Create Project
1. Go to https://supabase.com
2. Create new project
3. Wait for database to be ready

### Step 2: Get Connection String
1. Go to Project Settings > Database
2. Copy **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your actual password

### Step 3: Update .env
```
DATABASE_URL=postgresql://postgres:your-password@db.projectref.supabase.co:5432/postgres
```

---

## ✅ Verify Connection

After setup, test the connection:
```bash
node server-online.js
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server is running on http://localhost:3000
📊 Database: Online
```

---

## 🚀 Deploy Backend Online (Optional)

### Deploy to Render.com (Free)
1. Push code to GitHub
2. Go to https://render.com
3. Create new "Web Service"
4. Connect your GitHub repo
5. Add environment variable: `DATABASE_URL`
6. Deploy!

### Deploy to Railway.app (Free)
1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Railway auto-configures `DATABASE_URL`

---

## 📝 Quick Comparison

| Service | Storage | Best For | Setup Time |
|---------|---------|----------|------------|
| **Neon** | 0.5 GB | Modern apps | 2 min ⭐ |
| **Supabase** | 500 MB | Full-stack | 3 min |
| **ElephantSQL** | 20 MB | Testing | 2 min |
| **Railway** | $5/month credit | Production | 5 min |

**Recommendation:** Start with **Neon** - it's the easiest and most generous free tier!
