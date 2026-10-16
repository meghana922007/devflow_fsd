import type { Project, Task, Issue, User, ActivityItem, PullRequest, Commit, Branch, WebhookEvent, RepoSettings } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'aarav@devflow.io',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Architect',
    githubUsername: 'aarav_dev'
  },
  {
    id: 'u2',
    name: 'Meghana Pinikeshi',
    email: 'meghana@devflow.io',
    password: 'devflow123',
    avatar: 'https://avatars.githubusercontent.com/u/201999808?v=4',
    role: 'Lead Full Stack Architect',
    githubUsername: 'meghana922007'
  },
  {
    id: 'u3',
    name: 'Rohan Mehta',
    email: 'rohan@devflow.io',
    password: 'rohan123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Backend Specialist',
    githubUsername: 'rohan_m'
  },
  {
    id: 'u4',
    name: 'Ananya Patel',
    email: 'ananya@devflow.io',
    password: 'ananya123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'QA & DevOps Lead',
    githubUsername: 'ananya_qa'
  }
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'DevFlow Web Platform',
    key: 'DEV',
    description: 'Unified developer workspace combining Kanban, Issues, GitHub & CI/CD',
    color: '#2b6777',
    gitRepo: 'https://github.com/meghana922007/devflow',
    teamMembers: [mockUsers[0], mockUsers[1], mockUsers[2]],
    createdAt: '2026-10-01'
  },
  {
    id: 'p2',
    name: 'ThinkTank Intelligence',
    key: 'TTK',
    description: 'TypeScript multi-agent reasoning and idea generation engine',
    color: '#52ab98',
    gitRepo: 'https://github.com/meghana922007/ThinkTank',
    teamMembers: [mockUsers[1], mockUsers[3]],
    createdAt: '2026-04-06'
  },
  {
    id: 'p3',
    name: 'Agentic RBAC Platform',
    key: 'RBC',
    description: 'Role-based access control and policy enforcement engine',
    color: '#2b6777',
    gitRepo: 'https://github.com/meghana922007/Agentic-RBAC',
    teamMembers: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    createdAt: '2026-05-10'
  }
];

export const initialTasks: Task[] = [
  {
    id: 'TSK-101',
    projectId: 'p1',
    title: 'Implement Interactive Kanban Board Drag & Drop',
    description: 'Build responsive columns with soft pastel hover states and instant state synchronization.',
    stage: 'in_progress',
    priority: 'urgent',
    assigneeId: 'u2',
    assigneeName: 'Meghana',
    assigneeAvatar: mockUsers[1].avatar,
    dueDate: '2026-10-12',
    tags: ['Frontend', 'UI/UX', 'Module 1'],
    githubBranch: 'feature/kanban-pastel-ui',
    githubPR: '#42 - Add Kanban Board Stage Controller',
    subtasks: [
      { id: 'st1', title: 'Design 4 pastel column containers', completed: true },
      { id: 'st2', title: 'Add quick-move action controls', completed: true },
      { id: 'st3', title: 'Connect local state update handlers', completed: false },
      { id: 'st4', title: 'Implement search and priority filtering', completed: false }
    ],
    createdAt: '2026-10-08T09:00:00Z',
    updatedAt: '2026-10-09T08:30:00Z'
  },
  {
    id: 'TSK-102',
    projectId: 'p1',
    title: 'Build Issue Severity Filter and Status Transition Pipeline',
    description: 'Create Module 2 bug tracking dashboard with severity badges (Minor, Major, Critical, Blocker).',
    stage: 'review',
    priority: 'high',
    assigneeId: 'u1',
    assigneeName: 'Aarav Sharma',
    assigneeAvatar: mockUsers[0].avatar,
    dueDate: '2026-10-14',
    tags: ['Module 2', 'Defects', 'React'],
    githubBranch: 'feature/issue-severity-pipeline',
    githubPR: '#45 - Issue Status State Machine',
    subtasks: [
      { id: 'st20', title: 'Define IssueSeverity & IssueStatus types', completed: true },
      { id: 'st21', title: 'Build status promotion buttons', completed: true },
      { id: 'st22', title: 'Add linking between Issues and Tasks', completed: true }
    ],
    createdAt: '2026-10-07T14:20:00Z',
    updatedAt: '2026-10-09T07:10:00Z'
  },
  {
    id: 'TSK-103',
    projectId: 'p1',
    title: 'Design Pastel CSS Theme & Typography Tokens',
    description: 'Setup Google Fonts Plus Jakarta Sans with pastel lavender, rose, mint, sky, and peach badges.',
    stage: 'done',
    priority: 'medium',
    assigneeId: 'u2',
    assigneeName: 'Meghana',
    assigneeAvatar: mockUsers[1].avatar,
    dueDate: '2026-10-09',
    tags: ['CSS', 'Design System'],
    githubBranch: 'main',
    githubPR: '#38 - Pastel Color Palette Infrastructure',
    subtasks: [
      { id: 'st30', title: 'Create CSS variables for pastel badges', completed: true },
      { id: 'st31', title: 'Configure glassmorphic modal overlays', completed: true }
    ],
    createdAt: '2026-10-06T11:00:00Z',
    updatedAt: '2026-10-08T16:00:00Z'
  },
  {
    id: 'TSK-104',
    projectId: 'p1',
    title: 'GitHub Actions Webhook Endpoint Architecture',
    description: 'Prepare express router to receive GitHub webhook signatures and queue jobs via BullMQ.',
    stage: 'todo',
    priority: 'high',
    assigneeId: 'u3',
    assigneeName: 'Rohan Mehta',
    assigneeAvatar: mockUsers[2].avatar,
    dueDate: '2026-10-18',
    tags: ['Backend', 'Module 3', 'Webhooks'],
    githubBranch: 'feature/github-webhook-queue',
    subtasks: [
      { id: 'st40', title: 'Add HMAC signature validation helper', completed: false },
      { id: 'st41', title: 'Set up BullMQ worker listener', completed: false }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    updatedAt: '2026-10-09T08:00:00Z'
  },
  {
    id: 'TSK-105',
    projectId: 'p2',
    title: 'Configure Mobile Push Notification Handlers',
    description: 'Setup FCM push handlers for failed GitHub Actions CI build alerts.',
    stage: 'in_progress',
    priority: 'urgent',
    assigneeId: 'u4',
    assigneeName: 'Ananya Patel',
    assigneeAvatar: mockUsers[3].avatar,
    dueDate: '2026-10-20',
    tags: ['Mobile', 'Push', 'Notifications'],
    subtasks: [
      { id: 'st50', title: 'Register FCM device tokens', completed: true }
    ],
    createdAt: '2026-10-09T08:30:00Z',
    updatedAt: '2026-10-09T08:30:00Z'
  }
];

export const initialIssues: Issue[] = [
  {
    id: 'BUG-201',
    projectId: 'p1',
    title: 'Kanban card animation jitters during rapid stage transitions',
    description: 'When moving a task rapidly from To Do to In Progress, the card shadow flashes abruptly before stabilizing.',
    reproductionSteps: [
      'Navigate to Module 1 Kanban Board',
      'Click "Move to In Progress" on TSK-101 rapidly twice',
      'Observe card transform scale effect'
    ],
    expectedBehavior: 'Card transitions smoothly with subtle transform easing.',
    actualBehavior: 'Card shadow flickers for 50ms during DOM node re-render.',
    severity: 'minor',
    status: 'in_fix',
    environment: 'MacOS Sonoma / Chrome 129',
    reporterName: 'Ananya Patel',
    assigneeId: 'u2',
    assigneeName: 'Meghana',
    assigneeAvatar: mockUsers[1].avatar,
    linkedTaskId: 'TSK-101',
    createdAt: '2026-10-08T15:30:00Z',
    updatedAt: '2026-10-09T07:45:00Z'
  },
  {
    id: 'BUG-202',
    projectId: 'p1',
    title: 'Uncaught TypeError when creating bug report without linked task',
    description: 'Submitting a new bug form when linked task is left blank causes console error in modal callback.',
    reproductionSteps: [
      'Click "+ Report Bug" in header',
      'Fill in title, reproduction steps, and select severity = Major',
      'Leave "Linked Task" dropdown set to "None"',
      'Click "Create Bug Report"'
    ],
    expectedBehavior: 'Bug report saves cleanly with linkedTaskId = null.',
    actualBehavior: 'Form throws error attempting to access id property of undefined.',
    severity: 'critical',
    status: 'open',
    environment: 'All Browsers / Frontend React',
    reporterName: 'Aarav Sharma',
    assigneeId: 'u3',
    assigneeName: 'Rohan Mehta',
    assigneeAvatar: mockUsers[2].avatar,
    linkedTaskId: 'TSK-102',
    createdAt: '2026-10-09T06:15:00Z',
    updatedAt: '2026-10-09T06:15:00Z'
  },
  {
    id: 'BUG-203',
    projectId: 'p2',
    title: 'Push notification sound fails to trigger on silent mode',
    description: 'Critical build alerts must bypass silent switch on iOS devices.',
    reproductionSteps: [
      'Toggle iOS silent switch',
      'Trigger critical build alert'
    ],
    expectedBehavior: 'High-priority critical alert chime plays.',
    actualBehavior: 'Device stays completely silent.',
    severity: 'major',
    status: 'open',
    environment: 'iOS 18 / React Native',
    reporterName: 'Ananya Patel',
    assigneeId: 'u4',
    assigneeName: 'Ananya Patel',
    assigneeAvatar: mockUsers[3].avatar,
    createdAt: '2026-10-07T10:00:00Z',
    updatedAt: '2026-10-08T12:00:00Z'
  }
];

export const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'task_moved',
    title: 'moved task "Implement Interactive Kanban Board" to In Progress',
    timestamp: '10 mins ago',
    user: 'Meghana',
    avatar: mockUsers[1].avatar
  },
  {
    id: 'act-2',
    type: 'issue_reported',
    title: 'reported bug "Uncaught TypeError when creating bug report without linked task"',
    timestamp: '2 hours ago',
    user: 'Aarav Sharma',
    avatar: mockUsers[0].avatar,
    details: 'Severity: Critical'
  },
  {
    id: 'act-3',
    type: 'task_created',
    title: 'created new task "GitHub Actions Webhook Endpoint Architecture"',
    timestamp: '3 hours ago',
    user: 'Rohan Mehta',
    avatar: mockUsers[2].avatar
  }
];

export const mockPullRequests: PullRequest[] = [
  {
    id: 'pr-42',
    projectId: 'p1',
    number: 42,
    title: 'feat(kanban): Add 3D perspective physics & HTML5 drop zones',
    description: 'Implements Module 1 interactive drag-and-drop mechanics, mouse perspective tilt, subtask checklist updates, and responsive 4-column grid layout.',
    authorId: 'u2',
    authorName: 'Meghana',
    authorAvatar: mockUsers[1].avatar,
    githubUsername: 'meghana_codes',
    sourceBranch: 'feature/kanban-grid-physics',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'approved',
    ciStatus: 'success',
    additions: 184,
    deletions: 26,
    changedFilesCount: 4,
    linkedTaskId: 'TSK-101',
    mergeable: true,
    createdAt: '2026-10-08T09:30:00Z',
    updatedAt: '2026-10-09T11:15:00Z',
    diffFiles: [
      {
        filename: 'src/components/TaskManagement/KanbanBoard.tsx',
        status: 'modified',
        additions: 92,
        deletions: 18,
        patch: `@@ -76,12 +76,18 @@ export const KanbanBoard: React.FC = () => {
-  const [columns, setColumns] = useState([]);
+  const columns = [
+    { key: 'todo', title: 'To Do', bg: '#f2f2f2', border: '#c8d8e4' },
+    { key: 'in_progress', title: 'In Progress', bg: '#eef6f8', border: '#c8d8e4' },
+    { key: 'review', title: 'In Review', bg: '#f2f2f2', border: '#c8d8e4' },
+    { key: 'done', title: 'Done', bg: '#e6f6f3', border: '#52ab98' }
+  ];
+  const handleDrop = (e: React.DragEvent, stage: TaskStage) => {
+    const taskId = e.dataTransfer.getData('text/plain');
+    moveTaskStage(taskId, stage);
+  };`
      },
      {
        filename: 'src/components/TaskManagement/TaskCard.tsx',
        status: 'modified',
        additions: 64,
        deletions: 8,
        patch: `@@ -52,6 +52,14 @@ export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
+  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
+    const rect = e.currentTarget.getBoundingClientRect();
+    const rotateX = ((e.clientY - rect.top - rect.height/2) / (rect.height/2)) * -6;
+    const rotateY = ((e.clientX - rect.left - rect.width/2) / (rect.width/2)) * 6;
+    setTiltStyle({ transform: \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) translateZ(8px)\` });
+  };`
      }
    ]
  },
  {
    id: 'pr-43',
    projectId: 'p1',
    number: 43,
    title: 'fix(issues): Resolve linked task undefined reference in bug modal',
    description: 'Fixes bug ISS-201 where submitting a defect report without an optional linked task caused a TypeError in the pipeline.',
    authorId: 'u1',
    authorName: 'Aarav Sharma',
    authorAvatar: mockUsers[0].avatar,
    githubUsername: 'aarav_dev',
    sourceBranch: 'fix/issue-task-linking',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'review_required',
    ciStatus: 'success',
    additions: 42,
    deletions: 11,
    changedFilesCount: 2,
    linkedIssueId: 'ISS-201',
    linkedTaskId: 'TSK-102',
    mergeable: true,
    createdAt: '2026-10-08T14:20:00Z',
    updatedAt: '2026-10-09T08:45:00Z',
    diffFiles: [
      {
        filename: 'src/components/IssueTracking/IssueModal.tsx',
        status: 'modified',
        additions: 38,
        deletions: 9,
        patch: `@@ -128,7 +128,9 @@ export const IssueModal: React.FC = () => {
-    const task = tasks.find(t => t.id === linkedTaskId);
+    const linkedTaskSafe = linkedTaskId ? tasks.find(t => t.id === linkedTaskId) : undefined;
+    addIssue({ ...formData, linkedTaskId: linkedTaskSafe?.id });`
      }
    ]
  },
  {
    id: 'pr-44',
    projectId: 'p1',
    number: 44,
    title: 'feat(webhook): Ingest GitHub push and pull_request webhook payloads',
    description: 'Adds webhook receiver architecture with HMAC signature validation and automated activity stream broadcasting.',
    authorId: 'u3',
    authorName: 'Rohan Mehta',
    authorAvatar: mockUsers[2].avatar,
    githubUsername: 'rohan_m',
    sourceBranch: 'feature/webhook-ingestion',
    targetBranch: 'main',
    status: 'draft',
    reviewStatus: 'pending',
    ciStatus: 'pending',
    additions: 128,
    deletions: 14,
    changedFilesCount: 3,
    linkedTaskId: 'TSK-102',
    mergeable: true,
    createdAt: '2026-10-09T02:00:00Z',
    updatedAt: '2026-10-09T03:30:00Z',
    diffFiles: [
      {
        filename: 'src/services/webhookHandler.ts',
        status: 'added',
        additions: 110,
        deletions: 0,
        patch: `@@ -0,0 +1,24 @@
+export function verifyGithubSignature(secret: string, payload: string, signature: string) {
+  // HMAC-SHA256 verification
+  return true;
+}`
      }
    ]
  },
  {
    id: 'pr-41',
    projectId: 'p1',
    number: 41,
    title: 'chore(theme): Standardize UI tokens to strict 5-color professional palette',
    description: 'Removes all legacy linear gradients and non-compliant colors, standardizing to #2b6777, #c8d8e4, #ffffff, #f2f2f2, and #52ab98.',
    authorId: 'u2',
    authorName: 'Meghana',
    authorAvatar: mockUsers[1].avatar,
    githubUsername: 'meghana_codes',
    sourceBranch: 'chore/5-color-palette',
    targetBranch: 'main',
    status: 'merged',
    reviewStatus: 'approved',
    ciStatus: 'success',
    additions: 312,
    deletions: 198,
    changedFilesCount: 8,
    mergeable: false,
    createdAt: '2026-10-07T11:00:00Z',
    updatedAt: '2026-10-07T16:00:00Z',
    diffFiles: []
  },
  {
    id: 'pr-40',
    projectId: 'p1',
    number: 40,
    title: 'feat(auth): Add user switcher and dynamic authentication profile generator',
    description: 'Adds custom user credential login, dynamic profile creation on the fly, and account role switching dropdown.',
    authorId: 'u1',
    authorName: 'Aarav Sharma',
    authorAvatar: mockUsers[0].avatar,
    githubUsername: 'aarav_dev',
    sourceBranch: 'feature/auth-layer',
    targetBranch: 'main',
    status: 'merged',
    reviewStatus: 'approved',
    ciStatus: 'success',
    additions: 254,
    deletions: 34,
    changedFilesCount: 3,
    mergeable: false,
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T15:20:00Z',
    diffFiles: []
  }
];

export const mockCommits: Commit[] = [
  {
    id: '7e76ab2',
    projectId: 'p1',
    message: 'docs: add squid-7 as a project contributor',
    authorName: 'Meghana Pinikeshi',
    authorEmail: 'meghanareddypinikeshi@gmail.com',
    authorAvatar: 'https://avatars.githubusercontent.com/u/201999808?v=4',
    githubUsername: 'meghana922007',
    branch: 'main',
    timestamp: 'Oct 3, 2026',
    additions: 29,
    deletions: 7,
    htmlUrl: 'https://github.com/meghana922007/devflow/commit/7e76ab206b33ca9d5c13d497a7912f97482d82e2',
    isLive: true
  },
  {
    id: '902fe86',
    projectId: 'p1',
    message: 'feat: DevFlow Module 1 - Core Workspace, Auth, Kanban Board, Socket.IO Realtime Sync, and Analytics',
    authorName: 'Meghana Pinikeshi',
    authorEmail: 'meghanareddypinikeshi@gmail.com',
    authorAvatar: 'https://avatars.githubusercontent.com/u/201999808?v=4',
    githubUsername: 'meghana922007',
    branch: 'main',
    timestamp: 'Oct 3, 2026',
    additions: 450,
    deletions: 0,
    htmlUrl: 'https://github.com/meghana922007/devflow/commit/902fe86177c2cdf20bf641cade8182aa5516b15c',
    isLive: true
  },
  {
    id: 'a7f93e1',
    projectId: 'p1',
    message: 'feat(kanban): connect drag and drop handler to AppContext moveTaskStage',
    authorName: 'Meghana Pinikeshi',
    authorEmail: 'meghanareddypinikeshi@gmail.com',
    authorAvatar: 'https://avatars.githubusercontent.com/u/201999808?v=4',
    githubUsername: 'meghana922007',
    branch: 'feature/kanban-grid-physics',
    timestamp: '25 mins ago',
    additions: 48,
    deletions: 6,
    linkedTaskId: 'TSK-101'
  },
  {
    id: 'c4b12d8',
    projectId: 'p1',
    message: 'style: apply 4-column equal-width CSS Grid to KanbanBoard container',
    authorName: 'Meghana',
    authorEmail: 'meghana@devflow.io',
    authorAvatar: mockUsers[1].avatar,
    githubUsername: 'meghana_codes',
    branch: 'feature/kanban-grid-physics',
    timestamp: '1 hour ago',
    additions: 24,
    deletions: 12,
    linkedTaskId: 'TSK-101'
  },
  {
    id: 'f820ae3',
    projectId: 'p1',
    message: 'fix(issues): prevent unhandled exception when linkedTaskId is empty string',
    authorName: 'Aarav Sharma',
    authorEmail: 'aarav@devflow.io',
    authorAvatar: mockUsers[0].avatar,
    githubUsername: 'aarav_dev',
    branch: 'fix/issue-task-linking',
    timestamp: '3 hours ago',
    additions: 16,
    deletions: 4
  },
  {
    id: 'd198bb4',
    projectId: 'p1',
    message: 'feat(webhook): define webhook event schema for push and workflow_run',
    authorName: 'Rohan Mehta',
    authorEmail: 'rohan@devflow.io',
    authorAvatar: mockUsers[2].avatar,
    githubUsername: 'rohan_m',
    branch: 'feature/webhook-ingestion',
    timestamp: '5 hours ago',
    additions: 86,
    deletions: 2,
    linkedTaskId: 'TSK-102'
  },
  {
    id: 'e571ca2',
    projectId: 'p1',
    message: 'chore(design): update all buttons and badges to #2b6777 and #52ab98',
    authorName: 'Meghana',
    authorEmail: 'meghana@devflow.io',
    authorAvatar: mockUsers[1].avatar,
    githubUsername: 'meghana_codes',
    branch: 'main',
    timestamp: '1 day ago',
    additions: 142,
    deletions: 89
  },
  {
    id: 'b33e910',
    projectId: 'p1',
    message: 'feat(team): add engineer CRUD modal with GitHub username validation',
    authorName: 'Ananya Patel',
    authorEmail: 'ananya@devflow.io',
    authorAvatar: mockUsers[3].avatar,
    githubUsername: 'ananya_qa',
    branch: 'main',
    timestamp: '2 days ago',
    additions: 180,
    deletions: 22
  }
];

export const mockBranches: Branch[] = [
  {
    name: 'main',
    projectId: 'p1',
    isDefault: true,
    lastCommitSha: 'e571ca2',
    lastCommitMessage: 'chore(design): update all buttons and badges to #2b6777 and #52ab98',
    updatedAt: '1 day ago',
    ahead: 0,
    behind: 0
  },
  {
    name: 'feature/kanban-grid-physics',
    projectId: 'p1',
    isDefault: false,
    lastCommitSha: 'a7f93e1',
    lastCommitMessage: 'feat(kanban): connect drag and drop handler to AppContext moveTaskStage',
    updatedAt: '25 mins ago',
    ahead: 3,
    behind: 0
  },
  {
    name: 'fix/issue-task-linking',
    projectId: 'p1',
    isDefault: false,
    lastCommitSha: 'f820ae3',
    lastCommitMessage: 'fix(issues): prevent unhandled exception when linkedTaskId is empty string',
    updatedAt: '3 hours ago',
    ahead: 1,
    behind: 1
  },
  {
    name: 'feature/webhook-ingestion',
    projectId: 'p1',
    isDefault: false,
    lastCommitSha: 'd198bb4',
    lastCommitMessage: 'feat(webhook): define webhook event schema for push and workflow_run',
    updatedAt: '5 hours ago',
    ahead: 2,
    behind: 2
  },
  {
    name: 'staging',
    projectId: 'p1',
    isDefault: false,
    lastCommitSha: 'b33e910',
    lastCommitMessage: 'feat(team): add engineer CRUD modal with GitHub username validation',
    updatedAt: '2 days ago',
    ahead: 0,
    behind: 4
  }
];

export const mockWebhookEvents: WebhookEvent[] = [
  {
    id: 'wh-001',
    projectId: 'p1',
    event: 'push',
    action: 'created',
    sender: 'meghana_codes',
    senderAvatar: mockUsers[1].avatar,
    timestamp: '25 mins ago',
    summary: 'Pushed 2 commits to feature/kanban-grid-physics (a7f93e1)',
    status: 'delivered',
    payload: {
      ref: 'refs/heads/feature/kanban-grid-physics',
      before: 'c4b12d8',
      after: 'a7f93e1',
      commits_count: 2,
      repository: 'devflow-io/devflow-web',
      pusher: { name: 'meghana_codes' }
    }
  },
  {
    id: 'wh-002',
    projectId: 'p1',
    event: 'pull_request',
    action: 'opened',
    sender: 'meghana_codes',
    senderAvatar: mockUsers[1].avatar,
    timestamp: '1 hour ago',
    summary: 'PR #42 opened: "feat(kanban): Add 3D perspective physics & HTML5 drop zones"',
    status: 'delivered',
    payload: {
      action: 'opened',
      number: 42,
      pull_request: {
        title: 'feat(kanban): Add 3D perspective physics & HTML5 drop zones',
        head: 'feature/kanban-grid-physics',
        base: 'main'
      }
    }
  },
  {
    id: 'wh-003',
    projectId: 'p1',
    event: 'pull_request',
    action: 'synchronize',
    sender: 'aarav_dev',
    senderAvatar: mockUsers[0].avatar,
    timestamp: '3 hours ago',
    summary: 'PR #43 updated with 1 commit (f820ae3)',
    status: 'delivered',
    payload: {
      action: 'synchronize',
      number: 43,
      pull_request: {
        title: 'fix(issues): Resolve linked task undefined reference in bug modal'
      }
    }
  },
  {
    id: 'wh-004',
    projectId: 'p1',
    event: 'workflow_run',
    action: 'completed',
    sender: 'github-actions[bot]',
    senderAvatar: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=150&auto=format&fit=crop&q=80',
    timestamp: '4 hours ago',
    summary: 'GitHub Actions CI workflow "Build & Test" passed on PR #42 (100% tests green)',
    status: 'delivered',
    payload: {
      workflow: 'Build & Test',
      conclusion: 'success',
      duration_seconds: 48,
      branch: 'feature/kanban-grid-physics'
    }
  }
];

export const defaultRepoSettings: RepoSettings = {
  connected: true,
  repoUrl: 'https://github.com/meghana922007/devflow',
  defaultBranch: 'main',
  webhookUrl: 'https://api.devflow.io/v1/webhooks/github',
  webhookSecret: 'whsec_9a7d83f21e847c21b9',
  patConfigured: true,
  autoSync: true,
  lastSyncedAt: 'Live Synced',
  owner: 'meghana922007',
  repoName: 'devflow',
  description: 'DevFlow - Unified developer collaboration workspace',
  starsCount: 0,
  forksCount: 0,
  openIssuesCount: 0,
  isLiveSync: true
};
