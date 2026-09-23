# RewriteBot Setup Guide

## Prerequisites Check

✅ Node.js v24.14.1 - Installed  
✅ PostgreSQL 18.6 - Installed  
❌ Redis - Not Installed

---

## Setup Steps

### 1. Install Redis on Windows

**Option A: Using Chocolatey (Easiest)**
```powershell
choco install redis-64
```

**Option B: Using WSL2 (Recommended)**
```powershell
wsl --install
# After WSL is installed and restarted:
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**Option C: Manual Download**
- Download from: https://github.com/tporadowski/redis/releases
- Extract and run `redis-server.exe`

---

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/rewritebot

# Redis
REDIS_URL=redis://localhost:6379

# Server
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too

# API Keys (Add your provider API keys)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
GEMINI_API_KEY=your-gemini-key-here
# ... add more as needed

# Client
VITE_API_URL=http://localhost:3000/api/v1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### 3. Database Setup

**Create PostgreSQL Database:**
```powershell
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE rewritebot;
\q
```

**Run Prisma Migrations:**
```powershell
cd server
npx prisma generate
npx prisma migrate dev --name init
```

**Seed the Database (Optional):**
```powershell
npx prisma db seed
```

---

### 4. Install Dependencies

**Root dependencies:**
```powershell
npm install
```

**Server dependencies:**
```powershell
cd server
npm install
cd ..
```

**Client dependencies:**
```powershell
cd client
npm install
cd ..
```

---

### 5. Start the Application

**Option A: Start Everything Together (Recommended)**
```powershell
npm run dev
```

This will start:
- Backend server on http://localhost:3000
- Frontend on http://localhost:5173

**Option B: Start Separately**

Terminal 1 - Backend:
```powershell
cd server
npm run dev
```

Terminal 2 - Frontend:
```powershell
cd client
npm run dev
```

---

### 6. Verify Setup

1. **Check Backend Health:**
   - Open browser: http://localhost:3000/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Frontend:**
   - Open browser: http://localhost:5173
   - Should show login page

3. **Check Database Connection:**
   ```powershell
   cd server
   npx prisma studio
   ```
   - Opens database GUI at http://localhost:5555

---

## Configuration

### Add AI Provider

After login, you need to configure at least one AI provider:

1. Go to Settings/Providers page
2. Click "Add Provider"
3. Fill in:
   - **Name**: My OpenAI Provider
   - **Type**: OpenAI
   - **API Key**: your-openai-api-key
   - **Model**: gpt-3.5-turbo or gpt-4
4. Click Save

### Supported Providers

- OpenAI (GPT-3.5, GPT-4)
- Anthropic (Claude)
- Google Gemini
- Groq
- Ollama (local)
- DeepSeek
- Mistral
- Together AI
- Cerebras
- XAI (Grok)
- OpenRouter
- HuggingFace
- NVIDIA
- LM Studio (local)
- Generic OpenAI-compatible APIs

---

## Troubleshooting

### Database Connection Issues
```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Start PostgreSQL if stopped
Start-Service -Name postgresql*
```

### Redis Connection Issues
```powershell
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If using WSL:
wsl sudo service redis-server status
wsl sudo service redis-server start
```

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

### Prisma Issues
```powershell
cd server
npx prisma generate
npx prisma migrate reset
npx prisma migrate dev
```

---

## Development Workflow

1. **Make code changes** - Hot reload is enabled
2. **Database changes**: Update `server/prisma/schema.prisma` then run:
   ```powershell
   cd server
   npx prisma migrate dev --name your_migration_name
   ```
3. **View logs**: Check terminal output
4. **API testing**: Use Postman or curl

---

## Next Steps

1. ✅ Install Redis
2. ✅ Create `.env` file with your settings
3. ✅ Setup PostgreSQL database
4. ✅ Run migrations
5. ✅ Start the application
6. ✅ Add at least one AI provider
7. ✅ Test paraphrasing!

---

## Quick Start (TL;DR)

```powershell
# 1. Install Redis (choose one method above)

# 2. Create database
psql -U postgres -c "CREATE DATABASE rewritebot;"

# 3. Copy .env.example to .env and configure it
cp .env.example .env
# Edit .env with your settings

# 4. Install and setup
npm install
cd server
npm install
npx prisma generate
npx prisma migrate dev
cd ..

# 5. Start everything
npm run dev

# 6. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Database GUI: npx prisma studio (in server folder)
```

---

## Need Help?

Check the documentation:
- Architecture: `docs/ARCHITECTURE.md`
- API Reference: `docs/API.md`
- Database Schema: `docs/DATABASE.md`
- Security: `docs/SECURITY.md`
