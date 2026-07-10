# Relay — Backend

Express.js 5 REST API and Socket.IO real-time server. Handles authentication, messaging, user search, presence tracking, and all database interaction through Prisma.

---

## Stack

| Tool | Version | Role |
|------|---------|------|
| Express.js | 5 | HTTP server + REST API |
| Socket.IO | 4 | WebSocket layer |
| TypeScript | 6 | Type safety |
| Prisma | 7 | Database ORM |
| PostgreSQL | 14+ | Primary database |
| Zod | 4 | Request validation + env validation |
| bcrypt | 6 | Password hashing |
| jsonwebtoken | 9 | JWT signing and verification |
| Helmet | 8 | HTTP security headers |
| express-rate-limit | 8 | Brute-force protection |
| Morgan | 1 | HTTP request logging |
| cookie-parser | 1 | Cookie parsing middleware |
| cors | 2 | CORS headers |
| pg | 8 | PostgreSQL driver |

---

## Setup

### Environment variables

Copy `.env.example` to `.env`:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/relay

# The URL of your frontend (used for CORS)
FRONTEND_ORIGIN=http://localhost:3000

# JWT signing secret — must be at least 32 characters
JWT_SECRET=<generate-a-long-random-string>

# How long JWT tokens live
JWT_EXPIRES_IN=1d

# bcrypt work factor — higher is slower and more secure (range: 10–14)
BCRYPT_COST=12
```

All variables are validated with Zod at startup. The server will print clear error messages and exit if any are missing or invalid.

### Install and run

```bash
npm install           # also runs prisma generate via postinstall hook
npx prisma migrate dev   # run database migrations
npx prisma db seed    # (optional) seed with test data
npm run dev           # development with hot reload on http://localhost:4000
npm run build         # compile TypeScript
npm run start         # serve compiled output
npm run typecheck     # type check without emitting
```

---

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma             database schema
│   ├── seed.ts                   seed script
│   └── migrations/               migration history
│
└── src/
    ├── app.ts                    Express app — middleware stack, route registration
    ├── server.ts                 HTTP server, socket attachment, graceful shutdown
    │
    ├── config/
    │   ├── env.ts                Zod-validated environment variables
    │   └── prisma.ts             Prisma client singleton
    │
    ├── controllers/              HTTP request handlers (thin — delegate to services)
    │   ├── auth.controller.ts
    │   ├── conversation.controller.ts
    │   └── user.controller.ts
    │
    ├── services/                 Business logic + database queries
    │   ├── auth.service.ts       register, login, JWT signing
    │   ├── conversation.service.ts  create/list conversations, messages, read tracking
    │   ├── authorization.service.ts assertConversationParticipant()
    │   ├── audit.service.ts      write audit log entries
    │   └── user.service.ts       user search
    │
    ├── middleware/
    │   ├── authenticate.ts       JWT cookie verification → req.user
    │   ├── validate.ts           Zod schema middleware (body/query/params)
    │   ├── rate-limiters.ts      auth rate limiter (20 req / 15 min)
    │   └── error-handler.ts      ApiError handler + fallback 500
    │
    ├── routes/
    │   ├── auth.routes.ts        POST /register, POST /login, POST /logout, GET /me
    │   ├── conversation.routes.ts GET /, POST /, GET /:id/messages, POST /:id/messages
    │   ├── user.routes.ts        GET /search
    │   └── health.routes.ts      GET /health
    │
    ├── schemas/                  Zod schemas for request validation
    │   ├── auth.schemas.ts
    │   ├── conversation.schemas.ts
    │   └── user.schemas.ts
    │
    ├── socket/
    │   ├── socket-server.ts      creates the Socket.IO Server, attaches middleware
    │   ├── socket-auth.ts        authenticateSocket middleware (JWT from cookie)
    │   ├── register-socket-handlers.ts  all event handlers (connect, messages, typing, presence)
    │   ├── socket-events.ts      event name constants
    │   ├── presence-store.ts     in-memory Map<userId, Set<socketId>>
    │   └── rooms.ts              room name helpers
    │
    ├── errors/
    │   └── api-error.ts          ApiError class
    │
    └── utils/
        ├── auth-cookie.ts        setAuthCookie / clearAuthCookie helpers
        ├── async-handler.ts      wraps async controllers for Express error forwarding
        └── request-info.ts       extracts IP and user-agent from request
```

---

## API Endpoints

All endpoints are under `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create a new account |
| POST | `/login` | No | Login, sets `rtc_auth` cookie |
| POST | `/logout` | No | Clears `rtc_auth` cookie |
| GET | `/me` | Yes | Returns current user |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search?q=<query>` | Yes | Search users by username |

### Conversations — `/api/conversations`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List all conversations for current user |
| POST | `/` | Yes | Create or retrieve conversation with a user |
| GET | `/:id/messages` | Yes | Paginated message history |
| POST | `/:id/messages` | Yes | Send a message via HTTP (fallback) |

---

## Socket.IO Events

The socket server shares the same HTTP server as Express (same port, no separate WebSocket port).

### Authentication

The socket handshake must include the `rtc_auth` cookie. The `authenticateSocket` middleware parses it, verifies the JWT, and loads the user. Connections without a valid token are rejected.

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:join` | `{ conversationId }` | Join a conversation room |
| `message:send` | `{ conversationId, content, clientMessageId }` | Send a message |
| `message:read` | `{ conversationId }` | Mark unread messages as read |
| `typing:start` | `{ conversationId }` | User started typing |
| `typing:stop` | `{ conversationId }` | User stopped typing |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ message, clientMessageId? }` | New message arrived |
| `message:delivered` | `{ messageId, deliveredAt }` | Message persisted to DB |
| `message:read` | `{ conversationId, userId, messageIds, readAt }` | Messages marked as read |
| `typing:start` | `{ conversationId, userId, username }` | Someone is typing |
| `typing:stop` | `{ conversationId, userId }` | Someone stopped typing |
| `presence:online` | `{ userId }` | User connected |
| `presence:offline` | `{ userId, lastSeenAt }` | User disconnected |
| `socket:error` | `{ message }` | Handler-level error |

---

## Database Schema

```
User ──< ConversationParticipant >── Conversation ──< Message ──< MessageRead
                                                                        │
User ──────────────────────────────────────────────────────────────────┘
User ──< AuditLog
```

Key design decisions:
- **`pairKey`** on `Conversation`: sorted `[userId, userId].join(":")` — enforces one conversation per pair at the DB level
- **`isOnline`** on `User`: stored in DB so the initial page render (Server Component) shows correct presence without waiting for a socket
- **`MessageRead`**: separate join table, `UNIQUE(messageId, userId)` prevents duplicate reads
- Cursor-based pagination on messages (stable under concurrent inserts)

---

## Request Lifecycle

```
HTTP Request
  → Helmet (security headers)
  → CORS (origin check)
  → cookie-parser
  → body-parser (32 kb limit)
  → Morgan (dev logging)
  → Route match
  → [authRateLimiter]    (auth endpoints only)
  → [validate(schema)]   (where applicable)
  → [authenticate]       (protected routes)
  → controller()
  → service()
  → Prisma → PostgreSQL
  → JSON response
```

Thrown `ApiError` instances are caught by the global error handler and returned as structured JSON with the correct HTTP status code.
