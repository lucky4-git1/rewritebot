<div align="center">

# ⚡ RewriteBot

**Your Private, High-Performance, Provider-Agnostic AI Writing Workspace**

### 🚀 [Visit RewriteBot - AI Writing Workspace](https://rewritebot-client.vercel.app/) to experience the application!

[![Live Application](https://img.shields.io/badge/Live%20Demo-rewritebot--client.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://rewritebot-client.vercel.app/)
<br/><br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[Try Live Demo](https://rewritebot-client.vercel.app/) •
[Key Features](#-key-features) •
[Architecture](#-architecture) •
[Quickstart](#-quickstart) •
[AI Providers](#-supported-ai-providers) •
[Security](#-security--privacy) •
[API Reference](#-api-endpoints)

</div>

---

## 📖 Overview

**RewriteBot** is a production-grade, privacy-first AI writing and paraphrasing platform built on the **Bring Your Own AI (BYO-AI)** philosophy. 

Unlike proprietary writing assistants that lock you into recurring subscriptions with hidden rate-limits and proprietary black-box models, RewriteBot lets you connect directly to any cloud AI provider (NVIDIA, Groq, OpenAI, Anthropic, Gemini, DeepSeek, Mistral) or local LLM runtime (Ollama, LM Studio) using your own API credentials or local hardware.

Your credentials remain encrypted on your terms, your text is never used for model training, and AI inference happens at raw provider cost and speed.

---

## ✨ Key Features

### 🚀 Real-Time Streaming Paraphraser
- **Instant TTFB (< 500ms)**: Real-time Server-Sent Events (SSE) stream tokens to the screen as soon as the provider generates them.
- **Dynamic Typing Cursor**: Visual live feedback as output streams into the editor.
- **Graceful Auto-Fallback**: Automatically falls back to standard non-streaming generation if client network proxies disrupt SSE.

### 🎯 9 Specialized Writing Modes
- **Standard**: Balanced rewriting preserving core meaning.
- **Fluency**: Polish grammatical structure, flow, and readability.
- **Formal**: Elevate vocabulary for professional and corporate communications.
- **Academic**: Rigorous scholarly tone with sophisticated vocabulary.
- **Simple**: Clear, plain-language prose accessible to broad audiences.
- **Creative**: Expressive, evocative imagery and varied sentence cadences.
- **Expand**: Elaborate concepts with illustrative depth and detail.
- **Shorten**: Concise, high-density editing eliminating redundancy.
- **Humanize**: Natural cadence that smooths robotic AI phrasing.

### 🔍 Interactive Word Diff & Thesaurus
- **Visual Diff Highlighting**: Instantly see changes color-coded against your original text.
- **Click-to-Swap Thesaurus**: Click any highlighted altered word to browse contextual synonyms and swap them in one click.
- **Change Percentage & Metrics**: Live telemetry on word count, reading time, and alteration ratio.

### 🛡️ Bring Your Own AI (BYO-AI)
- **Zero Markup**: Connect your existing cloud keys or local models.
- **Encrypted Credential Vault**: Stored API keys are encrypted at rest with authenticated **AES-256-GCM**.
- **Model Agnostic**: Compatible with any model supporting standard chat completions.

### 📂 Productivity & Workspace Tools
- **Version History**: Automatically records every generation with input/output comparison, metrics, and timestamps.
- **Export Options**: Export rewritten documents in `.txt`, `.md`, `.docx`, or `.pdf` formats.
- **Document Management**: Create, edit, and organize multiple active drafts.

---

## 🏗️ Architecture

RewriteBot is structured as an npm monorepo with strict separation of concerns, built for sub-second responses and low memory footprint.

```
rewritebot/
├── client/          # Single-Page Application (React 18 + Vite + TypeScript)
├── server/          # High-performance REST & SSE API (Node.js + Fastify + Prisma)
├── shared/          # Shared TypeScript interfaces, types, and Zod validation schemas
├── prisma/          # Database schema and migration tracking
└── docker-compose.yml
```

### High-Level Request Pipeline

```
[ Browser (React SPA) ]
       │
       ▼ (HTTPS / WSS / SSE)
[ Edge / CDN (Vercel) ]
       │
       ▼ (Reverse Proxy / Envoy)
[ Fastify Backend (Northflank Container) ]
       ├── Authentication (JWT + Argon2)
       ├── In-Memory Provider Cache (Zero DB roundtrip overhead)
       ├── Fast-fail Redis Rate Limiter (Non-blocking fail-open)
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
[ Neon PostgreSQL ]      [ Upstash Redis ]        [ AI Providers ]
  • User Profiles          • Token Rate Limits     • NVIDIA NIM
  • Encrypted Keys         • Cache Invalidation    • Groq LPU
  • History Logs                                   • OpenAI / Anthropic
                                                   • Ollama / LM Studio
```

---

## ⚡ Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14+ (or free serverless Neon instance)
- **Redis**: v7+ (or free serverless Upstash instance)

### 1. Clone & Install

```bash
git clone https://github.com/lucky4-git1/rewritebot.git
cd rewritebot
npm install
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://user:pass@host:5432/rewrite?sslmode=require` |
| `REDIS_URL` | Redis connection URL | `rediss://default:token@host:6379` |
| `JWT_SECRET` | 32+ char secret for JWT access tokens | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | 32+ char secret for refresh tokens | `openssl rand -base64 32` |
| `CREDENTIAL_ENCRYPTION_KEY` | 32-byte Base64 key for AES-256-GCM | `openssl rand -base64 32` |
| `APP_URL` | Frontend URL | `http://localhost:5173` |
| `API_URL` | Backend URL | `http://localhost:3000` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |

### 3. Initialize Database

Run Prisma migrations to set up tables and relations:

```bash
npm run db:migrate
```

### 4. Run Development Servers

```bash
npm run dev
```

* **Frontend**: `http://localhost:5173`
* **API Server**: `http://localhost:3000`
* **API Healthcheck**: `http://localhost:3000/health`

---

## 🐳 Docker Deployment

Run the complete multi-tier application stack with Docker Compose:

```bash
# Build and run containers in background
docker compose up -d

# View container logs
docker compose logs -f

# Stop containers
docker compose down
```

---

## 🤖 Supported AI Providers

RewriteBot supports all major commercial providers, specialized low-latency inference clouds, and local self-hosted engines:

| Provider | Type | Recommended Models | Performance Profile |
| :--- | :--- | :--- | :--- |
| **NVIDIA NIM** | Cloud API | `meta/llama-3.2-11b-vision-instruct` | High speed (~1.1s latency, enterprise grade) |
| **Groq** | Cloud LPU | `qwen/qwen3.8-27b`, `llama-3.3-70b-versatile` | Ultra-low TTFB (< 300ms) |
| **OpenAI** | Cloud API | `gpt-4o-mini`, `gpt-4o` | High accuracy & instruction following |
| **Anthropic** | Cloud API | `claude-3-5-haiku`, `claude-3-5-sonnet` | Nuanced, human-like cadence |
| **Google Gemini** | Cloud API | `gemini-1.5-flash`, `gemini-1.5-pro` | Large context windows |
| **Ollama** | Local Engine | `llama3.2:latest`, `mistral:7b` | 100% offline, zero API cost |
| **LM Studio** | Local Engine | Any local GGUF model | GUI-driven local inference |
| **OpenAI-Compatible** | Any Endpoint | Custom | Compatible with any OpenAI API clone |

### Configuring NVIDIA NIM
1. Register on [NVIDIA Build](https://build.nvidia.com/) and generate an API key (`nvapi-...`).
2. In RewriteBot, open **Providers** → **Add Provider**.
3. Select **NVIDIA**.
4. Set Base URL: `https://integrate.api.nvidia.com/v1`
5. Select Model: `meta/llama-3.2-11b-vision-instruct` (vetted for fast, non-reasoning sub-second paraphrasing).
6. Click **Test & Save**.

### Configuring Local Ollama
1. Download and start [Ollama](https://ollama.ai/):
   ```bash
   ollama run llama3.2
   ```
2. In RewriteBot, select **Ollama** under Providers.
3. Set Base URL: `http://localhost:11434` (or `http://host.docker.internal:11434` in Docker).
4. Save and begin offline writing.

---

## 🔒 Security & Privacy

* **Zero Content Logging**: Prompts, input documents, and paraphrased text are never logged to server log files or transmitted to external observability platforms.
* **Encrypted Secrets**: Provider API keys are encrypted at rest with **AES-256-GCM** using unique per-credential initialization vectors (`iv`) and authentication tags (`tag`).
* **SSRF Guard**: Custom provider endpoints are strictly validated to prevent Server-Side Request Forgery against internal infrastructure.
* **Brute-Force & Rate Protection**: Redis-backed distributed rate limiters throttle login attempts and generation spam.
* **Memory Provider Isolation**: Provider instances are cached safely in memory per unique provider ID and invalidated immediately upon credential revocation or deletion.

---

## 📡 API Endpoints

All core API routes are prefixed under `/api/v1`:

### Authentication
* `POST /api/v1/auth/register` — Register new user account.
* `POST /api/v1/auth/login` — Authenticate and receive access + refresh JWTs.
* `POST /api/v1/auth/refresh` — Rotate expired access tokens.
* `GET /api/v1/auth/me` — Retrieve authenticated user profile.

### AI Providers
* `GET /api/v1/providers` — List user-configured AI providers.
* `POST /api/v1/providers` — Add and encrypt new AI provider credentials.
* `PUT /api/v1/providers/:id` — Update provider configuration or model.
* `DELETE /api/v1/providers/:id` — Delete provider and revoke cached instances.
* `POST /api/v1/providers/:id/test` — Test provider connection latency.

### Paraphrasing & Writing
* `POST /api/v1/paraphrase` — Execute standard paraphrasing request.
* `POST /api/v1/paraphrase/stream` — Real-time Server-Sent Events (SSE) streaming paraphrasing.

### Workspace & History
* `GET /api/v1/history` — Fetch user's generation history.
* `DELETE /api/v1/history/:id` — Delete history record.
* `GET /api/v1/documents` — List saved user documents.
* `POST /api/v1/documents` — Create new workspace document.

---

## 🌐 Experience RewriteBot

Experience the live application in production:

👉 **[RewriteBot - AI Writing Workspace](https://rewritebot-client.vercel.app/)**

---

## 🛠️ Tech Stack Reference

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Zustand.
- **Backend**: Node.js, Fastify, Prisma ORM, ioredis, fast-jwt, Argon2.
- **Infrastructure**: Docker, Neon PostgreSQL, Upstash Redis.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Built with ❤️ for writers and engineers who value speed, privacy, and full control over their AI tools.
</div>
