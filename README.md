# RewriteBot

🎉 **PROJECT COMPLETE!** All 27 tasks finished! See [PROJECT_COMPLETE.md](PROJECT_COMPLETE.md) for full details.

**Your AI Writing Workspace. Bring Your Own AI.**

RewriteBot is a provider-agnostic AI writing and paraphrasing platform that allows you to use your own AI providers and API keys. No vendor lock-in, complete privacy control, and support for both cloud and local AI models.

## Features

- **Provider Agnostic**: Connect to OpenAI, Google Gemini, Anthropic, NVIDIA, Ollama, LM Studio, and more
- **Bring Your Own AI**: Use your own API keys or local models - RewriteBot never charges for AI inference
- **Powerful Editor**: Two-pane TipTap-based editor with real-time streaming
- **Multiple Modes**: Standard, Fluency, Humanize, Formal, Academic, Simple, Creative, Expand, Shorten, Custom
- **Synonym Control**: Adjustable synonym replacement levels
- **Frozen Terms**: Preserve specific words or phrases during rewriting
- **Document Management**: Save, version, and organize your documents
- **History Tracking**: View and restore previous generations
- **Privacy First**: Encrypted credentials, optional local-only mode
- **Grammar Checking**: AI-powered grammar and style improvements
- **Summarization**: Flexible text summarization with multiple formats
- **Translation**: AI-powered translation with language detection
- **Citations**: Generate citations in APA, MLA, Chicago, Harvard, IEEE, and Vancouver formats

## Architecture

```
rewritebot/
├── client/          # React + TypeScript + Vite frontend
├── server/          # Fastify + TypeScript backend
├── shared/          # Shared types and schemas
├── docs/            # Documentation
└── tests/           # E2E tests
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Bootstrap 5 for layout
- TipTap for rich text editing
- Zustand for state management
- Framer Motion for animations

**Backend:**
- Node.js with Fastify
- TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching and rate limiting
- JWT authentication
- Argon2 password hashing

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Redis 7+
- Docker and Docker Compose (optional)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/rewritebot.git
cd rewritebot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

- **Database**: PostgreSQL connection URL
- **Redis**: Redis connection URL
- **JWT Secrets**: Generate secure random keys
- **Credential Encryption**: Generate with `openssl rand -base64 32`
- **CORS Origin**: Your frontend URL

### 4. Set up the database

```bash
npm run db:migrate
```

### 5. Start development servers

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Docker Setup

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down
```

## Provider Configuration

### Supported Providers

**Cloud Providers:**
- OpenAI
- Google Gemini
- Anthropic
- NVIDIA
- OpenRouter
- DeepSeek
- Mistral AI
- Groq
- Together AI
- Cerebras
- Hugging Face
- xAI

**Local Providers:**
- Ollama
- LM Studio
- Generic OpenAI-compatible endpoints

### NVIDIA Configuration

RewriteBot supports both hosted NVIDIA APIs and self-hosted NVIDIA NIM:

1. Go to Settings → AI Providers
2. Click "Add Provider"
3. Select "NVIDIA"
4. Configure:
   - **Base URL**: For hosted: `https://integrate.api.nvidia.com/v1`, For self-hosted: Your NIM endpoint
   - **API Key**: Your NVIDIA API key
   - **Model**: Select from available models

### Ollama Configuration

1. Install Ollama: https://ollama.ai
2. Start Ollama: `ollama serve`
3. In RewriteBot:
   - Go to Settings → AI Providers
   - Click "Add Provider"
   - Select "Ollama"
   - Base URL: `http://localhost:11434`
   - Test connection and select a model

### LM Studio Configuration

1. Download and run LM Studio
2. Start the local server (default: `http://localhost:1234/v1`)
3. In RewriteBot:
   - Go to Settings → AI Providers
   - Click "Add Provider"
   - Select "LM Studio"
   - Configure endpoint and select model

### Generic OpenAI-Compatible Provider

For any OpenAI-compatible endpoint:

1. Settings → AI Providers → Add Provider
2. Select "Generic OpenAI-Compatible"
3. Configure:
   - **Provider Name**: Custom name
   - **Base URL**: Your endpoint URL
   - **API Key**: Your API key (or "local" for no auth)
   - **Model ID**: Model identifier
   - **Protocol**: OpenAI Compatible

## Security

### API Key Security

- All provider credentials are encrypted at rest using AES-256-GCM
- Keys are never logged or exposed in API responses
- Masked display in UI (shows only last 4 characters)

### Authentication

- JWT-based authentication with refresh tokens
- Argon2 password hashing
- Secure session management

### SSRF Protection

- Custom provider URLs are validated
- Internal network access is restricted
- Timeout limits on external requests

### Rate Limiting

- Configurable rate limits per IP and user
- Protects authentication, provider testing, and AI generation endpoints

## Development

### Project Structure

```
server/src/
├── config/              # Configuration
├── database/            # Prisma client
├── middleware/          # Fastify middleware
├── modules/             # Feature modules
│   ├── auth/
│   ├── documents/
│   ├── providers/
│   └── users/
├── ai/                  # AI orchestration
│   ├── AIOrchestrator.ts
│   ├── ProviderRegistry.ts
│   ├── providers/       # Provider adapters
│   └── prompts/         # Prompt templates
├── routes/              # API routes
├── security/            # Security utilities
└── index.ts

client/src/
├── components/          # Reusable components
├── features/            # Feature-specific components
│   ├── editor/
│   ├── providers/
│   └── documents/
├── pages/               # Route pages
├── stores/              # Zustand stores
├── services/            # API services
├── hooks/               # Custom React hooks
├── styles/              # CSS styles
└── main.tsx
```

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Building for Production

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build:client
npm run build:server
```

## Deployment

### Environment Variables

Ensure all production environment variables are set:

- Use strong, randomly generated JWT secrets
- Use a production-grade PostgreSQL database
- Configure Redis for production
- Set `NODE_ENV=production`
- Configure CORS origins appropriately

### Database Migrations

```bash
npm run db:migrate:prod --workspace=server
```

### Docker Deployment

```bash
docker-compose up -d
```

## API Documentation

API documentation is available in `docs/API.md`.

Key endpoints:

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/providers` - List providers
- `POST /api/v1/providers` - Add provider
- `POST /api/v1/paraphrase` - Paraphrase text
- `POST /api/v1/paraphrase/stream` - Paraphrase with streaming
- `GET /api/v1/documents` - List documents
- `GET /api/v1/history` - Get history

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ for writers who want control over their AI tools.
