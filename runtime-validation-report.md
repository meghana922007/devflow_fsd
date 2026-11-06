# Runtime Validation Report

**Generated**: 2026-11-06
**Target**: `C:\Users\sarna\OneDrive\Desktop\devflow_fsd`

## Summary

| Step | Status | Exit Code | Details |
|---|---|---:|---|
| Startup | PASS | 0 | `docker compose up --build -d`; API health check returned 200 with PostgreSQL connected. API, PostgreSQL, and Redis containers were healthy. |
| Build | PASS | 0 | `npm run build` generated Prisma Client, type-checked frontend and server, and built the Vite bundle. |
| Lint | PASS | 0 | `npm run lint` completed with existing React hook and Fast Refresh warnings. |
| Integration tests | PASS | 0 | `npm test`: 5 test files, 5 tests passed against PostgreSQL. |
| Browser E2E | PASS | 0 | `npm run test:e2e`: 3 Chromium journeys passed against the Docker app. |
| Manual demo smoke | PASS | n/a | Demo owner login, workspace/task/issue/pipeline data, six AI scenario presets, local AI analysis, and labeled GitHub demo feed were checked in the browser. |

**Overall**: PASS

## Environment and test strategy

- **Docker**: AVAILABLE — Docker Engine 29.4.3.
- **Node.js**: AVAILABLE — v24.14.1.
- **Playwright**: AVAILABLE — v1.65.0 with Chromium installed.
- **Infrastructure tier**: PRIMARY (Docker Compose with PostgreSQL 16 and Redis 7.4).
- **Browser tier**: PRIMARY (Playwright Chromium).
- **Critical journeys**: invalid login and registration/session restore; create and reload a project/task; report and reload an issue; connect GitHub with validated/encrypted token and list repositories.
- **Test isolation**: unique UUID-based account and project names; tests remove their created users on teardown.
- **Legacy E2E assets**: none found.

## Test evidence

- API integration tests: `tests/auth.integration.test.ts`, `tests/workspace.integration.test.ts`, `tests/github-webhook.integration.test.ts`, `tests/github-account.integration.test.ts`, `tests/ai.integration.test.ts`.
- Browser tests: `e2e/auth.spec.ts`, `e2e/tasks.spec.ts`, `e2e/issues.spec.ts`.
- Docker app: `http://localhost:13001/` and `/api/health` returned 200; health reported PostgreSQL connected.
- Demo workspace: four demo accounts, one shared project, four tasks, two issues, sample GitHub commits/pull requests, and two explicitly labeled sample pipeline runs.
- The AI screen is reachable from a persistent header button. With no `OPENAI_API_KEY`, the authenticated API returns local, deterministic demo guidance and labels it clearly; the real provider path remains available when a key is configured.
- The AI demo picker covers large uploads, token/auth failures, database connection-pool errors, CORS preflight errors, flaky tests, and pull-request review. Integration tests assert scenario-specific guidance, and the browser test exercises issue, database-error, and PR flows.
- The GitHub settings screen correctly shows that no account is connected and repositories cannot be listed until the user connects an account. Synthetic PR/commit examples in the demo workspace are labeled as demo activity and have no external GitHub links.

## Known limitations and issues

- GitHub OAuth/API integration needs deployment-specific credentials. No personal access token was provided, so actual account repositories could not be fetched in this run. The app uses the authenticated GitHub API and stores the token encrypted.
- A real AI provider response requires `OPENAI_API_KEY`; the local demo assistant works without it, but a remote model response was not tested because no key is configured.
- The seeded CI records are demo-only and are labeled as sample pipeline history; they are not claims of live GitHub Actions runs.
- `npm audit --omit=dev` previously reported three high-severity advisories in `deepmerge-ts` through Prisma tooling. The suggested automatic remediation requires a Prisma major upgrade; no breaking dependency change was applied.
- Lint completes successfully but reports existing React hook/Fast Refresh warnings.
