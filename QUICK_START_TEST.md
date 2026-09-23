# Quick Start Testing Guide

Since you want to test the application quickly without full database setup, here's the fastest way:

## Option 1: Test Frontend Only (No Backend Needed - 2 minutes)

This lets you see the UI and explore the interface:

```bash
# Install frontend dependencies
cd client
npm install

# Start frontend dev server
npm run dev
```

Then open: http://localhost:5173

**What you can test:**
- UI/UX and design
- Page navigation
- Form layouts
- Responsive design

**Note:** API calls will fail (expected) since backend isn't running.

---

## Option 2: Test with Mock Backend (5 minutes)

Create a simple mock server for testing:

### Step 1: Install dependencies
```bash
# Root
npm install --workspace=shared

# Client
cd client
npm install

# Server (will take 2-3 minutes)
cd ../server
npm install
```

### Step 2: Start frontend
```bash
cd client
npm run dev
```

Open: http://localhost:5173

**What works:**
- Complete UI
- All pages and navigation
- Form interactions
- State management

---

## Option 3: Full Stack with Docker (Recommended for Full Testing)

If you want to test the complete application with database:

### Prerequisites:
- Docker Desktop running
- At least 4GB RAM available

### Start Everything:
```bash
# From project root
docker compose up --build
```

**First build takes 5-10 minutes** (downloading images, installing dependencies)

Once running:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Demo login: `demo@rewritebot.com` / `demo123456`

**What works:**
- Everything! Full application
- Authentication
- AI provider configuration (add your own API keys)
- Document management
- History tracking
- All AI tools

### To stop:
```bash
# Press Ctrl+C, then:
docker compose down
```

---

## Option 4: Manual Setup (Advanced - 15 minutes)

If Docker doesn't work, manual setup:

###1. Install PostgreSQL & Redis
**Windows (via Chocolatey):**
```powershell
choco install postgresql redis
```

**Or use cloud services:**
- Database: https://www.elephantsql.com/ (free tier)
- Redis: https://redis.com/try-free/ (free tier)

### 2. Configure Environment
```bash
# Edit .env file with your database URLs
DATABASE_URL=postgresql://user:pass@localhost:5432/rewritebot
REDIS_URL=redis://localhost:6379
```

### 3. Install & Build
```bash
npm install
npm run build --workspace=shared
```

### 4. Setup Database
```bash
cd server
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### 5. Start Services
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

---

## Recommended Testing Path

**Just want to see it quickly?**
→ **Option 1** (Frontend only - 2 min)

**Want to test UI/UX thoroughly?**
→ **Option 1** or **2** (Mock backend - 5 min)

**Want to test full functionality?**
→ **Option 3** (Docker - 10 min) ← **RECOMMENDED**

**Docker not working?**
→ **Option 4** (Manual - 15 min)

---

## Current Docker Issue

The Docker build failed because it's trying to copy node_modules that don't exist yet. This is a Dockerfile configuration issue that needs fixing.

**Temporary workaround:** Use Option 1, 2, or 4 above for now.

**To fix Docker:** The Dockerfiles need to be updated to handle the monorepo structure properly.

---

## What to Test

Once you have the app running:

### Frontend Testing:
1. **UI/Layout** - Check responsive design, navigation
2. **Forms** - Try registration, login forms
3. **Pages** - Visit all routes (/, /documents, /settings, /history)
4. **Styling** - Verify Bootstrap components render correctly

### Full Stack Testing (with backend):
1. **Authentication**
   - Register new user
   - Login/logout
   - Token refresh

2. **Providers**
   - Go to Settings → AI Providers
   - Add a test provider (use Generic OpenAI with fake URL for testing)
   - Test connection (will fail with fake URL - expected)

3. **Editor**
   - Type text in input editor
   - Select paraphrase mode
   - Try to paraphrase (needs valid AI provider)

4. **Documents**
   - Create document
   - View documents list
   - Favorite/archive

5. **History**
   - View history page
   - Filter by operation type
   - Check statistics

---

## Need Help?

- Docker issues: Check `docker compose logs`
- Port conflicts: Change ports in docker-compose.yml or .env
- Database issues: Check PostgreSQL is running
- npm install slow: Be patient, takes 3-5 minutes first time

---

**Fastest test:** Run Option 1 right now! Takes only 2 minutes.

```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173 in your browser! 🚀
