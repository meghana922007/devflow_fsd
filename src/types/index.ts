export type TaskStage = 'todo' | 'in_progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueSeverity = 'minor' | 'major' | 'critical' | 'blocker';

export type IssueStatus = 'open' | 'triaged' | 'in_fix' | 'resolved' | 'closed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: string;
  githubUsername?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  color: string; // Pastel accent hex code
  gitRepo?: string; // GitHub repository URL
  teamMembers: User[]; // Assigned project team members
  createdAt?: string;
  taskCount?: number;
  issueCount?: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stage: TaskStage;
  priority: Priority;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  dueDate: string;
  tags: string[];
  githubBranch?: string;
  githubPR?: string;
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  reproductionSteps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  severity: IssueSeverity;
  status: IssueStatus;
  environment: string;
  reporterName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  linkedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'task_moved' | 'task_created' | 'issue_reported' | 'issue_resolved' | 'pr_linked' | 'project_created' | 'github_push' | 'pr_merged' | 'pr_opened';
  title: string;
  timestamp: string;
  user: string;
  avatar: string;
  details?: string;
}

export type PullRequestStatus = 'open' | 'merged' | 'closed' | 'draft';
export type ReviewStatus = 'approved' | 'changes_requested' | 'review_required' | 'pending';
export type CIStatus = 'success' | 'failure' | 'pending';

export interface DiffFile {
  filename: string;
  status: 'modified' | 'added' | 'deleted';
  additions: number;
  deletions: number;
  patch: string;
}

export interface PullRequest {
  id: string;
  projectId: string;
  number: number;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  githubUsername: string;
  sourceBranch: string;
  targetBranch: string;
  status: PullRequestStatus;
  reviewStatus: ReviewStatus;
  ciStatus: CIStatus;
  additions: number;
  deletions: number;
  changedFilesCount: number;
  linkedTaskId?: string;
  linkedIssueId?: string;
  mergeable: boolean;
  diffFiles: DiffFile[];
  createdAt: string;
  updatedAt: string;
  htmlUrl?: string;
  isLive?: boolean;
}

export interface Commit {
  id: string;
  projectId: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  githubUsername: string;
  branch: string;
  timestamp: string;
  additions: number;
  deletions: number;
  linkedTaskId?: string;
  htmlUrl?: string;
  isLive?: boolean;
}

export interface Branch {
  name: string;
  projectId: string;
  isDefault: boolean;
  lastCommitSha: string;
  lastCommitMessage: string;
  updatedAt: string;
  ahead: number;
  behind: number;
}

export interface WebhookEvent {
  id: string;
  projectId: string;
  event: 'push' | 'pull_request' | 'issues' | 'workflow_run';
  action: string;
  sender: string;
  senderAvatar: string;
  timestamp: string;
  summary: string;
  payload: Record<string, unknown>;
  status: 'delivered' | 'processed' | 'failed';
}

export interface RepoSettings {
  connected: boolean;
  repoUrl: string;
  defaultBranch: string;
  webhookUrl: string;
  webhookSecret: string;
  patConfigured: boolean;
  autoSync: boolean;
  lastSyncedAt?: string;
  owner?: string;
  repoName?: string;
  description?: string;
  starsCount?: number;
  forksCount?: number;
  openIssuesCount?: number;
  isLiveSync?: boolean;
  syncError?: string | null;
}

// Module 4: CI/CD Monitoring
export type WorkflowStatus = 'success' | 'failure' | 'in_progress' | 'queued' | 'cancelled';

export interface WorkflowStep {
  name: string;
  status: 'completed' | 'in_progress' | 'queued' | 'failed' | 'skipped';
  durationSeconds: number;
  logs: string[];
}

export interface WorkflowJob {
  id: string;
  name: string;
  runner: string;
  status: 'completed' | 'in_progress' | 'queued' | 'failed' | 'cancelled';
  duration: string;
  steps: WorkflowStep[];
}

export interface TestSuiteOutcome {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  coveragePercent?: number;
  failedTestDetails?: string[];
}

export interface WorkflowArtifact {
  name: string;
  size: string;
  downloadUrl?: string;
}

export interface WorkflowRun {
  id: string;
  runNumber: number;
  projectId: string;
  name: string;
  workflowFileName: string;
  status: WorkflowStatus;
  event: 'push' | 'pull_request' | 'workflow_dispatch' | 'schedule' | 'workflow_run';
  branch: string;
  commitSha: string;
  commitMessage: string;
  authorName: string;
  authorAvatar: string;
  githubUsername: string;
  duration: string;
  durationSeconds: number;
  startedAt: string;
  completedAt?: string;
  jobs: WorkflowJob[];
  testOutcome?: TestSuiteOutcome;
  artifacts?: WorkflowArtifact[];
  htmlUrl?: string;
  isLive?: boolean;
  pullRequestNumber?: number;
}
