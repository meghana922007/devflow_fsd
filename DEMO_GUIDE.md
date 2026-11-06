# DevFlowOne Demo Guide

## Start the app

1. Start Docker Desktop.
2. Open PowerShell in the repository folder:

   ```powershell
   cd C:\Users\sarna\OneDrive\Desktop\devflow_fsd
   docker compose up -d
   ```

   For the first run, or after code changes, use `docker compose up --build -d`.

3. Wait until the API is healthy:

   ```powershell
   curl.exe --fail http://localhost:13001/api/health
   ```

   A healthy response includes `"status":"ok"` and `"database":"connected"`.

4. Open **http://localhost:13001**. The browser has been left on the login screen.

To stop the app after the presentation, run `docker compose down` from the repository folder. This preserves the demo database. Do not add `-v` unless you want to delete that data.

## Demo account

Sign in with the team lead account:

- **Email:** `demo.owner@devflow.test`
- **Password:** `DevFlowDemo!2026`

Three teammate accounts are also available:

| Role | Email |
|---|---|
| Frontend engineer | `demo.frontend@devflow.test` |
| Backend engineer | `demo.backend@devflow.test` |
| QA engineer | `demo.qa@devflow.test` |

They use the same demo password. Use the team lead account for the main walkthrough.

## Suggested presentation flow (about 5 minutes)

1. **Login and project hub** — sign in, introduce the unified workspace, and open **DevFlow Demo Workspace**.
2. **Overview** — point out the project snapshot: task progress, open issues, CI sample pass rate, and recent activity.
3. **Board & Tasks** — show the sample tasks across statuses, priorities, and assignees. You can create a task to demonstrate persistence; it remains in the project after a refresh.
4. **Issue Tracker** — open the large-upload issue, show its severity and assignee, and optionally update its status.
5. **GitHub & Code** — show the sample PRs, commits, and branches. The page labels this as **demo data / not connected**. These entries are illustrative, not live GitHub activity.
6. **CI/CD Pipelines** — show the successful and failed sample runs and their logs. These are seeded demo history, not live GitHub Actions runs.
7. **AI Assistant** — choose a case from **Try a demo case**, then click **Analyze**. Examples include large uploads, expired tokens, database connection errors, CORS, flaky tests, and PR review. The result is explicitly labeled **Local demo analysis**.
8. **Team & Settings** — show the project’s four demo users and their roles.



```powershell
docker compose up --build -d api
```

Similarly, live GitHub repository data requires connecting a GitHub account with a personal access token through **GitHub & Code → Repository & Webhook Configuration**. Never put a PAT in source code or presentation materials.


## If something looks wrong

- Check `docker compose ps`; all three services should be running and healthy.
- Recheck `http://localhost:13001/api/health`.
- If the app is already signed in, open the user menu and choose **LOG OUT** to return to the login screen.
- If you changed environment settings, restart the API with `docker compose up --build -d api`.
