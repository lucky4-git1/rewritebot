# Paraphrase Diagnostic Test Script

## Prerequisites

1. **Login to get access token**:
   - Navigate to http://localhost:5173
   - Login with your credentials
   - Open browser DevTools → Network tab
   - Look for any API request and copy the Authorization header value

2. **Get your provider ID**:
   ```bash
   # Using curl (replace TOKEN with your access token)
   curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/v1/providers
   ```

## Test Levels

### Level 1: Connection Test (already exists)
```bash
curl -X POST http://localhost:3000/api/v1/providers/YOUR_PROVIDER_ID/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected: `{"success": true, "status": "connected", ...}`

### Level 2: Raw Generation Test (already exists)
```bash
curl -X POST http://localhost:3000/api/v1/providers/YOUR_PROVIDER_ID/test-generation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected: `{"success": true, "generatedText": "...", "latency": 1234}`

### Level 3: Paraphrase Pipeline Test (NEW)
```bash
curl -X POST http://localhost:3000/api/v1/providers/YOUR_PROVIDER_ID/test-paraphrase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected:
```json
{
  "success": true,
  "data": {
    "success": true,
    "provider": "nvidia",
    "model": "meta/llama-3.1-8b-instruct",
    "latency": 2345,
    "outputLength": 87,
    "requestId": "uuid-here"
  }
}
```

### Level 4: Full UI Paraphrase Test
1. Open http://localhost:5173
2. Enter text: "Artificial intelligence is transforming the software industry."
3. Select your provider
4. Click "Paraphrase"
5. Check browser console for diagnostic logs
6. Check server logs for request tracing

## What to Look For

### Browser Console (client/src/pages/Home.tsx)
```
=== PARAPHRASE CLICKED ===
Selected Provider ID: <uuid>
Starting paraphrase with: {providerId, modelId, textLength}
✓ Paraphrase SUCCESS: {outputLength, provider, model, latency}
```

### Server Logs (with requestId)
```
[<requestId>] PARAPHRASE_REQUEST_RECEIVED
[<requestId>] AUTHENTICATION_PASSED {userId}
[<requestId>] REQUEST_VALIDATED {providerId, modelId, mode, textLength}
[<requestId>] PARAPHRASE_SERVICE_START
[<requestId>] AI_REQUEST_CREATED
[<requestId>] AI_ORCHESTRATOR_START
[<requestId>] REQUEST_VALIDATED
[<requestId>] PROVIDER_RESOLVED {providerType, providerName}
[<requestId>] PROMPT_BUILT {promptLength, mode, synonymLevel}
[<requestId>] PROVIDER_REQUEST_START
[<requestId>] PROVIDER_RESPONSE_RECEIVED {outputLength, latency}
[<requestId>] RESPONSE_VALIDATED {outputLength}
[<requestId>] AI_RESPONSE_RECEIVED
[<requestId>] PARAPHRASE_SUCCESS
```

## Troubleshooting

### If test-connection passes but test-paraphrase fails:
- Problem is in prompt generation or AI configuration
- Check server logs for the exact failure stage
- The requestId will correlate all log entries

### If test-paraphrase passes but UI paraphrase fails:
- Problem is in frontend request building or auth
- Check browser console for request details
- Check server logs for auth failures

### If everything fails:
- Check API key is valid
- Check model ID is correct (no leading/trailing spaces)
- Check provider base URL is correct
- Check network connectivity

## Success Criteria

✅ test-connection: PASS
✅ test-generation: PASS  
✅ test-paraphrase: PASS
✅ UI paraphrase: PASS with visible output

Only when ALL FOUR pass is the system working.
