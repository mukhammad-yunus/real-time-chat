# Relay — Frontend

Next.js 16 application for Relay. Handles the user interface, routing, authentication guards, server-side data fetching, and the real-time Socket.IO client.

---

## Stack

| Tool | Version | Role |
|------|---------|------|
| Next.js | 16 | Framework (App Router) |
| React | 19 | UI rendering |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Socket.IO Client | 4 | WebSocket communication |
| @tanstack/react-virtual | 3 | Virtualized message list |
| lucide-react | latest | Icons |

---

## Setup

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
# URL of the backend (server-to-server, not exposed to browser)
BACKEND_URL=http://localhost:4000

# URL of the backend for Socket.IO (sent to the browser)
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

`BACKEND_URL` is only used on the server side (in Server Components and Server Actions). `NEXT_PUBLIC_SOCKET_URL` is bundled into the browser JavaScript, so it must be the URL the browser can reach.

### Install and run

```bash
npm install
npm run dev      # development server on http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

---

## Folder Structure

```
frontend/
├── app/
│   ├── layout.tsx                    root layout (fonts, global CSS)
│   ├── page.tsx                      marketing home page
│   ├── global.css                    Tailwind imports
│   ├── not-found.tsx
│   ├── global-error.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── (auth)/                       route group – login / register
│   │   ├── layout.tsx                redirects authenticated users to /chat
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                        route group – protected chat area
│   │   ├── layout.tsx                redirects unauthenticated users to /login
│   │   └── chat/
│   │       ├── page.tsx              /chat — conversation list
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       └── [conversationId]/
│   │           └── page.tsx          /chat/:id — active conversation
│   └── api/
│       └── backend/
│           └── [[...path]]/
│               └── route.ts          transparent HTTP proxy to backend
│
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── chat/
│   │   ├── chat-shell.tsx            root client component; socket lifecycle + state
│   │   ├── conversation-sidebar.tsx  left panel with conversation list
│   │   ├── message-panel.tsx         right panel with active conversation
│   │   ├── message-list.tsx          virtualized message renderer
│   │   ├── message-composer.tsx      text input + typing indicator
│   │   └── user-search.tsx           username search dropdown
│   └── ui/
│       └── field.tsx                 reusable labeled input
│
├── lib/
│   ├── actions/
│   │   ├── auth.ts                   Server Action: logout
│   │   └── conversations.ts          Server Action: create conversation
│   ├── server/
│   │   ├── backend.ts                server-only fetch helper (forwards cookies)
│   │   ├── session.ts                getCurrentUser() — cached per request
│   │   └── chat.ts                   server-only data fetching (conversations, messages)
│   ├── api-error.ts                  ApiError class + unwrap() helper
│   ├── chat-state.ts                 chatReducer, state types, optimistic update logic
│   ├── presence.ts                   isUserOnline(), usePresenceClock()
│   └── socket.ts                     createChatSocket() factory
│
└── types/
    ├── api.ts                        API response types (shared with backend shape)
    └── socket.ts                     Socket.IO event type interfaces
```

---

## How Routing Works

The App Router uses **route groups** — directories in parentheses that group pages under a shared layout without affecting the URL.

- `(auth)` wraps login and register. Its layout redirects already-authenticated users.
- `(app)` wraps the chat. Its layout is a Server Component that calls `getCurrentUser()`. If the user is not logged in, it calls `redirect("/login")` before any HTML is sent to the browser.

Dynamic segment `[conversationId]` handles individual conversations at `/chat/<id>`.

---

## Server vs. Client Components

| Component | Type | Reason |
|-----------|------|--------|
| `(app)/layout.tsx` | Server | Reads session from backend, redirects if unauthenticated |
| `chat/page.tsx` | Server | Fetches conversations and current user before rendering |
| `chat/[id]/page.tsx` | Server | Fetches message history before rendering |
| `ChatShell` | Client | Manages socket, state, event handlers |
| `ConversationSidebar` | Client | Real-time sidebar updates, presence clock |
| `MessagePanel` | Client | Load-older pagination, send message |
| `MessageList` | Client | Virtualized list (needs browser APIs) |
| `MessageComposer` | Client | Typing indicators, form state |
| `UserSearch` | Client | Search input + Server Action call |

---

## The Backend Proxy

`app/api/backend/[[...path]]/route.ts` catches all requests matching `/api/backend/**` and forwards them verbatim to the Express backend. This includes cookies, headers, and the request body. The response (including `Set-Cookie`) is forwarded back to the browser.

This means:
- The browser always talks to the same origin (no CORS issues for REST)
- Auth cookies are forwarded automatically
- The backend URL never needs to be exposed to browser JavaScript

---

## Chat State

All chat state lives in a single `useReducer` in `ChatShell`. The reducer handles:

| Action | Effect |
|--------|--------|
| `messageQueued` | Adds a pending message (optimistic UI) |
| `messageReceived` | Replaces pending message with confirmed server version |
| `messageFailed` | Marks a pending message as failed |
| `delivered` | Stamps `deliveredAt` on a message |
| `read` | Adds read receipts; decrements sidebar unread count |
| `presence` | Updates `isOnline`/`lastSeenAt` in the conversation list |
| `typing` | Sets or clears the typing indicator for a conversation |
| `conversationAdded` | Inserts a new conversation at the top of the sidebar |
| `olderLoaded` | Prepends older messages (pagination) |

---

## Responsive Design

The layout uses a CSS Grid with two columns on desktop (`md:grid-cols-[22rem_1fr]`). On mobile, only one panel is visible at a time:

- No active conversation → sidebar visible, message panel hidden
- Active conversation → message panel visible, sidebar hidden (back arrow navigates)

This is done entirely with Tailwind classes — no JavaScript breakpoint detection.
