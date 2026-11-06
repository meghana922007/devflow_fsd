# DevFlowOne Workspace

DevFlowOne is a unified developer workspace for project planning, task and issue tracking, GitHub activity, CI/CD visibility, and AI-assisted developer workflows. It uses a simple, responsive UI and persists core workspace data through an authenticated API.

## Stack

- React 19, TypeScript, Vite, and CSS
- Node.js, Express, Prisma, and PostgreSQL
- Redis, BullMQ, and Socket.IO
- GitHub API/webhooks and optional OpenAI API integration
- Docker Compose for local services and production-style serving

## Current capabilities

- Cookie-backed registration, login, logout, and session restoration
- Persistent projects, project membership, tasks, issues, and activity
- Project-level access checks and owner-only member management
- GitHub repository sync, encrypted integration secrets, signed webhook intake, and queued webhook processing
- GitHub Actions workflow monitoring and dispatch/cancel/rerun routes
- AI issue analysis, PR review summaries, and error explanations; local demo guidance works without provider credentials, with optional provider-backed responses via `OPENAI_API_KEY`
- Socket.IO workspace refresh notifications

Live GitHub OAuth/API actions and provider-backed AI responses require credentials in the server environment. Without an AI key, the assistant returns clearly labeled local demo guidance; without GitHub credentials, sample activity is labeled as demo data and live repository actions remain unavailable. Team members must have an existing DevFlow account before a project owner can add them by email.

For the preloaded presentation accounts, sample-data boundaries, and a login-first walkthrough, see [DEMO_GUIDE.md](./DEMO_GUIDE.md).

## Run locally with Docker

Prerequisites: Docker Desktop with Compose, Node.js 24 or newer, and npm.

1. Copy `.env.example` to `.env`. Set unique, random values for `JWT_SECRET` and `APP_ENCRYPTION_KEY` before exposing the app beyond local development. Optional provider credentials can be configured later.
2. Start the isolated app, PostgreSQL, and Redis services:

   ```powershell
   docker compose up --build -d
   ```

3. Check startup:

   ```powershell
   Invoke-WebRequest http://localhost:13001/api/health
   ```

4. Open <http://localhost:13001>.

Compose binds to localhost and uses ports `13001` (app), `15432` (PostgreSQL), and `16379` (Redis). Data is stored in the Compose-managed `devflowone_postgres` volume. Stop only this project with `docker compose down`; add `-v` only if you explicitly want to delete its database volume.

## Development

Install dependencies and configure `.env` to connect to the local Compose services. Run the API and Vite frontend in separate processes:

```powershell
npm install
npm run dev
```

Open <http://localhost:5173>. Prisma migrations are applied automatically on API startup in development; to apply migrations explicitly, use `npm run db:deploy`.

Useful commands:

```powershell
npm run build       # Prisma generation, type checks, and production frontend build
npm run lint        # Oxlint
npm test            # API integration tests (PostgreSQL and Redis required)
npm run test:e2e    # Playwright browser tests against http://localhost:13001
```

Set `PLAYWRIGHT_BASE_URL` to test a different running deployment. Install Chromium with `npx playwright install chromium` if it is not already available.

## Configuration

See [.env.example](./.env.example). Keep `.env` private and never commit real provider credentials. GitHub OAuth callback URL and public application/API URLs must match your deployment. For production, use strong unique secrets, HTTPS, secure cookies, managed database/cache services, and a deployment-specific CORS allowlist.

## Project layout

- `src/components/` — React workspace, projects, tasks, issues, GitHub, CI/CD, and team UI
- `src/context/AppContext.tsx` — authenticated client state and API actions
- `src/server/` — Express API, authentication, integrations, and Socket.IO/BullMQ runtime
- `prisma/` — PostgreSQL schema and migrations
- `tests/` — API integration tests
- `e2e/` — Playwright browser journeys
- `docker-compose.yml` and `Dockerfile` — local full-stack environment
