# Todo App Cloudflare Deployment Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js 18+ installed

## Setup Steps

### 1. Cloudflare Authentication
```bash
wrangler login
```

### 2. Create D1 Database
```bash
# Create the database
wrangler d1 create todo-app-db

# Copy the database_id from the output and update wrangler.toml
```

### 3. Update Configuration
Edit `wrangler.toml` and replace `YOUR_DATABASE_ID_HERE` with the actual database ID.

### 4. Initialize Database Schema
```bash
wrangler d1 execute todo-app-db --file=./schema.sql
```

### 5. Set Environment Variables
In Cloudflare Workers dashboard:
- Go to your worker settings
- Add environment variable: `JWT_SECRET` with a secure random string

### 6. Deploy the Application
```bash
# Run the deployment script
./scripts/deploy.sh
```

## Manual Deployment

### Deploy Backend (Workers)
```bash
wrangler deploy
```

### Deploy Frontend (Pages)
```bash
# Build the app
npm run build

# Deploy to Pages
wrangler pages deploy build/client --project-name todo-app
```

## Environment Variables

### Workers (Backend)
- `JWT_SECRET`: Secret key for JWT token generation
- `DB`: D1 database binding (automatically configured)

### Pages (Frontend)
- `VITE_API_URL`: Your Workers API URL (e.g., https://todo-app-api.YOUR_SUBDOMAIN.workers.dev)

## Verification

After deployment, test all user stories:

1. **User Registration/Login**
   - Register new account
   - Login with credentials
   - Verify JWT token persistence

2. **Todo Creation**
   - Add new todos
   - Verify immediate display

3. **Todo List**
   - View all todos
   - Check filtering by user

4. **Todo Completion**
   - Toggle completion status
   - Verify visual feedback

5. **Todo Deletion**
   - Delete todos
   - Confirm removal from list

## Troubleshooting

### Database Connection Issues
- Verify database_id in wrangler.toml
- Check D1 database exists: `wrangler d1 list`

### Authentication Failures
- Verify JWT_SECRET is set in Workers environment
- Check CORS configuration

### Frontend Not Loading
- Verify _redirects file exists in public/
- Check build output in build/client/

## Production URLs
- API: https://todo-app-api.YOUR_SUBDOMAIN.workers.dev
- Frontend: https://todo-app.pages.dev (or custom domain)