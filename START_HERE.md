# 🚀 Quick Start Guide - Real Application

Follow these steps in order:

## Step 1: Start Redis (In Terminal 1)

```powershell
powershell -ExecutionPolicy Bypass -File setup-redis.ps1
```

**Keep this terminal open!** Redis must run in the background.

---

## Step 2: Setup Database (In Terminal 2)

```powershell
# Create the database
psql -U postgres -c "CREATE DATABASE rewritebot;"

# If prompted for password, enter your PostgreSQL password
# If database already exists, that's OK - continue

# Install server dependencies
cd server
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Go back to root
cd ..
```

---

## Step 3: Install All Dependencies

```powershell
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

---

## Step 4: Start Real Application

```powershell
# This starts both backend and frontend
npm run dev
```

**OR start them separately:**

Terminal 3 - Backend:
```powershell
cd server
npm run dev
```

Terminal 4 - Frontend:
```powershell
cd client
npm run dev
```

---

## Step 5: Register and Login

1. Open http://localhost:5173
2. Click "Create Account" or go to Register
3. Register with email/password
4. Login with your credentials

---

## Step 6: Add AI Provider

You MUST add at least one AI provider to use paraphrasing:

### Quick Test - Using Ollama (Free, Local)

1. Download Ollama: https://ollama.ai/download
2. Install and run: `ollama run llama2`
3. In RewriteBot, add provider:
   - Type: Ollama
   - Base URL: http://localhost:11434
   - Model: llama2

### Using OpenAI (Requires API Key)

1. Get API key from: https://platform.openai.com/api-keys
2. In RewriteBot, add provider:
   - Type: OpenAI
   - API Key: your-key-here
   - Model: gpt-3.5-turbo

### Using Groq (Free, Fast)

1. Get free API key from: https://console.groq.com
2. In RewriteBot, add provider:
   - Type: Groq
   - API Key: your-key-here
   - Model: llama-3.3-70b-versatile

---

## ✅ Verify Everything Works

1. **Backend Health Check:**
   ```powershell
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok"}`

2. **Redis Check:**
   ```powershell
   cd redis
   .\redis-cli.exe ping
   ```
   Should return: `PONG`

3. **Database Check:**
   ```powershell
   cd server
   npx prisma studio
   ```
   Opens database GUI at http://localhost:5555

---

## 🎯 Ready to Test!

1. ✅ Redis running (Terminal 1)
2. ✅ Backend running (Terminal 3 or `npm run dev`)
3. ✅ Frontend running (Terminal 4 or `npm run dev`)
4. ✅ Database migrated
5. ✅ User registered
6. ✅ AI Provider added

**Now go to http://localhost:5173 and start paraphrasing!**

---

## 🆘 Troubleshooting

### "Port 3000 already in use"
```powershell
# Find process
netstat -ano | findstr :3000
# Kill it (replace 1234 with actual PID)
Stop-Process -Id 1234 -Force
```

### "Database connection failed"
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*
# Start it if stopped
Start-Service postgresql*
```

### "Redis connection failed"
Make sure Terminal 1 with Redis is still running!

### "Prisma migration failed"
```powershell
cd server
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📊 Monitoring

**View Backend Logs:** Check Terminal 3  
**View Frontend Logs:** Check Terminal 4  
**View Database:** `npx prisma studio` in server folder  
**View Redis Data:** `redis-cli` commands

---

## Need the full detailed guide?

See `SETUP_GUIDE.md` for comprehensive documentation.
