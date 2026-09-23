# RewriteBot API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require authentication via JWT tokens.

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Authentication Endpoints

### Register

Create a new user account.

**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login

Authenticate and receive tokens.

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Refresh Token

Get a new access token using a refresh token.

**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

### Logout

Invalidate the current session.

**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

## Provider Endpoints

### List Providers

Get all configured providers for the authenticated user.

**GET** `/providers`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "NVIDIA",
      "type": "nvidia",
      "protocol": "openai",
      "modelId": "meta/llama-3.1-8b-instruct",
      "isDefault": true,
      "connectionStatus": "connected",
      "lastTested": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Add Provider

Configure a new AI provider.

**POST** `/providers`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "NVIDIA",
  "type": "nvidia",
  "protocol": "openai",
  "baseUrl": "https://integrate.api.nvidia.com/v1",
  "authenticationType": "bearer",
  "apiKey": "nvapi-xxx",
  "modelId": "meta/llama-3.1-8b-instruct",
  "options": {
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**Response:** `201 Created`

### Test Provider Connection

Test if a provider is accessible.

**POST** `/providers/:id/test`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "success": true,
    "status": "connected",
    "message": "Connection successful",
    "latency": 234,
    "modelsAvailable": true
  }
}
```

### Get Provider Models

Fetch available models for a provider.

**GET** `/providers/:id/models`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "modelId": "meta/llama-3.1-8b-instruct",
      "displayName": "Llama 3.1 8B Instruct",
      "contextWindow": 8192,
      "streamingSupported": true
    }
  ]
}
```

### Update Provider

Update provider configuration.

**PATCH** `/providers/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "modelId": "different-model",
  "isDefault": true
}
```

**Response:** `200 OK`

### Delete Provider

Remove a provider configuration.

**DELETE** `/providers/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

## AI Operation Endpoints

### Paraphrase

Rewrite text using the selected mode.

**POST** `/paraphrase`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "The quick brown fox jumps over the lazy dog.",
  "mode": "standard",
  "language": "en",
  "synonymLevel": 2,
  "frozenTerms": ["fox"],
  "providerId": "uuid",
  "modelId": "meta/llama-3.1-8b-instruct"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "text": "A swift auburn fox leaps over the inactive canine.",
    "provider": "nvidia",
    "model": "meta/llama-3.1-8b-instruct",
    "latency": 1250,
    "usage": {
      "promptTokens": 45,
      "completionTokens": 28,
      "totalTokens": 73
    }
  }
}
```

### Paraphrase Stream

Paraphrase with real-time streaming.

**POST** `/paraphrase/stream`

**Headers:** 
- `Authorization: Bearer <token>`
- `Accept: text/event-stream`

**Request Body:** Same as `/paraphrase`

**Response:** `200 OK` (Server-Sent Events)

```
event: generation_started
data: {"requestId":"req_123"}

event: generation_token
data: {"content":"A"}

event: generation_token
data: {"content":" swift"}

event: generation_completed
data: {"latency":1250,"usage":{"totalTokens":73}}
```

### Grammar Check

Check and correct grammar.

**POST** `/grammar`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "I has completed the project.",
  "language": "en",
  "providerId": "uuid",
  "modelId": "model-id"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "text": "I have completed the project.",
    "corrections": [
      {
        "type": "grammar",
        "original": "has",
        "corrected": "have",
        "position": 2,
        "explanation": "Subject-verb agreement"
      }
    ]
  }
}
```

### Humanize

Improve natural expression.

**POST** `/humanize`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "The utilization of advanced methodologies...",
  "mode": "natural",
  "language": "en",
  "providerId": "uuid",
  "modelId": "model-id"
}
```

**Response:** `200 OK`

### Summarize

Generate a summary.

**POST** `/summarize`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Long text to summarize...",
  "length": "short",
  "format": "bullets",
  "language": "en",
  "providerId": "uuid",
  "modelId": "model-id"
}
```

**Response:** `200 OK`

### Translate

Translate text between languages.

**POST** `/translate`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "sourceLanguage": "en",
  "targetLanguage": "es",
  "providerId": "uuid",
  "modelId": "model-id"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "text": "Hola, ¿cómo estás?",
    "detectedLanguage": "en"
  }
}
```

## Document Endpoints

### List Documents

Get all documents for the authenticated user.

**GET** `/documents?page=1&pageSize=20&archived=false`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `archived` (optional): Include archived (default: false)
- `favorite` (optional): Only favorites (default: false)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "My Document",
        "content": "Document content...",
        "isFavorite": false,
        "isArchived": false,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T11:30:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

### Create Document

Create a new document.

**POST** `/documents`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New Document",
  "content": "Initial content..."
}
```

**Response:** `201 Created`

### Get Document

Get a specific document.

**GET** `/documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Update Document

Update document content or metadata.

**PATCH** `/documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "isFavorite": true
}
```

**Response:** `200 OK`

### Delete Document

Delete a document (soft delete).

**DELETE** `/documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Document Versions

Get version history for a document.

**GET** `/documents/:id/versions`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "input": "Original text",
      "output": "Rewritten text",
      "mode": "standard",
      "synonymLevel": 2,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## History Endpoints

### Get History

Get generation history.

**GET** `/history?page=1&pageSize=20`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `operation` (optional): Filter by operation type

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "operation": "paraphrase",
        "mode": "standard",
        "providerId": "nvidia",
        "modelId": "llama-3.1-8b",
        "input": "Original text...",
        "output": "Rewritten text...",
        "success": true,
        "latency": 1250,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "hasMore": true
  }
}
```

### Delete History Entry

Delete a specific history entry.

**DELETE** `/history/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

## Settings Endpoints

### Get User Preferences

Get user preferences.

**GET** `/settings/preferences`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "defaultMode": "standard",
    "defaultLanguage": "en",
    "defaultSynonymLevel": 2,
    "autoSave": true,
    "theme": "light"
  }
}
```

### Update User Preferences

Update user preferences.

**PATCH** `/settings/preferences`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "defaultMode": "academic",
  "theme": "dark"
}
```

**Response:** `200 OK`

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "requestId": "req_abc123",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication token
- `FORBIDDEN`: User doesn't have access to the resource
- `VALIDATION_ERROR`: Invalid request data
- `PROVIDER_UNAVAILABLE`: AI provider is not accessible
- `PROVIDER_UNAUTHORIZED`: Invalid provider API key
- `PROVIDER_TIMEOUT`: Provider took too long to respond
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `502 Bad Gateway`: Provider error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limits

Default rate limits:

- Authentication endpoints: 5 requests per minute
- Provider test: 10 requests per minute
- AI generation: 20 requests per minute
- Other endpoints: 100 requests per 15 minutes

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1642248000
```
