# RewriteBot Architecture

## Overview

RewriteBot is built as a provider-agnostic AI writing platform with a clear separation between the application layer and AI inference providers. The core principle is that users bring their own AI (BYOAI), eliminating vendor lock-in and giving users complete control over their data and costs.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Editor   │  │  Providers   │  │    Documents     │   │
│  │  Workspace │  │  Management  │  │   & History      │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│         │                │                     │             │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          └────────────────┴─────────────────────┘
                           │
                  HTTP/SSE │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Auth     │  │  Documents   │  │   Providers      │   │
│  │ Middleware │  │   Module     │  │    Module        │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             AI Orchestrator                           │  │
│  │  ┌────────────────┐  ┌────────────────┐             │  │
│  │  │ Provider       │  │  Model          │             │  │
│  │  │ Registry       │  │  Router         │             │  │
│  │  └────────────────┘  └────────────────┘             │  │
│  │  ┌────────────────┐  ┌────────────────┐             │  │
│  │  │ Prompt         │  │  Response       │             │  │
│  │  │ Engine         │  │  Normalizer     │             │  │
│  │  └────────────────┘  └────────────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
└───────────────────────────┼─────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  Cloud Providers │ │    Local     │ │   Custom     │
│                  │ │   Providers  │ │  Endpoints   │
│  • OpenAI        │ │  • Ollama    │ │  • Generic   │
│  • Gemini        │ │  • LM Studio │ │    OpenAI    │
│  • Anthropic     │ │              │ │    Compat    │
│  • NVIDIA        │ │              │ │              │
│  • OpenRouter    │ │              │ │              │
│  • DeepSeek      │ │              │ │              │
│  • Mistral       │ │              │ │              │
│  • Groq          │ │              │ │              │
│  • etc.          │ │              │ │              │
└──────────────────┘ └──────────────┘ └──────────────┘
```

## Data Flow

### 1. User Request Flow

```
User Action (Paraphrase)
    ↓
Editor Component
    ↓
API Client
    ↓
POST /api/v1/paraphrase
    ↓
Authentication Middleware
    ↓
Request Validation (Zod)
    ↓
Paraphrase Controller
    ↓
AI Orchestrator
    ↓
[Validation] → [Provider Resolution] → [Model Resolution]
    ↓
[Capability Check] → [Prompt Construction]
    ↓
Provider Adapter (e.g., NVIDIA, Ollama)
    ↓
External AI Provider / Local Model
    ↓
Response / Stream
    ↓
Response Normalizer
    ↓
[Store History] → [Return to Client]
    ↓
Update Editor with Result
```

### 2. Streaming Flow

```
POST /api/v1/paraphrase/stream
    ↓
SSE Connection Established
    ↓
AI Orchestrator
    ↓
Provider Stream
    ↓
Stream Normalizer
    ↓
SSE Events:
  • generation_started
  • generation_token (multiple)
  • generation_metadata
  • generation_completed
    ↓
Client receives chunks
    ↓
Real-time editor update
```

## Database Schema

```sql
-- Users and Authentication
users
  - id (uuid, primary key)
  - email (unique)
  - password_hash
  - name
  - created_at
  - updated_at

sessions
  - id (uuid, primary key)
  - user_id (foreign key)
  - refresh_token_hash
  - expires_at
  - created_at

-- Provider Configuration
providers
  - id (uuid, primary key)
  - user_id (foreign key)
  - name
  - type
  - protocol
  - base_url
  - authentication_type
  - model_id
  - is_default
  - connection_status
  - last_tested
  - created_at
  - updated_at

provider_credentials (encrypted)
  - id (uuid, primary key)
  - provider_id (foreign key)
  - encrypted_api_key
  - encryption_iv
  - encryption_tag
  - created_at
  - updated_at

-- Documents
documents
  - id (uuid, primary key)
  - user_id (foreign key)
  - title
  - content (text)
  - is_favorite
  - is_archived
  - created_at
  - updated_at

document_versions
  - id (uuid, primary key)
  - document_id (foreign key)
  - input (text)
  - output (text)
  - mode
  - provider_id
  - model_id
  - synonym_level
  - frozen_terms (json)
  - language
  - statistics (json)
  - created_at

-- History
history_events
  - id (uuid, primary key)
  - user_id (foreign key)
  - document_id (nullable foreign key)
  - operation
  - mode
  - provider_id
  - model_id
  - input (text)
  - output (text)
  - statistics (json)
  - latency
  - success
  - error_message
  - created_at

-- Custom Modes
custom_modes
  - id (uuid, primary key)
  - user_id (foreign key)
  - name
  - instruction
  - created_at

-- User Preferences
user_preferences
  - user_id (primary key, foreign key)
  - default_mode
  - default_language
  - default_synonym_level
  - default_provider_id
  - default_model_id
  - auto_save
  - theme
  - updated_at
```

## AI Orchestration Layer

### Provider Abstraction

All AI providers implement a common interface:

```typescript
interface AIProvider {
  id: string;
  name: string;
  protocol: ProviderProtocol;
  
  validateCredentials(): Promise<boolean>;
  listModels(): Promise<Model[]>;
  generate(request: AIRequest): Promise<AIResponse>;
  stream(request: AIRequest): AsyncIterable<AIChunk>;
}
```

### Provider Registry

Manages all configured providers:

```typescript
class ProviderRegistry {
  register(provider: AIProvider): void
  remove(providerId: string): void
  get(providerId: string): AIProvider
  list(): AIProvider[]
  getDefault(userId: string): AIProvider
  testConnection(providerId: string): Promise<TestResult>
}
```

### Model Router

Handles model selection and fallback:

```typescript
class ModelRouter {
  resolveModel(request: AIRequest): ResolvedModel
  getFallback(providerId: string): AIProvider | null
  handleFailure(request: AIRequest, error: Error): Promise<AIResponse>
}
```

### Prompt Engine

Constructs prompts based on mode and user preferences:

```typescript
class PromptEngine {
  buildPrompt(request: AIRequest): string {
    // 1. Load mode template
    // 2. Apply synonym level instructions
    // 3. Apply frozen terms constraints
    // 4. Apply custom instructions
    // 5. Format with input text
    // 6. Return structured prompt
  }
}
```

### Response Normalizer

Converts provider-specific responses to common format:

```typescript
class ResponseNormalizer {
  normalize(providerResponse: unknown, provider: string): AIResponse {
    // Parse provider-specific format
    // Extract text, usage, metadata
    // Calculate statistics
    // Return normalized response
  }
}
```

## Security Model

### Credential Encryption

```
API Key (plaintext)
    ↓
Generate random IV
    ↓
AES-256-GCM Encryption
  Key: CREDENTIAL_ENCRYPTION_KEY
  IV: Random per-credential
    ↓
Store: encrypted_api_key, iv, auth_tag
```

### Authentication Flow

```
Login Request
    ↓
Validate credentials (Argon2 verify)
    ↓
Generate JWT Access Token (15m expiry)
Generate JWT Refresh Token (7d expiry)
    ↓
Store refresh token hash in DB
    ↓
Return tokens to client
    ↓
Client stores in memory/secure storage
    ↓
Subsequent requests include access token
    ↓
JWT middleware validates token
    ↓
Attach user context to request
```

### Authorization

- All provider configurations are user-scoped
- Documents and history are user-scoped
- Horizontal privilege escalation checks on all endpoints
- Provider credentials never leave the server

### SSRF Protection

For custom provider URLs:

1. Validate URL format
2. Block private IP ranges (10.x, 192.168.x, 127.x)
3. Enforce timeout limits
4. Whitelist protocols (http, https only)
5. Log suspicious requests

## Request Lifecycle

### Standard Request

1. **Authentication**: JWT middleware validates token
2. **Rate Limiting**: Check user/IP rate limits
3. **Validation**: Zod schema validation
4. **Provider Resolution**: Get user's selected provider
5. **Model Resolution**: Resolve model or use default
6. **Capability Check**: Verify provider supports requested operation
7. **Prompt Construction**: Build mode-specific prompt
8. **Provider Request**: Call external AI provider
9. **Response Handling**: Normalize response
10. **History Storage**: Store event in database
11. **Response**: Return to client

### Streaming Request

Same as standard, but:

- Establish SSE connection
- Stream tokens as they arrive
- Normalize streaming format across providers
- Send `generation_completed` event at end
- Support cancellation via connection close

## Provider Health Management

```typescript
interface ProviderHealth {
  providerId: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  lastSuccess: Date;
  lastFailure: Date;
  failureCount: number;
  averageLatency: number;
}
```

Stored in Redis with TTL. Updated on each request.

## Caching Strategy

**Redis Cache:**
- Provider model lists (1 hour TTL)
- Provider health status (5 minute TTL)
- Rate limit counters (window-based)

**No Cache:**
- User documents
- Provider credentials
- AI generation results

## Error Handling

### Error Categories

1. **Authentication Errors** (401)
   - Invalid token
   - Expired token
   - Missing token

2. **Authorization Errors** (403)
   - Resource not owned by user
   - Insufficient permissions

3. **Validation Errors** (400)
   - Invalid input format
   - Missing required fields
   - Out of range values

4. **Provider Errors** (502, 503)
   - Provider unavailable
   - Provider timeout
   - Invalid API key
   - Rate limit exceeded

5. **Application Errors** (500)
   - Database errors
   - Unexpected failures

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "The selected AI provider is currently unavailable",
    "requestId": "req_abc123",
    "details": {
      "provider": "nvidia",
      "retryable": true
    }
  }
}
```

## Performance Considerations

### Database

- Indexes on user_id, created_at for all user-scoped tables
- Pagination for large lists (documents, history)
- Soft delete for documents (archive flag)
- Connection pooling

### Redis

- Rate limit sliding windows
- Provider health caching
- Session management

### Frontend

- Debounced autosave (2 second delay)
- Lazy loading for document list
- Virtual scrolling for large documents
- Optimistic UI updates

### API

- Request size limits (50K characters input)
- File upload limits (10MB)
- Timeout limits (30s for generation)
- Streaming for long responses

## Deployment Architecture

```
                    [Load Balancer]
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   [Frontend]         [Frontend]         [Frontend]
   Container          Container          Container
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    [API Gateway]
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   [Backend]          [Backend]          [Backend]
   Container          Container          Container
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   [PostgreSQL]        [Redis]        [File Storage]
    (Primary)          Cluster            (S3)
        │
   [PostgreSQL]
   (Replica)
```

## Monitoring and Observability

### Key Metrics

- Request latency (p50, p95, p99)
- Provider success/failure rates
- Provider average latency
- Authentication success rate
- Active users
- Documents created
- Paraphrase requests per provider

### Logging

- Request IDs for tracing
- Provider call logs (no sensitive data)
- Authentication events
- Error logs with stack traces
- Performance logs

### Health Checks

- `/api/v1/health` endpoint
- Database connectivity
- Redis connectivity
- Provider availability (optional)

---

This architecture provides:

1. **Flexibility**: Easy to add new providers
2. **Security**: Encrypted credentials, proper auth
3. **Scalability**: Stateless backend, horizontal scaling
4. **Privacy**: User controls where their data goes
5. **Reliability**: Fallback models, error handling
6. **Performance**: Caching, streaming, efficient DB queries
