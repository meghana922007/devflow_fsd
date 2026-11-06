# DevFlowOne implementation status

DevFlowOne is a React/TypeScript workspace backed by an Express API, PostgreSQL/Prisma, Redis/BullMQ, and Socket.IO. The UI has been simplified and core user/project/task/issue flows persist to the server.

## Implemented

- **Authentication:** registration, login, logout, session restoration, password hashing, and HTTP-only signed cookies.
- **Projects and teams:** project creation and persistence; existing registered accounts can be added to a project by its owner and removed with membership authorization.
- **Tasks and issues:** create, read, update, and delete APIs; assignment to registered project members; task stages, priorities, issue severity/status, and linked work.
- **GitHub backend:** repository sync and actions through configured credentials, encrypted stored tokens/secrets, signed webhook verification, event persistence, and BullMQ processing.
- **CI/CD:** persisted GitHub Actions workflow runs, status refresh, and supported dispatch/cancel/rerun operations.
- **AI assistance:** server-side PR summary, issue analysis, and error explanation endpoints using a configured OpenAI-compatible provider.
- **Real-time updates:** authenticated Socket.IO connections and project update notifications.
- **Deployment and tests:** Docker Compose services, Prisma migration, API integration tests, and Playwright browser journeys.

## Provider and deployment requirements

GitHub OAuth and API actions require GitHub credentials. AI actions require `OPENAI_API_KEY`. These integrations report a clear configuration error when credentials are missing. The application does not promise external service behavior without credentials. A user must register a DevFlow account before a project owner can add them to a team.

Local setup, environment variables, ports, and test commands are documented in [README.md](./README.md). Never commit `.env` or deployment secrets.

## Validation commands

```powershell
npm run build
npm run lint
npm test
npm run test:e2e
```

The API tests need PostgreSQL and Redis. Playwright needs a running app at `http://localhost:13001` (or `PLAYWRIGHT_BASE_URL`) and Chromium installed.
