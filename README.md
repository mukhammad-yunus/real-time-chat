# real-time-chat

A secure real-time private messaging application built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Express
- Socket.IO
- PostgreSQL
- Prisma
- JWT
- bcrypt

## Project Structure

```text
real-time-chat/
  backend/
  frontend/
```

The backend owns authentication, authorization, database access, and real-time socket events.

The frontend owns the user interface and communicates with the backend through HTTP and Socket.IO.