# GitHub Secrets Configuration

For automatic deployment via GitHub Actions, configure these secrets in your repository:

## Required Secrets

### 1. `CLOUDFLARE_API_TOKEN`
- Go to https://dash.cloudflare.com/profile/api-tokens
- Create a new token with these permissions:
  - Account: Cloudflare Pages:Edit
  - Account: Cloudflare Workers Scripts:Edit
  - Account: D1:Edit
- Copy the token value

### 2. `CLOUDFLARE_ACCOUNT_ID`
- Find in Cloudflare dashboard right sidebar
- Or run: `wrangler whoami`

### 3. `VITE_API_URL`
- Your Workers API URL
- Format: `https://todo-app-api.YOUR_SUBDOMAIN.workers.dev`
- Get this after first manual deployment

## Setting Secrets in GitHub

1. Go to your repository on GitHub
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its value

## Workers Environment Variables

Set these in Cloudflare Workers dashboard:

### `JWT_SECRET`
- Generate a secure random string
- Example: `openssl rand -base64 32`
- Set in Workers settings → Variables

## Verification

After setting up secrets, the GitHub Action will:
1. Build the React app with production API URL
2. Deploy API to Cloudflare Workers
3. Deploy frontend to Cloudflare Pages

Check Actions tab for deployment status.