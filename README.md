<div align="center">

# ⚡ RewriteBot
### The Open-Source, Privacy-First AI Writing & Paraphrasing Suite

**A high-performance, self-hostable alternative to QuillBot with zero subscriptions, BYO-AI flexibility, and Turnitin-grade originality auditing.**

<br/>

[![Live Production App](https://img.shields.io/badge/Live%20App-rewritebot--client.vercel.app-670626?style=for-the-badge&logo=vercel&logoColor=white)](https://rewritebot-client.vercel.app/)
[![Browser Extension](https://img.shields.io/badge/Edge%20%2F%20Chrome%20Store-v1.0.1%20Ready-10b981?style=for-the-badge&logo=googlechrome&logoColor=white)](https://rewritebot-client.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

[Try Live Demo](https://rewritebot-client.vercel.app/) •
[Why RewriteBot?](#-why-rewritebot) •
[Full Suite Tools](#-the-all-in-one-writing-suite) •
[Key Engineering Highlights](#-key-engineering-highlights) •
[Architecture](#-architecture) •
[Quickstart](#-quickstart) •
[Supported AI Engines](#-supported-ai-providers) •
[Browser Extension](#-browser-extension) •
[Privacy & Encryption](#-security--privacy)

</div>

---

## 💡 Why RewriteBot?

Most modern writing assistants (like QuillBot, Grammarly, and Wordtune) suffer from three critical problems:
1. **Aggressive Paywalls**: Basic features like academic phrasing, unlimited words, or plagiarism checks cost $10–$20/month.
2. **Black-Box Privacy**: Your essays, proprietary articles, and emails are processed through opaque servers and potentially used to train models.
3. **Plagiarism & AI Flags**: Standard rewriting tools often produce formulaic phrasing that triggers Turnitin, Copyleaks, or GPTZero detection.

**RewriteBot solves all three:**
- **Bring Your Own AI (BYO-AI)**: Plug in a free Groq key, Google Gemini, OpenAI, Claude, or run 100% offline with local Ollama models. Pay raw provider cost ($0.00) with zero markup.
- **Enterprise-Grade Privacy**: Your API keys are encrypted with **AES-256-GCM**. Prompts and documents are never sold, logged, or used for training.
- **QuillBot-Level Suite**: Paraphraser, Live Grammar Checker, AI Humanizer, Summarizer, Translator, and Deep Plagiarism Auditor all in one unified, responsive workspace.

---

## 🧰 The All-in-One Writing Suite

RewriteBot gives you a comprehensive suite of writing tools right out of the box:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ✍️ Paraphraser  •  🔍 Grammar Checker  •  🧠 AI Humanizer  •  📋 Summarizer  •  🌐 Translator  •  🛡️ Plagiarism  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. ✍️ Intelligent Multi-Mode Paraphraser
- **9 Specialized Writing Tones**:
  - **Standard**: Balanced rewriting preserving core meaning and nuance.
  - **Fluency**: Eliminates clunky phrasing and boosts syntactic flow.
  - **Formal**: Polished, corporate-ready communication.
  - **Academic**: Scholarly diction, complex sentence logic, and research-grade phrasing.
  - **Simple**: Plain language, high accessibility, and high readability.
  - **Creative**: Evocative vocabulary and expressive cadence.
  - **Expand**: Elaborates ideas with relevant detail and examples.
  - **Shorten**: Dense, concise prose removing verbal clutter.
  - **Humanize**: Organic sentence structures designed to flow naturally.
- **Interactive 3-Color Highlight Diff**: Instantly distinguishes **Changed Words** (yellow), **Longest Unchanged** (blue), and **Structural Shifts** (red).
- **Click-to-Swap Synonym Thesaurus**: Click any highlighted word to inspect contextual synonyms and swap them in one click.
- **Sentence Alternative Cycler (`< 1 of 3 >`)**: Click any sentence in the editor to cycle through AI-suggested variations and replace in-place.
- **Freeze Words**: Protect brand names, technical jargon, or quotes with one-click word freezing.
- **Compare Modes**: Side-by-side multi-pane view comparing up to 4 rewrite modes simultaneously.

### 2. 🔍 Interactive Grammar & Spelling Checker
- **Deep Syntactic Proofreader**: Detects grammatical agreement errors, typographical mistakes, punctuation flaws, and awkward stylistic choices.
- **Color-Coded Diagnostic Tags**: Categorized badges for `Spelling` (red), `Grammar` (amber), `Punctuation` (indigo), and `Style` (purple).
- **One-Click Auto-Fix**: Automatically inspects input text and renders corrected, polished prose directly into the output panel.
- **Granular Drawer**: Inspect why an error was flagged with original-to-corrected visual diffs and linguistic explanations.

### 3. 🧠 AI Humanizer (Stealth Mode)
- **Natural Cadence Engine**: Strips repetitive AI hallmarks (e.g., *"delve"*, *"testament"*, *"tapestry"*, uniform sentence lengths) to produce genuine human burstiness and rhythm.
- **Targeted Humanizer Tones**: Choose between *Natural*, *Conversational*, *Academic*, *Casual*, and *Professional*.
- **Live Authenticity Score**: Displays an estimated human authenticity index (up to 98%+) to verify that output sounds natural.

### 4. 📋 Document Summarizer
- **Customizable Length**: Choose between *Short* (concise summary), *Medium* (balanced overview), or *Detailed* (exhaustive breakdown).
- **Versatile Formats**:
  - *Paragraph*: Continuous narrative summary.
  - *Bullet Points*: Fast, scannable list of key details.
  - *Key Takeaways*: Crucial conclusions and action items.
  - *Executive Summary*: High-impact professional briefing.

### 5. 🌐 Polyglot Translator
- **Dual-Pane Bilingual Workspace**: Translate text seamlessly between 12+ world languages (English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Hindi, Arabic, etc.).
- **Automatic Language Detection**: Auto-detects input language instantly.
- **One-Click Language Swap**: Quickly reverse source and target languages with a single button.

### 6. 🛡️ Plagiarism & Originality Auditor
- **Turnitin-Grade N-Gram Analysis**: Evaluates consecutive matching sequences against indexed web datasets to identify matching phrases.
- **Source Breakdown & Match Percentages**: Detailed breakdown of similar sources, matching URLs, and sentence-by-sentence similarity risk.
- **Instant In-Place Sentence Re-writing**: Click any flagged sentence to rephrase it in-place and watch the originality score rise in real time.
- **Downloadable PDF Audit Certificate**: Export professional, publication-ready PDF audit reports formatted with timestamp, source logs, and originality certification.

---

## ⚡ Key Engineering Highlights

| Feature | How It Works | Benefit |
| :--- | :--- | :--- |
| **Server-Sent Events (SSE)** | Streams tokens via Fastify & Axios using chunked HTTP streams | Sub-500ms time-to-first-token (TTFB) |
| **AES-256-GCM Vault** | Every API key is encrypted with a unique 12-byte IV and authentication tag | Your keys remain completely safe at rest |
| **Dual Fallback Pipeline** | If streaming is blocked by a proxy, the client falls back to standard HTTP | 100% reliable responses under any network condition |
| **Turnitin Consecutive Matching** | Tracks 4+ token consecutive identical subsequences rather than naive string matches | Eliminates false-positive plagiarism warnings |
| **In-Memory Caching** | Hot-caches AI responses and plagiarism analyses (10-minute TTL) | Zero unnecessary API costs on repeated scans |
| **Responsive Studio Engine** | Optimized layout that works on ultra-narrow mobile screens up to 4K displays | Full writing experience on phone, tablet, and desktop |

---

## 🏗️ Architecture

RewriteBot is structured as a modern TypeScript monorepo with clean boundary isolation:

```
rewritebot/
├── client/              # React 18 + Vite SPA (Lucide icons, Zustand, Editorial Design)
├── server/              # Node.js + Fastify backend with REST, SSE streaming & Prisma ORM
├── shared/              # Shared types, Zod schemas, and data contracts
├── extension/           # Edge / Chrome Manifest V3 Browser Extension
├── prisma/              # Schema definitions and database migrations
└── docker-compose.yml   # Multi-container orchestration (Fastify + Postgres + Redis)
```

```mermaid
graph TD
    Client["React 18 Studio / Chrome Extension"] -->|REST / SSE Streaming| Fastify["Fastify Backend API"]
    Fastify --> Auth["Argon2 + JWT Auth"]
    Fastify --> Encrypt["AES-256-GCM Key Vault"]
    Fastify --> Cache["In-Memory & Redis Cache"]
    Fastify --> DB[("PostgreSQL (Neon / Supabase)")]
    Fastify --> Orchestrator["AI Orchestrator"]
    Orchestrator --> Groq["Groq LPU (Sub-second)"]
    Orchestrator --> OpenAI["OpenAI (GPT-4o / GPT-4o-mini)"]
    Orchestrator --> Gemini["Google Gemini (1.5 Flash / Pro)"]
    Orchestrator --> Anthropic["Anthropic (Claude 3.5 Sonnet)"]
    Orchestrator --> Ollama["Ollama (Local / 100% Offline)"]
```

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local or serverless (Neon, Supabase, Railway)
- **Redis**: Optional, for distributed rate-limiting

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/lucky4-git1/rewritebot.git
cd rewritebot
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment configurations:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rewritebot?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key"
CREDENTIAL_ENCRYPTION_KEY="32-byte-base64-encoded-key"
PORT=3000
APP_URL="http://localhost:5173"
API_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:5173"
```
*(Tip: Generate a 32-byte key using `node -e "console.log(crypto.randomBytes(32).toString('base64'))"`)*

### 3. Initialize Database Migrations
```bash
npm run db:migrate
```

### 4. Run Development Server
```bash
npm run dev
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`

---

## 🤖 Supported AI Providers

RewriteBot works with any provider that supports OpenAI-compatible chat completions or native APIs:

| Provider | Type | Recommended Model | Latency | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Groq** | Cloud LPU | `llama-3.3-70b-versatile` | **~250ms** | Free tier available |
| **OpenAI** | Cloud API | `gpt-4o-mini`, `gpt-4o` | ~700ms | Pay-as-you-go |
| **Google Gemini** | Cloud API | `gemini-1.5-flash` | ~600ms | Free tier available |
| **Anthropic** | Cloud API | `claude-3-5-sonnet` | ~900ms | Pay-as-you-go |
| **NVIDIA NIM** | Cloud API | `meta/llama-3.2-11b-vision-instruct` | ~1.1s | Free trial credits |
| **Ollama** | Local Hardware | `llama3.2`, `mistral` | Variable | **100% Free & Offline** |
| **Custom OpenAI API** | Any Endpoint | Any custom model | Variable | Self-managed |

---

## 🧩 Browser Extension

RewriteBot includes a full Manifest V3 browser extension for **Google Chrome**, **Microsoft Edge**, and **Brave**:

- **Inline Floating Bubble**: Select any text on any webpage to instantly rephrase, summarize, or fix grammar without leaving your tab.
- **Popup Mini Studio**: Quick paraphrasing directly from your browser toolbar.
- **1-Click Sync**: Synchronizes authenticated sessions from your web dashboard automatically.
- **Discreet Settings**: Clean end-user experience with technical backend URLs neatly tucked into an Advanced Settings drawer.

### Building the Extension
```bash
cd extension
npm install
npm run build
```
Load the unpacked `extension/dist` folder into `chrome://extensions` or `edge://extensions`.

---

## 🔒 Security & Privacy

1. **Authenticated Encryption (AES-256-GCM)**: All API keys stored in the database are encrypted with authenticated cipher blocks. Even database administrators cannot read your plain credentials.
2. **Zero Text Retention**: Your prompts and generated outputs are never collected, logged into external monitoring services, or indexed to train public models.
3. **SSRF Protection**: Custom base URLs undergo strict URL protocol and host sanitization to block Server-Side Request Forgery attacks.
4. **Argon2 Password Hashing**: State-of-the-art password security resistant to GPU cracking and rainbow table attacks.

---

## 📜 License

Distributed under the **MIT License**. Free for commercial and non-commercial use. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**Built with passion by writers and engineers who believe world-class AI writing tools should be open, private, and subscription-free.**

⭐ **Star this repo on GitHub if you find it helpful!**

</div>
