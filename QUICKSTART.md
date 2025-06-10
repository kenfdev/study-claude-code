# Todo App - Quick Start Deployment Guide

## 🚀 Prerequisites
```bash
# Install dependencies
npm install

# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## 📦 Step 1: Create D1 Database
```bash
# Create database
wrangler d1 create todo-app-db

# Copy the database_id from output
# Update database_id in wrangler.toml
```

## 🗄️ Step 2: Initialize Database
```bash
wrangler d1 execute todo-app-db --file=./schema.sql
```

## 🔐 Step 3: Set JWT Secret
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your Worker
3. Go to Settings → Variables
4. Add: `JWT_SECRET` = `your-secure-secret-here`

## 🚀 Step 4: Deploy Everything
```bash
# Option 1: Use the deployment script
./scripts/deploy.sh

# Option 2: Manual deployment
wrangler deploy                          # Deploy API
npm run build                           # Build frontend
wrangler pages deploy build/client      # Deploy frontend
```

## ✅ Step 5: Verify Deployment

### Get your URLs:
- **API**: Check terminal output or Workers dashboard
- **Frontend**: Check Pages dashboard

### Test all features:
1. Register new account
2. Login
3. Create todos
4. Mark as complete
5. Delete todos

## 🔧 Troubleshooting

### "Database not found"
- Verify database_id in wrangler.toml
- Run: `wrangler d1 list` to check

### "Unauthorized" errors
- Check JWT_SECRET is set in Workers
- Verify VITE_API_URL in frontend build

### CORS issues
- API URL must match in .env.production
- Check browser console for details

## 📱 Local Development
```bash
# Terminal 1: API server
npm run server

# Terminal 2: Frontend dev
npm run dev
```

## 🔄 Updates
Push to main branch triggers automatic deployment via GitHub Actions.