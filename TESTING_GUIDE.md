# RewriteBot Testing Guide

## Overview
This guide helps you test the paraphrase functionality with real AI providers after applying all security and functionality fixes.

## Prerequisites

1. **Database Setup**
   - PostgreSQL running on localhost:5432
   - Database: `rewritebot`
   - User: `postgres`
   - Password configured in `server/.env`

2. **Redis**
   - Running on port 6379

3. **Environment Variables**
   - `server/.env` must have:
     - `DATABASE_URL`
     - `CREDENTIAL_ENCRYPTION_KEY`
     - `JWT_SECRET`
     - `JWT_REFRESH_SECRET`

4. **Node.js**
   - Version 24.14.1 or compatible

## Starting the Application

### 1. Start Backend Server
```powershell
cd server
npm run dev
```
Server will start on http://localhost:3000

### 2. Start Frontend Client
```powershell
cd client
npm run dev
```
Client will start on http://localhost:5173

## Testing Steps

### Step 1: Login
1. Navigate to http://localhost:5173
2. Login with your credentials
3. You should be redirected to the home page

### Step 2: Add a Provider

Navigate to Settings (⚙️ icon on the right sidebar) and add a provider:

#### Option A: NVIDIA Provider
- **Name**: My NVIDIA Provider
- **Type**: nvidia
- **Protocol**: openai
- **API Key**: Your NVIDIA API key from https://build.nvidia.com
- **Model ID**: `meta/llama-3.1-8b-instruct` or any available model
- **Base URL**: Leave default (https://integrate.api.nvidia.com/v1)

#### Option B: Groq Provider
- **Name**: My Groq Provider
- **Type**: groq
- **Protocol**: openai
- **API Key**: Your Groq API key from https://console.groq.com
- **Model ID**: `llama-3.3-70b-versatile`
- **Base URL**: Leave default

#### Option C: Ollama (Local)
- **Name**: Local Ollama
- **Type**: ollama
- **Protocol**: openai
- **API Key**: Leave empty
- **Model ID**: `llama2` or any installed model
- **Base URL**: http://localhost:11434/v1

#### Option D: LM Studio (Local)
- **Name**: Local LM Studio
- **Type**: lmstudio
- **Protocol**: openai
- **API Key**: Leave empty
- **Model ID**: Check LM Studio for loaded model name
- **Base URL**: http://localhost:1234/v1

### Step 3: Test Connection
After adding a provider:
1. Click "Test Connection" button
2. Wait for the result
3. Should show "✓ Connection successful"

### Step 4: Test Generation (Optional)
Use the new test generation endpoint:
```bash
curl -X POST http://localhost:3000/api/v1/providers/{providerId}/test-generation \
  -H "Authorization: Bearer {your-access-token}" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "generatedText": "Greetings, planet!",
    "latency": 1234
  }
}
```

### Step 5: Test Paraphrase

1. Go back to Home page
2. Enter text in the left panel: "The quick brown fox jumps over the lazy dog"
3. Select your provider from the dropdown (should auto-select default)
4. Click "Paraphrase" button
5. Wait for generation
6. Paraphrased text should appear in the right panel

## Expected Results

### ✅ Success Indicators
- No console errors in browser
- "Paraphrase completed successfully!" in console
- Output text appears in right panel
- Output text is different from input
- Word count updates
- No timeout errors (120s timeout)

### ❌ Common Issues

#### 1. "Provider returned empty response"
**Cause**: Model returned empty string
**Fix**: 
- Try a different model
- Check provider API key is valid
- Verify model ID is correct

#### 2. "User attempted to access provider owned by..."
**Cause**: Security validation working (GOOD!)
**Fix**: Use your own provider, don't try to access others' providers

#### 3. "Model ID is required"
**Cause**: Provider doesn't have modelId set
**Fix**: Edit provider and add a valid model ID

#### 4. Timeout after 120 seconds
**Cause**: Provider API is slow or unresponsive
**Fix**:
- Check internet connection
- Try a smaller/faster model
- Verify API key quota
- Check provider status page

#### 5. "Text is required"
**Cause**: Empty input
**Fix**: Enter text in the left panel

#### 6. "Provider not found"
**Cause**: Provider was deleted or doesn't exist
**Fix**: Reload providers or add a new one

## Security Features (Now Fixed)

### 1. User Ownership Validation ✓
- Users can only access their own providers
- AIOrchestrator validates userId before loading credentials
- Prevents IDOR attacks

### 2. Prompt Handling ✓
- Original user text is preserved
- Prompt engine builds complete prompt
- Separate `providerRequest` sent to AI
- No double-wrapping

### 3. Input Validation ✓
- Model ID is trimmed (removes leading/trailing spaces)
- Empty responses rejected
- Text length validation (max 50,000 chars)
- Synonym level validation (1-4)

### 4. Provider Registry ✓
- Cached instances invalidated on update/delete
- Fresh credentials loaded after changes
- No stale API keys

## API Endpoints

### Paraphrase
```
POST /api/v1/paraphrase
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Your text here",
  "mode": "standard",
  "language": "en",
  "synonymLevel": 2,
  "frozenTerms": [],
  "providerId": "uuid-here",
  "modelId": "model-name-here"
}
```

### Paraphrase Stream
```
POST /api/v1/paraphrase/stream
Authorization: Bearer {token}
Content-Type: application/json
(Same body as above)
```

### Test Provider Connection
```
POST /api/v1/providers/:id/test
Authorization: Bearer {token}
```

### Test Provider Generation
```
POST /api/v1/providers/:id/test-generation
Authorization: Bearer {token}
```

## Debugging

### Backend Logs
Check server console for:
- "Generating with provider: {name}, model: {model}"
- "Generation completed in {ms}ms, output length: {len}"
- Any error messages

### Frontend Console
Check browser console for:
- "=== PARAPHRASE CLICKED ==="
- "Starting paraphrase with: {providerId, modelId}"
- "Paraphrase completed successfully!"
- Any API errors

### Database Check
```sql
-- Check providers
SELECT id, name, type, "userId", "modelId", "isDefault" FROM "Provider";

-- Check history
SELECT * FROM "HistoryEvent" ORDER BY "createdAt" DESC LIMIT 10;

-- Check credentials exist
SELECT "providerId" FROM "ProviderCredentials";
```

## Performance Notes

- **Timeout**: 120 seconds (increased from 30s)
- **Expected latency**: 
  - Cloud APIs (NVIDIA, Groq): 1-10 seconds
  - Local (Ollama, LM Studio): 5-30 seconds depending on hardware
- **Rate limits**: Check your provider's rate limits

## Next Steps After Testing

1. **If paraphrase works**: 
   - Test streaming mode
   - Test other modes (fluency, formal, etc.)
   - Test frozen terms feature
   - Test with longer texts

2. **If issues persist**:
   - Check provider API documentation
   - Verify API key permissions
   - Try a different model
   - Contact provider support

3. **Production readiness**:
   - Remove console.log statements
   - Add user-friendly error messages
   - Add loading animations
   - Add retry logic
   - Monitor error rates

## Modified Files (This Fix)

### Backend
- `server/src/ai/AIOrchestrator.ts` - Security, validation, prompt fixes
- `server/src/modules/paraphrase/paraphrase.service.ts` - userId handling
- `server/src/modules/paraphrase/paraphrase.controller.ts` - userId handling
- `server/src/modules/providers/providers.service.ts` - Test generation endpoint
- `server/src/modules/providers/providers.controller.ts` - Test generation endpoint
- `server/src/modules/providers/providers.routes.ts` - New route
- `shared/src/types/ai.ts` - Added userId to AIRequest

### Frontend
- `client/src/pages/Home.tsx` - Default provider selection, error handling

## Success Criteria

✅ All 10 tasks completed:
1. ✅ User ownership validation in AIOrchestrator
2. ✅ Prompt double-wrapping fixed
3. ✅ Model ID validation and trimming
4. ✅ Empty response validation
5. ✅ Provider registry invalidation
6. ✅ userId in AIRequest type
7. ✅ Frontend default provider selection
8. ✅ Frontend error display
9. ✅ Test generation endpoint
10. ⏳ Real provider testing (YOU ARE HERE)

---

**Ready to test!** Follow the steps above and report any issues.
