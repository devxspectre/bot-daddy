# Bot Daddy – AI Live Chat Support Agent

A mini AI support agent for a live chat widget, built for the **Spur Founding Full-Stack Engineer Take-Home Assignment**.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Node.js](https://img.shields.io/badge/Node.js-≥18-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-blue)
![Bun](https://img.shields.io/badge/Bun-1.3-orange)

---

## 🎯 Overview

This project implements a complete AI-powered customer support chat system with:

- **Live Chat Widget** – Embeddable chat UI with real-time messaging
- **RAG-based AI Responses** – Retrieval-Augmented Generation using document knowledge base
- **Session Tracking** – Conversation persistence across page reloads
- **Analytics Dashboard** – Track conversations and chatbot performance

---

## 🏗️ Architecture Overview

```
bot-daddy/
├── apps/
│   ├── bot-api/           # Express + TypeScript backend
│   │   ├── ai/            # LLM integration (Cohere)
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Database operations
│   │   └── middleware/    # Auth middleware
│   └── web/               # Next.js frontend
│       ├── app/           # Pages & API routes
│       ├── components/    # React components
│       └── embed/         # Embeddable chat widget (vanilla JS)
└── packages/
    ├── db/                # Database package
    ├── ui/                # Shared UI components
    └── typescript-config/ # Shared TS configs
```

### Backend Structure (Separation of Concerns)

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Routes** | `apps/bot-api/routes/` | HTTP endpoints, request validation, auth |
| **Services** | `apps/bot-api/services/db.ts` | Database operations, business logic |
| **AI** | `apps/bot-api/ai/index.ts` | LLM calls, embedding generation |
| **Middleware** | `apps/bot-api/middleware/` | JWT authentication |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Bun** 1.3+ (package manager)
- **PostgreSQL** with `pgvector` extension
- **Cohere API Key** (free tier available)

### 1. Clone & Install

```bash
git clone <repository-url>
cd bot-daddy
bun install
```

### 2. Database Setup

#### Option A: Docker (Recommended)

```bash
docker run -d \
  --name postgres-vector \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

#### Option B: Existing PostgreSQL

Enable the pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

> **Note:** The database tables are auto-created on server startup via `initDatabase()` in `apps/bot-api/services/db.ts`. No manual migrations required.

### 3. Environment Variables

Create `.env` files in the following locations:

#### `apps/bot-api/.env`

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# LLM Provider
COHERE_API_KEY=your_cohere_api_key_here

# Server
PORT=3001

# Auth
JWT_SECRET=your_jwt_secret_here
```

#### `apps/web/.env`

```env
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run Development Servers

```bash
# Run both frontend and backend
bun run dev

# Or run individually:
cd apps/bot-api && bun run dev   # Backend on :3001
cd apps/web && bun run dev       # Frontend on :3000
```

---

## 🔌 API Reference

### Chat Endpoint

```http
POST /api/v1/chat
Content-Type: application/json

{
  "query": "What's your return policy?",
  "apiKey": "bd_live_xxxx...",
  "chatbotId": "optional_chatbot_id",
  "sessionId": "uuid-session-id"
}
```

**Response:**
```json
{
  "answer": "Our return policy allows returns within 30 days...",
  "sources": [
    {
      "filename": "policies.pdf",
      "chunkIndex": 2,
      "similarity": 0.89,
      "preview": "Return policy: Customers may return..."
    }
  ]
}
```

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/signup` | User registration |
| POST | `/api/v1/user/signin` | User login |
| POST | `/api/v1/file/upload` | Upload PDF knowledge base |
| GET | `/api/v1/file/documents` | List uploaded documents |
| POST | `/api/v1/chatbot` | Create a chatbot |
| GET | `/api/v1/chatbot` | List user's chatbots |
| GET | `/api/v1/chatbot/public/:id` | Get public chatbot config |
| PUT | `/api/v1/chatbot/:id` | Update a chatbot |
| DELETE | `/api/v1/chatbot/:id` | Delete a chatbot |
| POST | `/api/v1/chat/session/end` | End a chat session |
| GET | `/api/v1/api-keys` | List user's API keys |
| POST | `/api/v1/api-keys` | Create new API key |
| DELETE | `/api/v1/api-keys/:id` | Revoke an API key |
| POST | `/api/v1/api-keys/validate` | Validate API key (public) |
| GET | `/api/v1/analytics/summary` | Get total conversation count |
| GET | `/api/v1/analytics/daily` | Get daily conversation stats |
| GET | `/api/v1/analytics/sessions` | Get session logs |

---

## 🤖 LLM Integration

### Provider: Cohere

This project uses **Cohere** as the LLM provider for:

1. **Text Generation** – `command-r7b-12-2024` model
2. **Embeddings** – `embed-english-v3.0` (1024 dimensions)

### Why Cohere?

- Free tier with generous limits
- Fast inference
- High-quality embeddings for RAG
- Simple API

### Prompt Design

The system prompt is defined in `apps/bot-api/routes/chat.ts`:

```
You are an AI assistant that ONLY provides information about this business.
You must STRICTLY follow these rules:

ABSOLUTE RULES (NEVER BREAK THESE):
1. You can ONLY share information that is EXPLICITLY stated in the BUSINESS INFO
2. You are NOT the business - you are a support bot FOR the business
3. NEVER answer questions about yourself
4. NEVER answer general knowledge questions, coding, math, trivia
5. NEVER make up or infer information not in BUSINESS INFO

RESPONSE STYLE:
- Be concise: 1-3 sentences maximum
- Be direct: get to the point immediately
- Be complete: finish your sentences properly
- Be friendly: use a warm, professional tone
```

### How RAG Works

1. User uploads PDF documents (knowledge base)
2. PDFs are chunked (800 chars, 100 overlap) and embedded
3. On chat, user query is embedded and matched via cosine similarity
4. Top-k relevant chunks become context for LLM
5. LLM generates response using only the provided context

---

## 📦 Data Model

### Tables (Auto-created)

```sql
-- Users
users (id, cuid, email, password_hash, name, is_verified, created_at)

-- Documents (Knowledge Base)
documents (id, user_id, filename, chunk_index, content, embedding, file_size, created_at)

-- Chatbots
chatbots (id, public_id, user_id, name, color, status, created_at)

-- Chatbot-Document Links
chatbot_documents (id, chatbot_id, filename, created_at)

-- Chat Sessions
chat_sessions (id, session_id, chatbot_id, started_at, ended_at, message_count)

-- Chat Messages
chat_messages (id, session_id, chatbot_id, user_message, bot_response, created_at)

-- API Keys
api_keys (id, user_id, key_prefix, key_hash, plan, rate_limit, last_used_at, is_active, created_at)
```

---

## 📚 FAQ / Domain Knowledge

To seed the agent with knowledge about your fictional store:

### Option 1: Upload PDF Documents

1. Sign up and get your API key
2. Upload PDF files via dashboard or API:

```bash
curl -X POST http://localhost:3001/api/v1/file/upload \
  -F "file=@policies.pdf" \
  -F "apiKey=bd_live_xxxx..."
```

3. Create a chatbot and link the documents

### Option 2: Create a Knowledge Base PDF

Create a `store-info.pdf` with content like:

```
ACME Store - Customer Support Information

SHIPPING POLICY:
- We ship to USA, Canada, and UK
- Standard shipping: 5-7 business days ($5.99)
- Express shipping: 2-3 business days ($12.99)
- Free shipping on orders over $50

RETURN POLICY:
- Returns accepted within 30 days
- Items must be unused and in original packaging
- Refunds processed within 5-7 business days
- Contact support@acmestore.com for return labels

SUPPORT HOURS:
- Monday to Friday: 9 AM - 6 PM EST
- Saturday: 10 AM - 4 PM EST
- Sunday: Closed
- Email: support@acmestore.com
- Response time: Within 24 hours
```

---

## 🔒 Robustness & Error Handling

### Input Validation

- ✅ Empty messages rejected (`400 Bad Request`)
- ✅ Long messages handled (chunked by LLM context limits)
- ✅ API key validation with clear error messages
- ✅ File type validation (PDF only, max 5MB)

### Error Cases

| Scenario | Handling |
|----------|----------|
| Invalid API key | `401 Unauthorized` with message |
| Empty query | `400 Bad Request` |
| LLM API failure | Catches error, returns friendly message |
| Database error | Logged, returns `500` with generic message |
| No relevant docs | Returns "No relevant documents found" |
| Session end fails | Silent failure (best-effort) |

### Security

- ✅ API keys are hashed (SHA-256) before storage
- ✅ Passwords hashed with bcrypt
- ✅ CORS enabled with proper configuration
- ✅ No secrets in repository (`.env` in `.gitignore`)

---

## ✨ Chat Widget Features

The embeddable widget (`apps/web/embed/`) provides:

- 📜 Scrollable message list
- 👤 Clear user/AI message distinction
- ⌨️ Enter to send
- 📍 Auto-scroll to latest message
- 🔒 Disabled send while processing
- ⏳ "Agent is typing..." indicator
- 🎨 Customizable colors
- 📊 Session tracking for analytics

### Embedding the Widget

```html
<script src="https://your-domain.com/bot-daddy.js"></script>
<script>
  BotDaddy.init({
    apiUrl: 'https://api.your-domain.com',
    apiKey: 'bd_live_xxxx...',
    chatbotId: 'your_chatbot_public_id',
    title: 'Sales Assistant',
    primaryColor: '#2563eb',
    greeting: 'Hi! How can I help you today?'
  });
</script>
```

---

## 🏭 Production Build

```bash
# Build all apps
bun run build

# Build embed widget separately
bun run build:embed
```

---

## 🚢 Deployment

### Backend (bot-api)

Deploy to Render, Railway, or any Node.js host:

```bash
cd apps/bot-api
bun run build
bun run dist/index.js
```

### Frontend (web)

Deploy to Vercel:

```bash
cd apps/web
vercel deploy
```

### Environment Variables (Production)

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
COHERE_API_KEY=your_production_key
JWT_SECRET=strong_random_secret
NEXTAUTH_SECRET=another_strong_secret
NEXTAUTH_URL=https://your-frontend-domain.com
```

---

## 📈 Trade-offs & Design Decisions

### Chosen Approach

| Decision | Rationale |
|----------|-----------|
| **Cohere over OpenAI** | Free tier, simpler API, fast |
| **Raw SQL over ORM** | More control, better pgvector support |
| **Bun over npm** | Faster installs, native TypeScript |
| **Vanilla JS embed** | No framework dependencies, tiny bundle |
| **Session via UUID** | Simple, no auth needed for chat |

### Not Implemented (Time Constraints)

- ❌ Redis caching for frequent queries
- ❌ Rate limiting middleware
- ❌ Streaming responses (SSE)
- ❌ Message history in prompts (full context)
- ❌ Conversation export

---

## 🔮 If I Had More Time...

1. **Streaming Responses** – Use SSE for real-time token streaming
2. **Redis Caching** – Cache embeddings and frequent queries
3. **Rate Limiting** – Implement per-API-key rate limits
4. **Full Conversation History** – Include previous messages in LLM context
5. **Multi-language Support** – i18n for the chat widget
6. **Webhook Integrations** – Notify on new conversations
7. **Admin Dashboard** – Conversation review and human handoff
8. **A/B Testing** – Different prompts for different chatbots
9. **Better Error Boundaries** – More granular error handling in UI
10. **E2E Tests** – Playwright tests for critical flows

---

## 📄 License

MIT

---
