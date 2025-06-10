# Todo App Cloudflare Deployment Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js 18+ installed

## Environment-based Deployment

This application supports multiple environments with automatic branch-based deployment:

### Environment Structure
- **Production** (`main` branch): `todo-app-api` + `todo-app-db`
- **Staging** (`staging` branch): `todo-app-api-staging` + `todo-app-db-staging`
- **Development** (`develop` branch): `todo-app-api-dev` + `todo-app-db-dev`
- **Preview** (Pull Requests): `todo-app-api-dev` + `todo-app-db-dev`

## Setup Steps

### 1. Cloudflare Authentication
```bash
wrangler login
```

### 2. Create Environment Databases
Use the automated setup script for each environment:

```bash
# Production environment
./scripts/setup-environments.sh production

# Staging environment  
./scripts/setup-environments.sh staging

# Development environment
./scripts/setup-environments.sh development
```

The script will:
- Create D1 database for the environment
- Update wrangler.toml with database ID
- Apply database schema
- Generate and set JWT_SECRET

### 3. GitHub Actions Setup

Set the following secrets in your GitHub repository:

```bash
# Cloudflare credentials
CLOUDFLARE_API_TOKEN=<your-api-token>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>

# Environment-specific API URLs
PRODUCTION_API_URL=https://todo-app-api.YOUR_SUBDOMAIN.workers.dev
STAGING_API_URL=https://todo-app-api-staging.YOUR_SUBDOMAIN.workers.dev
DEVELOPMENT_API_URL=https://todo-app-api-dev.YOUR_SUBDOMAIN.workers.dev
```

### 4. Automatic Deployment

The GitHub Actions workflow will automatically deploy:
- **main branch** → Production environment
- **staging branch** → Staging environment  
- **develop branch** → Development environment
- **Pull Requests** → Preview environment

### 5. Manual Environment Setup (Alternative)

If you prefer manual setup:

```bash
# Create database
wrangler d1 create todo-app-db-[environment]

# Apply schema
wrangler d1 execute todo-app-db-[environment] --file=schema.sql --env [environment]

# Set JWT secret
echo "$(openssl rand -base64 32)" | wrangler secret put JWT_SECRET --env [environment]
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
- `JWT_SECRET`: Secret key for JWT token generation (set as secret, not in wrangler.toml)
- `DB`: D1 database binding (automatically configured)

### Security Configuration
The application includes the following security measures:
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **Rate Limiting**: 5 login attempts per 15 minutes per IP
- **Security Headers**: Helmet.js for XSS, clickjacking protection
- **Input Sanitization**: All user inputs are sanitized to prevent XSS
- **SQL Injection Protection**: Parameterized queries and field whitelisting

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
- Verify JWT_SECRET is set as a secret: `wrangler secret list`
- Check CORS configuration matches your frontend URL
- Ensure JWT_SECRET environment variable is not using the default value

### Security Checklist
- [ ] JWT_SECRET is randomly generated and stored as a secret
- [ ] No hardcoded secrets in code or config files
- [ ] CORS is configured for your specific frontend domain
- [ ] Rate limiting is enabled on authentication endpoints
- [ ] All user inputs are sanitized

### Frontend Not Loading
- Verify _redirects file exists in public/
- Check build output in build/client/

## Production URLs
- API: https://todo-app-api.YOUR_SUBDOMAIN.workers.dev
- Frontend: https://todo-app.pages.dev (or custom domain)