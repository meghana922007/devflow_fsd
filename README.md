# 🌸 DevFlow — Unified Developer Collaboration & Engineering Workflow Platform

> **DevFlow** is a developer-centric collaboration platform that unites project management, task tracking, bug reporting, team member engineering profiles, and GitHub repository links into a single, pastel-aesthetic workspace.

---

## 🎨 Visual Aesthetics & Design Philosophy

DevFlow is designed with a **Soft Pastel Aesthetic** to reduce cognitive fatigue and eliminate harsh neon blues.

### Color Palette Tokens
* **Soft Lavender**: `#E8E5F6` / `#7C65C1` (Module 1 Tasks & Primary Accents)
* **Dusty Rose**: `#FCE7F0` / `#E05A8D` (Module 2 Defects & Critical Badges)
* **Sage / Mint Green**: `#E2F5ED` / `#2E9367` (Resolved States & Task Completion)
* **Powder Sky Blue**: `#E0F2FE` / `#0284C7` (Team Profiles & Minor Priority)
* **Warm Soft Peach**: `#FFEDD5` / `#EA580C` (In Review / Major Priority)
* **Soft Coral**: `#FFE4E6` / `#E11D48` (Blocker & Critical Alerts)
* **Warm Off-White**: `#FAF9F6` (Base Background)

### Visual Features & 3D Physics
* **3D Perspective Mouse Tilt**: Task cards dynamically calculate cursor coordinates relative to card center and tilt in 3D space (`perspective(1000px) rotateX(...) rotateY(...) translateZ(12px)`).
* **HTML5 Drag-and-Drop**: Interactive column drop targets with glowing pastel borders and animated placeholder drop zones (`Drop Task Into [Column Name] ✨`).
* **Glassmorphism Overlays**: Semi-transparent modal backdrops with `backdrop-filter: blur(12px)` and subtle multi-layer drop shadows.
* **Typography**: Clean modern typography powered by Google Fonts `'Plus Jakarta Sans'` and `'Outfit'`.

---

## 🚀 Tech Stack

* **Frontend Framework**: React 19 + TypeScript
* **Build Tool**: Vite (Lightning-fast HMR and production bundle generation)
* **Styling**: Vanilla CSS with CSS Custom Properties (Design Tokens), 3D Transforms, and Glassmorphism
* **Iconography**: Lucide React (`lucide-react`)
* **State Management**: React Context API (`AppContext.tsx`) with central state synchronization across tasks, bugs, projects, team rosters, and activity feeds.

---

## 📦 Detailed Module Implementations

### 🏠 1. Home Projects Hub & Multi-Project Workspace
DevFlow is organized as a multi-project website platform:

* **Central Projects Hub (`ProjectsHub.tsx`)**:
  * Displays all active projects as aesthetic pastel cards.
  * Shows Project Key (`DEV`, `MOB`, `DSK`), GitHub Repository link badge (`github.com/org/repo`), assigned developer team avatars with GitHub handles (`@meghana_codes`, `@aarav_dev`), progress bar, task count, and open bug count.
  * **Open Project Workspace**: Clicking any project opens its isolated workspace.

* **Create New Project Modal (`NewProjectModal.tsx`)**:
  * Form fields for Project Name, Key, Description, GitHub Repo URL, Pastel Accent Color theme picker, and Team Member checkboxes.

---

### 📋 2. Module 1: Project & Task Management
Focuses on project task allocation, subtask checklists, and workflow state tracking.

* **Interactive Kanban Board (`KanbanBoard.tsx`)**:
  * 4 Columns: 📌 `To Do`, ⚡ `In Progress`, 👁️ `In Review`, 🎉 `Done`.
  * Real-time sprint progress bar (`X/Y Tasks (% Done)`).
  * Filter bar by Priority (`Urgent`, `High`, `Medium`, `Low`) and Assignee.
  * HTML5 Drag-and-Drop task movement between columns.

* **Task Cards (`TaskCard.tsx`)**:
  * Task ID badge (`TSK-101`) & Priority pastel badge.
  * Subtasks checklist progress bar (`2/4 Subtasks (50%)`) with interactive check-boxes.
  * Linked GitHub Branch / Pull Request tag (`#42 - Add Kanban controller`).
  * Assignee avatar with tooltip, due date indicator, and 3D hover physics.

* **Task Creation & Edit Modal (`TaskModal.tsx`)**:
  * Allows creating/editing tasks, setting priorities, selecting assignees, attaching GitHub PR links, and building dynamic subtask checklists.

---

### 🐛 3. Module 2: Issue & Bug Tracking
Focuses on defect lifecycle management, severity categorization, and resolution status pipelines.

* **Bug Tracking Dashboard (`IssueList.tsx`)**:
  * Top Telemetry Cards: Total Defects, Open/In-Fix Bugs, Critical/Blockers, and Resolved Defects.
  * Filter controls for Severity (`Blocker 🚨`, `Critical ⚠️`, `Major 📌`, `Minor 🌿`) and Status (`Open`, `Triaged`, `In Fix`, `Resolved ✅`, `Closed`).
  * Dual View Modes: **Cards Grid View** & **Table List View**.
  * **Linked Task Indicator**: Displays cross-linked Module 1 task badge (`Linked Task: TSK-101`).

* **Status Transition Pipeline**:
  * Quick status promotion selector on every bug card (`Open` → `Triaged` → `In Fix` → `Resolved` → `Closed`).

* **Bug Reporting Modal (`IssueModal.tsx`)**:
  * Captures Bug Title, Description, Reproduction Steps (bulleted list input), Expected vs Actual Behavior, Environment (`e.g. MacOS / Chrome 129`), Severity, Assigned Engineer, and **Link to Module 1 Task** dropdown.

---

### 👥 4. Team Member Management (`TeamSettings.tsx` & `UserModal.tsx`)
Allows managing engineering profiles and project assignments:

* **Add New Engineer**: Add team members with Name, Role, Email, GitHub Username (`@username`), and Avatar Preset.
* **Edit Profile**: Update developer details across all tasks, bugs, and project rosters instantly.
* **Assign / Unassign**: Assign global engineers to specific projects or remove them from project rosters.

---

## ⚡ How We Built It (Architecture & Data Flow)

```
                       [ React App Component Tree ]
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
               [ AppProvider Context ] ─── [ State Store ]
                         │                     │ (Projects, Tasks, Issues, Users)
                         ├──► Home Projects Hub
                         │     └── New Project Modal
                         │
                         └──► Project Workspace
                               ├── Telemetry Dashboard
                               ├── Module 1: Kanban Board (HTML5 Drag & Drop)
                               ├── Module 2: Bug Tracker (Severity Grid/Table)
                               └── Team & GitHub Repo Settings
```

### State Synchronization (`AppContext.tsx`)
When a task is dragged to `Done`, or a bug is marked `Resolved`:
1. `moveTaskStage(taskId, newStage)` or `updateIssueStatus(issueId, newStatus)` is dispatched.
2. The state array is updated immutably.
3. The **Progress Telemetry Bar**, **Column Badges**, **Header Counters**, and **Real-Time Activity Feed** re-render instantly with zero full-page refreshes.

---

## 🛠️ How to Run the Application

### Prerequisites
* Node.js v18+ and NPM

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Build Production Bundle
```bash
npm run build
```
Creates an optimized production build in the `dist/` directory verified with TypeScript type-checking.

---

## 📄 File Tree Summary

* `src/index.css`: Design system tokens, 3D tilt effects, drag animation classes.
* `src/types/index.ts`: TypeScript data structures (`Project`, `Task`, `Issue`, `User`, `SubTask`).
* `src/data/mockData.ts`: Seed mock database.
* `src/context/AppContext.tsx`: Global state manager.
* `src/components/Sidebar.tsx`: Pastel navigation bar with Projects Hub link.
* `src/components/Header.tsx`: Global search & creation action buttons.
* `src/components/DashboardOverview.tsx`: Combined Module 1 & 2 telemetry dashboard.
* `src/components/ProjectsHub/`: Projects Hub landing page & creation modal.
* `src/components/TaskManagement/`: Module 1 Kanban board, 3D task card, task modal.
* `src/components/IssueTracking/`: Module 2 defect grid/table, issue modal.
* `src/components/ProjectTeam/`: Team settings & user modal.
