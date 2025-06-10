# Todo App - Cloudflare Deployment

A full-stack Todo application built with React Router v7, Express, and SQLite, ready for deployment on Cloudflare Pages and Workers.

## 🚀 Features

- ✅ User authentication (JWT)
- ✅ Create, read, update, delete todos
- ✅ Responsive UI with Tailwind CSS
- ✅ TypeScript throughout
- ✅ Cloudflare Workers for API
- ✅ Cloudflare Pages for frontend
- ✅ D1 Database for data persistence

## 📋 User Stories Implemented

1. **User Registration/Login** - Create account and authenticate
2. **Todo Creation** - Add new tasks to your list
3. **Todo List Display** - View all your todos
4. **Todo Completion** - Mark tasks as done
5. **Todo Deletion** - Remove unwanted tasks

## 🛠️ Tech Stack

- **Frontend**: React Router v7, TypeScript, Tailwind CSS
- **Backend**: Hono (Workers), JWT authentication
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages & Workers

## 🚀 Quick Start

### Prerequisites
```bash
npm install
npm install -g wrangler
wrangler login
```

### 1. Create D1 Database
```bash
wrangler d1 create todo-app-db
# Copy the database_id and update wrangler.toml
```

### 2. Initialize Database
```bash
wrangler d1 execute todo-app-db --file=./schema.sql
```

### 3. Deploy
```bash
# Deploy API to Workers
wrangler deploy

# Build and deploy frontend
npm run build
wrangler pages deploy build/client --project-name todo-app
```

### 4. Set Environment Variables

#### Workers Dashboard:
- `JWT_SECRET`: Your secure secret key

#### Update `.env.production`:
- `VITE_API_URL`: Your Workers API URL

## 📁 Project Structure

```
├── app/                    # React Router frontend
│   ├── components/        # React components
│   ├── routes/           # Page routes
│   └── lib/              # Utilities
├── workers/              # Cloudflare Workers API
│   └── index.ts         # API endpoints
├── functions/            # Local development API
├── scripts/              # Deployment scripts
└── schema.sql           # Database schema
```

## 🔧 Development

```bash
# Terminal 1: API server
npm run server

# Terminal 2: Frontend
npm run dev
```

## 🚢 Production Deployment

### Automatic (GitHub Actions)
Push to main branch triggers deployment.

### Manual
```bash
./scripts/deploy.sh
```

## 📝 Environment Variables

### Development
Create `.env` file:
```
PORT=3001
NODE_ENV=development
```

### Production
- `JWT_SECRET` - Set in Workers dashboard
- `VITE_API_URL` - Set in `.env.production`

## 🔍 Testing

```bash
npm test
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Quick Start](./QUICKSTART.md)
- [GitHub Secrets Setup](./GITHUB_SECRETS.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT
