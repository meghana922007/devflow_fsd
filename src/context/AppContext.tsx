import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { Project, Task, Issue, TaskStage, IssueStatus, ActivityItem, User, PullRequest, Commit, Branch, WebhookEvent, RepoSettings, WorkflowRun } from '../types';
import { parseGitHubRepo } from '../services/githubService';
import type { GitHubRateLimitInfo, UserPublicRepo } from '../services/githubService';
import { ApiError, apiRequest, reportApiError } from '../services/api';
import { io } from 'socket.io-client';
import {
  initialTasks,
  initialIssues,
  mockActivities,
  mockUsers,
  mockPullRequests,
  mockCommits,
  mockBranches,
  mockWebhookEvents,
  defaultRepoSettings,
  mockWorkflowRuns
} from '../data/mockData';

interface AppContextType {
  // Authentication State
  isAuthenticated: boolean;
  currentUser: User | null;
  apiError: string | null;
  clearApiError: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGithub: () => void;
  signup: (userData: Omit<User, 'id'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  currentView: 'hub' | 'workspace';
  setCurrentView: (view: 'hub' | 'workspace') => void;
  
  activeProject: Project;
  projects: Project[];
  selectProject: (project: Project) => void;
  backToHub: () => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<boolean>;
  
  activeTab: 'dashboard' | 'kanban' | 'issues' | 'team' | 'github' | 'cicd' | 'ai';
  setActiveTab: (tab: 'dashboard' | 'kanban' | 'issues' | 'team' | 'github' | 'cicd' | 'ai') => void;
  
  // Team Member Management
  users: User[];
  addMemberToProject: (projectId: string, email: string) => Promise<boolean>;
  removeMemberFromProject: (projectId: string, userId: string) => Promise<boolean>;

  tasks: Task[];
  moveTaskStage: (taskId: string, newStage: TaskStage) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => void;
  toggleSubTask: (taskId: string, subtaskId: string) => void;
  
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateIssueStatus: (issueId: string, newStatus: IssueStatus) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<boolean>;
  deleteIssue: (issueId: string) => void;

  // Module 3: GitHub Integration
  pullRequests: PullRequest[];
  commits: Commit[];
  branches: Branch[];
  webhookEvents: WebhookEvent[];
  repoSettings: RepoSettings;
  createPullRequest: (prData: {
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
    linkedTaskId?: string;
    linkedIssueId?: string;
    isDraft?: boolean;
  }) => Promise<boolean>;
  mergePullRequest: (prId: string) => void;
  closePullRequest: (prId: string) => void;
  simulateWebhook: (eventType: 'push' | 'pull_request' | 'workflow_run') => void;
  syncRepoWithGitHub: (customUrl?: string, forceRefresh?: boolean) => Promise<boolean>;
  updateRepoSettings: (settings: Partial<RepoSettings>) => void;
  isSyncingGitHub: boolean;
  githubRateLimit: GitHubRateLimitInfo | null;
  userPublicRepos: UserPublicRepo[];
  githubAccount: { connected: boolean; username: string | null };
  refreshGitHubAccount: () => Promise<void>;
  saveGitHubToken: (token: string) => Promise<boolean>;
  removeGitHubToken: () => Promise<boolean>;
  fetchUserRepos: () => Promise<void>;
  switchGitRepo: (repoUrl: string) => Promise<boolean>;
  selectedPRForDiff: PullRequest | null;
  setSelectedPRForDiff: (pr: PullRequest | null) => void;
  isNewPRModalOpen: boolean;
  setIsNewPRModalOpen: (open: boolean) => void;
  isWebhookSimulatorOpen: boolean;
  setIsWebhookSimulatorOpen: (open: boolean) => void;
  isRepoSettingsModalOpen: boolean;
  setIsRepoSettingsModalOpen: (open: boolean) => void;

  // Module 4: CI/CD Monitoring
  workflowRuns: WorkflowRun[];
  selectedRunForLogs: WorkflowRun | null;
  setSelectedRunForLogs: (run: WorkflowRun | null) => void;
  isDispatchModalOpen: boolean;
  setIsDispatchModalOpen: (open: boolean) => void;
  dispatchWorkflow: (options: {
    workflowName: string;
    branch: string;
    runTests?: boolean;
    verbose?: boolean;
  }) => Promise<boolean>;
  cancelWorkflowRun: (runId: string) => void;
  rerunWorkflowRun: (runId: string) => void;
  isFetchingWorkflows: boolean;
  fetchWorkflowRuns: () => Promise<void>;

  activities: ActivityItem[];
  
  // Filtering states
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assigneeId: string) => void;
  severityFilter: string;
  setSeverityFilter: (severity: string) => void;
  issueStatusFilter: string;
  setIssueStatusFilter: (status: string) => void;

  // Modals
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  
  isIssueModalOpen: boolean;
  setIsIssueModalOpen: (open: boolean) => void;
  editingIssue: Issue | null;
  setEditingIssue: (issue: Issue | null) => void;

  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;

}

const AppContext = createContext<AppContextType | undefined>(undefined);
const emptyProject: Project = {
  id: '',
  name: '',
  key: '',
  description: '',
  color: '#2563eb',
  teamMembers: [],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project>(emptyProject);
  const [users, setUsers] = useState<User[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<'hub' | 'workspace'>('hub');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'issues' | 'team' | 'github' | 'cicd' | 'ai'>('dashboard');
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);

  // Module 3: GitHub Integration State
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(mockPullRequests);
  const [commits, setCommits] = useState<Commit[]>(mockCommits);
  const [branches] = useState<Branch[]>(mockBranches);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>(mockWebhookEvents);
  const [repoSettings, setRepoSettings] = useState<RepoSettings>(defaultRepoSettings);
  const [selectedPRForDiff, setSelectedPRForDiff] = useState<PullRequest | null>(null);
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);
  const [isWebhookSimulatorOpen, setIsWebhookSimulatorOpen] = useState(false);
  const [isRepoSettingsModalOpen, setIsRepoSettingsModalOpen] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [githubRateLimit] = useState<GitHubRateLimitInfo | null>(null);
  const [userPublicRepos, setUserPublicRepos] = useState<UserPublicRepo[]>([]);
  const [githubAccount, setGithubAccount] = useState<{ connected: boolean; username: string | null }>({
    connected: false,
    username: null,
  });

  // Module 4: CI/CD Monitoring State
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>(mockWorkflowRuns);
  const [selectedRunForLogs, setSelectedRunForLogs] = useState<WorkflowRun | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isFetchingWorkflows, setIsFetchingWorkflows] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [issueStatusFilter, setIssueStatusFilter] = useState<string>('all');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);


  const loadWorkspace = async () => {
    const workspace = await apiRequest<{
      projects: Project[];
      tasks: (Task & { assigneeId: string | null; dueDate: string | null })[];
      issues: (Issue & { assigneeId: string | null })[];
      activities: ActivityItem[];
      commits: (Commit & { sha: string; committedAt: string; authorName: string; authorEmail: string; htmlUrl?: string })[];
      pullRequests: (PullRequest & { authorName: string; htmlUrl?: string; status: string })[];
      webhookEvents: WebhookEvent[];
      workflowRuns: (WorkflowRun & { status: string; startedAt: string; completedAt?: string })[];
    }>('/workspace');
    setProjects(workspace.projects);
    setTasks(workspace.tasks.map(task => ({
      ...task,
      assigneeId: task.assigneeId ?? '',
      dueDate: task.dueDate ?? '',
      tags: Array.isArray(task.tags) ? task.tags : [],
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    })));
    setIssues(workspace.issues.map(issue => ({
      ...issue,
      assigneeId: issue.assigneeId ?? '',
      reproductionSteps: Array.isArray(issue.reproductionSteps) ? issue.reproductionSteps : [],
    })));
    setActivities(workspace.activities);
    setCommits(workspace.commits.map(commit => ({
      ...commit,
      id: commit.sha,
      timestamp: commit.committedAt,
      githubUsername: '',
      additions: 0,
      deletions: 0,
    })));
    setPullRequests(workspace.pullRequests.map(pr => ({
      ...pr,
      status: pr.status === 'merged' || pr.status === 'closed' || pr.status === 'draft' ? pr.status : 'open',
      reviewStatus: 'review_required',
      ciStatus: 'pending',
      additions: 0,
      deletions: 0,
      changedFilesCount: 0,
      mergeable: true,
      diffFiles: [],
      authorId: '',
      authorAvatar: '',
      githubUsername: '',
    })));
    setWebhookEvents(workspace.webhookEvents);
    setWorkflowRuns(workspace.workflowRuns.map(run => ({
      ...run,
      status: run.status === 'success' || run.status === 'failure' || run.status === 'cancelled' || run.status === 'queued'
        ? run.status
        : 'in_progress',
      workflowFileName: '',
      event: 'push',
      commitMessage: '',
      authorAvatar: '',
      githubUsername: '',
      duration: '',
      durationSeconds: 0,
      jobs: [],
    })));
    const members = workspace.projects.flatMap(project => project.teamMembers);
    setUsers([...new Map(members.map(member => [member.id, member])).values()]);
    setActiveProject(previous => workspace.projects.find(project => project.id === previous.id) ?? workspace.projects[0] ?? emptyProject);
  };

  useEffect(() => {
    let active = true;
    void apiRequest<{ user: User }>('/auth/me')
      .then(async ({ user }) => {
        if (!active) return;
        setCurrentUser(user);
        setIsAuthenticated(true);
        await loadWorkspace();
      })
      .catch(error => {
        if (!active) return;
        if (!(error instanceof ApiError && error.status === 401)) setApiError(reportApiError(error));
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = io({ withCredentials: true });
    const refresh = () => {
      void loadWorkspace().catch(error => setApiError(reportApiError(error)));
    };
    socket.on('workspace.updated', refresh);
    socket.on('github.webhook', refresh);
    socket.on('connect_error', error => setApiError(`Real-time connection failed: ${error.message}`));
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void apiRequest<{ connected: boolean; username: string | null }>('/github/status')
      .then(status => {
        if (active) setGithubAccount(status);
      })
      .catch(error => {
        if (active) setApiError(reportApiError(error));
      });
    return () => { active = false; };
  }, [isAuthenticated]);

  const login = async (email: string, password?: string) => {
    try {
      const { user } = await apiRequest<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentView('hub');
      setApiError(null);
      await loadWorkspace();
      return { success: true };
    } catch (error) {
      const message = reportApiError(error);
      setApiError(message);
      return { success: false, error: message };
    }
  };

  const loginWithGithub = () => {
    window.location.assign('/api/auth/github');
  };

  const signup = async (userData: Omit<User, 'id'> & { password?: string }) => {
    try {
      const { user } = await apiRequest<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          githubUsername: userData.githubUsername,
          avatar: userData.avatar,
        }),
      });
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentView('hub');
      setApiError(null);
      await loadWorkspace();
      return { success: true };
    } catch (error) {
      const message = reportApiError(error);
      setApiError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    void apiRequest('/auth/logout', { method: 'POST' }).catch(error => setApiError(reportApiError(error)));
    setIsAuthenticated(false);
    setCurrentUser(null);
    setProjects([]);
    setTasks([]);
    setIssues([]);
    setUsers([]);
    setCurrentView('hub');
    setActiveProject(emptyProject);
    setGithubAccount({ connected: false, username: null });
    setUserPublicRepos([]);
    setApiError(null);
  };

  // Project Navigation & Actions
  const selectProject = (project: Project) => {
    setActiveProject(project);
    setCurrentView('workspace');
    setActiveTab('dashboard');
  };

  const backToHub = () => {
    setCurrentView('hub');
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      const { project: newProj } = await apiRequest<{ project: Project }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectData.name,
          key: projectData.key,
          description: projectData.description,
          color: projectData.color,
          gitRepo: projectData.gitRepo,
          memberIds: projectData.teamMembers.map(member => member.id),
        }),
      });
      setApiError(null);
      setUsers(previous => [...new Map([...previous, ...newProj.teamMembers].map(member => [member.id, member])).values()]);
      setActiveProject(newProj);
      setCurrentView('workspace');
      setActiveTab('dashboard');
      await loadWorkspace();
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const addMemberToProject = async (projectId: string, email: string) => {
    try {
      await apiRequest(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setApiError(null);
      await loadWorkspace();
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const removeMemberFromProject = async (projectId: string, userId: string) => {
    try {
      await apiRequest(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
      setApiError(null);
      await loadWorkspace();
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  // Module 1 Handlers
  const moveTaskStage = (taskId: string, newStage: TaskStage) => {
    const task = tasks.find(item => item.id === taskId);
    if (task) void updateTask(taskId, { stage: newStage });
  };

  const addTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { task } = await apiRequest<{ task: Task & { assigneeId: string | null; dueDate: string | null } }>(
        `/projects/${newTaskData.projectId}/tasks`,
        {
          method: 'POST',
          body: JSON.stringify({ ...newTaskData, assigneeId: newTaskData.assigneeId || null, dueDate: newTaskData.dueDate || null }),
        },
      );
      setTasks(previous => [{
        ...task,
        assigneeId: task.assigneeId ?? '',
        dueDate: task.dueDate ?? '',
        tags: Array.isArray(task.tags) ? task.tags : [],
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      }, ...previous]);
      setApiError(null);
      await loadWorkspace();
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return false;
    try {
      const { task } = await apiRequest<{ task: Task & { assigneeId: string | null; dueDate: string | null } }>(
        `/projects/${currentTask.projectId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            ...updates,
            ...(updates.assigneeId !== undefined ? { assigneeId: updates.assigneeId || null } : {}),
            ...(updates.dueDate !== undefined ? { dueDate: updates.dueDate || null } : {}),
          }),
        },
      );
      setTasks(previous => previous.map(item => item.id === taskId ? {
        ...task,
        assigneeId: task.assigneeId ?? '',
        dueDate: task.dueDate ?? '',
        tags: Array.isArray(task.tags) ? task.tags : [],
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      } : item));
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return;
    try {
      await apiRequest(`/projects/${task.projectId}/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(previous => previous.filter(item => item.id !== taskId));
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  };

  const toggleSubTask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return;
    void updateTask(taskId, {
      subtasks: task.subtasks.map(subtask => subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask),
    });
  };

  // Module 2 Handlers
  const addIssue = async (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { issue } = await apiRequest<{ issue: Issue & { assigneeId: string | null } }>(
        `/projects/${newIssueData.projectId}/issues`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...newIssueData,
            assigneeId: newIssueData.assigneeId || null,
            linkedTaskId: newIssueData.linkedTaskId || null,
          }),
        },
      );
      setIssues(previous => [{
        ...issue,
        assigneeId: issue.assigneeId ?? '',
        reproductionSteps: Array.isArray(issue.reproductionSteps) ? issue.reproductionSteps : [],
      }, ...previous]);
      setApiError(null);
      await loadWorkspace();
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const updateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    void updateIssue(issueId, { status: newStatus });
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    const currentIssue = issues.find(issue => issue.id === issueId);
    if (!currentIssue) return false;
    try {
      const { issue } = await apiRequest<{ issue: Issue & { assigneeId: string | null } }>(
        `/projects/${currentIssue.projectId}/issues/${issueId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            ...updates,
            ...(updates.assigneeId !== undefined ? { assigneeId: updates.assigneeId || null } : {}),
            ...(updates.linkedTaskId !== undefined ? { linkedTaskId: updates.linkedTaskId || null } : {}),
          }),
        },
      );
      setIssues(previous => previous.map(item => item.id === issueId ? {
        ...issue,
        assigneeId: issue.assigneeId ?? '',
        reproductionSteps: Array.isArray(issue.reproductionSteps) ? issue.reproductionSteps : [],
      } : item));
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const deleteIssue = async (issueId: string) => {
    const issue = issues.find(item => item.id === issueId);
    if (!issue) return;
    try {
      await apiRequest(`/projects/${issue.projectId}/issues/${issueId}`, { method: 'DELETE' });
      setIssues(previous => previous.filter(item => item.id !== issueId));
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  };

  // Module 3: GitHub Integration Handlers
  const createPullRequest = async (prData: {
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
    linkedTaskId?: string;
    linkedIssueId?: string;
    isDraft?: boolean;
  }) => {
    try {
      const { pullRequest } = await apiRequest<{ pullRequest: {
        id: string; projectId: string; number: number; title: string; description: string;
        authorName: string; githubUsername: string; sourceBranch: string; targetBranch: string;
        status: string; createdAt: string; updatedAt: string; htmlUrl?: string;
      } }>(`/projects/${activeProject.id}/pull-requests`, {
        method: 'POST',
        body: JSON.stringify(prData),
      });
      setPullRequests(previous => [{
        ...pullRequest,
        status: pullRequest.status === 'merged' || pullRequest.status === 'closed' || pullRequest.status === 'draft' ? pullRequest.status : 'open',
        authorId: currentUser?.id ?? '',
        authorAvatar: currentUser?.avatar ?? '',
        reviewStatus: 'review_required',
        ciStatus: 'pending',
        additions: 0,
        deletions: 0,
        changedFilesCount: 0,
        linkedTaskId: prData.linkedTaskId,
        linkedIssueId: prData.linkedIssueId,
        mergeable: true,
        diffFiles: [],
      }, ...previous]);
      if (prData.linkedTaskId) {
        await updateTask(prData.linkedTaskId, { githubPR: `#${pullRequest.number} - ${pullRequest.title}` });
      }
      await loadWorkspace();
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };
  const mergePullRequest = async (prId: string) => {
    const pullRequest = pullRequests.find(item => item.id === prId);
    if (!pullRequest) return;
    try {
      await apiRequest(`/projects/${pullRequest.projectId}/pull-requests/${pullRequest.number}/merge`, { method: 'POST' });
      if (pullRequest.linkedTaskId) await updateTask(pullRequest.linkedTaskId, { stage: 'done' });
      await loadWorkspace();
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  };

  const closePullRequest = async (prId: string) => {
    const pullRequest = pullRequests.find(item => item.id === prId);
    if (!pullRequest) return;
    try {
      await apiRequest(`/projects/${pullRequest.projectId}/pull-requests/${pullRequest.number}`, { method: 'PATCH' });
      await loadWorkspace();
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  };
  const simulateWebhook = (eventType: 'push' | 'pull_request' | 'workflow_run') => {
    const time = 'Just now';
    if (eventType === 'push') {
      const sha = Math.random().toString(16).substring(2, 9);
      const pushMsg = 'refactor: optimize rendering pipeline & memoize state selectors';
      const newCommit: Commit = {
        id: sha,
        projectId: activeProject.id,
        message: pushMsg,
        authorName: 'Rohan Mehta',
        authorEmail: 'rohan@devflow.io',
        authorAvatar: mockUsers[2].avatar,
        githubUsername: 'rohan_m',
        branch: 'main',
        timestamp: time,
        additions: 32,
        deletions: 8
      };
      setCommits(prev => [newCommit, ...prev]);
      setWebhookEvents(prev => [{
        id: `wh-${Date.now()}`,
        projectId: activeProject.id,
        event: 'push',
        action: 'created',
        sender: 'rohan_m',
        senderAvatar: mockUsers[2].avatar,
        timestamp: time,
        summary: `GitHub Webhook Received: 1 commit pushed to main (${sha})`,
        status: 'delivered',
        payload: {
          ref: 'refs/heads/main',
          after: sha,
          commits: [{ id: sha, message: pushMsg }]
        }
      }, ...prev]);
    } else if (eventType === 'pull_request') {
      const nextNum = Math.max(0, ...pullRequests.map(p => p.number)) + 1;
      const newPR: PullRequest = {
        id: `pr-${nextNum}`,
        projectId: activeProject.id,
        number: nextNum,
        title: 'feat(api): Add WebSocket event stream for real-time telemetry updates',
        description: 'Synchronizes client dashboard with incoming GitHub webhooks instantly via bidirectional socket channels.',
        authorId: 'u3',
        authorName: 'Rohan Mehta',
        authorAvatar: mockUsers[2].avatar,
        githubUsername: 'rohan_m',
        sourceBranch: 'feature/websocket-telemetry',
        targetBranch: 'main',
        status: 'open',
        reviewStatus: 'review_required',
        ciStatus: 'pending',
        additions: 195,
        deletions: 34,
        changedFilesCount: 5,
        mergeable: true,
        diffFiles: [
          {
            filename: 'src/server/websocket.ts',
            status: 'added',
            additions: 140,
            deletions: 0,
            patch: '@@ -0,0 +1,20 @@\n+import { Server } from "socket.io";\n+export function initSocketServer(httpServer) { ... }'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPullRequests(prev => [newPR, ...prev]);
      setWebhookEvents(prev => [{
        id: `wh-${Date.now()}`,
        projectId: activeProject.id,
        event: 'pull_request',
        action: 'opened',
        sender: 'rohan_m',
        senderAvatar: mockUsers[2].avatar,
        timestamp: time,
        summary: `GitHub Webhook Received: PR #${nextNum} opened by @rohan_m`,
        status: 'delivered',
        payload: {
          action: 'opened',
          number: nextNum,
          pull_request: { title: newPR.title }
        }
      }, ...prev]);
    } else {
      const nextRunNum = Math.max(100, ...workflowRuns.map(r => r.runNumber)) + 1;
      const simRunId = `run-sim-${Date.now()}`;
      const newSimRun: WorkflowRun = {
        id: simRunId,
        runNumber: nextRunNum,
        projectId: activeProject.id,
        name: 'CI / Build & Integration Tests',
        workflowFileName: 'ci.yml',
        status: 'success',
        event: 'workflow_run',
        branch: 'main',
        commitSha: '5fe7edf',
        commitMessage: 'till module 3',
        authorName: 'GitHub Actions [bot]',
        authorAvatar: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=150&auto=format&fit=crop&q=80',
        githubUsername: 'github-actions[bot]',
        duration: '1m 02s',
        durationSeconds: 62,
        startedAt: time,
        completedAt: time,
        jobs: [
          {
            id: `job-sim-${nextRunNum}`,
            name: 'Build and Test Matrix',
            runner: 'ubuntu-latest',
            status: 'completed',
            duration: '1m 02s',
            steps: [
              { name: 'Runner environment init', status: 'completed', durationSeconds: 6, logs: ['[INFO] GitHub Actions runner initialized.'] },
              { name: 'Checkout main', status: 'completed', durationSeconds: 4, logs: ['[INFO] Checked out repository at 5fe7edf.'] },
              { name: 'Install dependencies (npm ci)', status: 'completed', durationSeconds: 14, logs: ['$ npm ci', 'added 28 packages'] },
              { name: 'Run test suite (vitest)', status: 'completed', durationSeconds: 38, logs: ['$ vitest run', '✓ 48 tests passed (100% green)'] }
            ]
          }
        ],
        testOutcome: {
          total: 48,
          passed: 48,
          failed: 0,
          skipped: 0,
          duration: '18.4s',
          coveragePercent: 94.2
        },
        htmlUrl: `https://github.com/meghana922007/devflow_fsd/actions/runs/${nextRunNum}`,
        isLive: true
      };

      setWorkflowRuns(prev => [newSimRun, ...prev]);

      setWebhookEvents(prev => [{
        id: `wh-${Date.now()}`,
        projectId: activeProject.id,
        event: 'workflow_run',
        action: 'completed',
        sender: 'github-actions[bot]',
        senderAvatar: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=150&auto=format&fit=crop&q=80',
        timestamp: time,
        summary: `GitHub Actions CI workflow #${nextRunNum} passed (48/48 tests green)`,
        status: 'delivered',
        payload: {
          workflow: 'CI / Build & Integration Tests',
          conclusion: 'success',
          duration_seconds: 62,
          branch: 'main',
          run_number: nextRunNum
        }
      }, ...prev]);
    }
  };

  const syncRepoWithGitHub = async (customUrl?: string): Promise<boolean> => {
    if (!activeProject.id) return false;
    const targetUrl = customUrl || activeProject.gitRepo || '';
    const parsed = parseGitHubRepo(targetUrl);
    if (!parsed) {
      const message = `Invalid repository URL "${targetUrl}". Expected https://github.com/owner/repo`;
      setRepoSettings(previous => ({ ...previous, syncError: message }));
      setApiError(message);
      return false;
    }

    setIsSyncingGitHub(true);
    try {
      const path = `/projects/${activeProject.id}/github`;
      const existing = await apiRequest<{ integration: { repoUrl: string; owner: string; repoName: string; defaultBranch: string; autoSync: boolean; lastSyncedAt: string | null } | null }>(path);
      let integration = existing.integration;
      let webhook = { url: '', secret: '' };
      if (!integration || integration.repoUrl !== targetUrl) {
        const configured = await apiRequest<{
          integration: { repoUrl: string; owner: string; repoName: string; defaultBranch: string; autoSync: boolean; lastSyncedAt: string | null };
          webhook: { url: string; secret: string };
        }>(path, {
          method: 'PUT',
          body: JSON.stringify({ repoUrl: targetUrl, defaultBranch: repoSettings.defaultBranch || 'main', autoSync: true }),
        });
        integration = configured.integration;
        webhook = configured.webhook;
      }
      const { synced } = await apiRequest<{ synced: { commits: number; pullRequests: number; workflowRuns: number } }>(`${path}/sync`, { method: 'POST' });
      await loadWorkspace();
      setRepoSettings(previous => ({
        ...previous,
        connected: true,
        repoUrl: integration.repoUrl,
        defaultBranch: integration.defaultBranch,
        owner: integration.owner,
        repoName: integration.repoName,
        webhookUrl: webhook.url || previous.webhookUrl,
        webhookSecret: webhook.secret || previous.webhookSecret,
        isLiveSync: true,
        syncError: null,
        lastSyncedAt: new Date().toISOString(),
        description: `${synced.commits} commits, ${synced.pullRequests} pull requests, ${synced.workflowRuns} workflow runs synced`,
      }));
      setApiError(null);
      return true;
    } catch (error) {
      const message = reportApiError(error);
      setRepoSettings(previous => ({ ...previous, syncError: message }));
      setApiError(message);
      return false;
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const fetchUserRepos = useCallback(async () => {
    try {
      const { repositories } = await apiRequest<{ repositories: {
        name: string; full_name: string; description: string | null; stargazers_count: number;
        html_url: string; default_branch: string;
      }[] }>('/github/repos');
      setUserPublicRepos(repositories.map(repository => ({
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,
        stars: repository.stargazers_count,
        language: null,
        htmlUrl: repository.html_url,
        defaultBranch: repository.default_branch,
      })));
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  }, []);

  const refreshGitHubAccount = useCallback(async () => {
    try {
      const status = await apiRequest<{ connected: boolean; username: string | null }>('/github/status');
      setGithubAccount(status);
      if (status.connected) await fetchUserRepos();
      else setUserPublicRepos([]);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  }, [fetchUserRepos]);

  const saveGitHubToken = async (token: string) => {
    try {
      const status = await apiRequest<{ connected: boolean; username: string }>('/github/token', {
        method: 'PUT',
        body: JSON.stringify({ token }),
      });
      setGithubAccount(status);
      await fetchUserRepos();
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const removeGitHubToken = async () => {
    try {
      await apiRequest('/github/token', { method: 'DELETE' });
      setGithubAccount({ connected: false, username: null });
      setUserPublicRepos([]);
      setApiError(null);
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };

  const switchGitRepo = async (newRepoUrl: string): Promise<boolean> => {
    try {
      await apiRequest<{ project: Project }>(`/projects/${activeProject.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ gitRepo: newRepoUrl }),
      });
      const updatedProject = { ...activeProject, gitRepo: newRepoUrl };
      setProjects(previous => previous.map(project => project.id === updatedProject.id ? updatedProject : project));
      setActiveProject(updatedProject);
      return await syncRepoWithGitHub(newRepoUrl);
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };
  const updateRepoSettings = (settings: Partial<RepoSettings>) => {
    setRepoSettings(prev => ({ ...prev, ...settings }));
  };

  const dispatchWorkflow = async (options: {
    workflowName: string;
    branch: string;
    runTests?: boolean;
    verbose?: boolean;
  }): Promise<boolean> => {
    const workflowFileName = options.workflowName === 'Automated Playwright E2E Regression'
      ? 'e2e.yml'
      : options.workflowName === 'Docker Container Package & Vulnerability Scan'
        ? 'docker.yml'
        : options.workflowName === 'Security CodeQL Deep Scan'
          ? 'codeql.yml'
          : 'ci.yml';
    try {
      await apiRequest(`/projects/${activeProject.id}/workflows/dispatch`, {
        method: 'POST',
        body: JSON.stringify({ workflowFileName, branch: options.branch }),
      });
      setApiError(null);
      await fetchWorkflowRuns();
      return true;
    } catch (error) {
      setApiError(reportApiError(error));
      return false;
    }
  };
  const cancelWorkflowRun = async (runId: string) => {
    const run = workflowRuns.find(item => item.id === runId);
    if (!run) return;
    try {
      await apiRequest(`/projects/${run.projectId}/workflows/${run.runNumber}/cancel`, { method: 'POST' });
      await fetchWorkflowRuns();
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  };

  const rerunWorkflowRun = async (runId: string) => {
    const run = workflowRuns.find(item => item.id === runId);
    if (!run) return;
    try {
      await apiRequest(`/projects/${run.projectId}/workflows/${run.runNumber}/rerun`, { method: 'POST' });
      await fetchWorkflowRuns();
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    }
  };
  const fetchWorkflowRuns = async () => {
    if (!activeProject.id) return;
    setIsFetchingWorkflows(true);
    try {
      await apiRequest(`/projects/${activeProject.id}/github/sync`, { method: 'POST' });
      await loadWorkspace();
      setApiError(null);
    } catch (error) {
      setApiError(reportApiError(error));
    } finally {
      setIsFetchingWorkflows(false);
    }
  };
  // Auto-sync live repo on initial mount, project switch, window focus, & interval
  useEffect(() => {
    if (!isAuthenticated || !activeProject.id || !activeProject.gitRepo) return;
    void syncRepoWithGitHub();

    const handleWindowFocus = () => {
      void syncRepoWithGitHub();
    };
    window.addEventListener('focus', handleWindowFocus);

    const interval = setInterval(() => {
      void syncRepoWithGitHub();
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [isAuthenticated, activeProject.id, activeProject.gitRepo]);

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      apiError,
      clearApiError: () => setApiError(null),
      login,
      loginWithGithub,
      signup,
      logout,
      currentView,
      setCurrentView,
      activeProject,
      projects,
      selectProject,
      backToHub,
      addProject,
      activeTab,
      setActiveTab,
      users,
      addMemberToProject,
      removeMemberFromProject,
      tasks,
      moveTaskStage,
      addTask,
      updateTask,
      deleteTask,
      toggleSubTask,
      issues,
      addIssue,
      updateIssueStatus,
      updateIssue,
      deleteIssue,
      pullRequests,
      commits,
      branches,
      webhookEvents,
      repoSettings,
      createPullRequest,
      mergePullRequest,
      closePullRequest,
      simulateWebhook,
      syncRepoWithGitHub,
      updateRepoSettings,
      isSyncingGitHub,
      githubRateLimit,
      userPublicRepos,
      githubAccount,
      refreshGitHubAccount,
      saveGitHubToken,
      removeGitHubToken,
      fetchUserRepos,
      switchGitRepo,
      selectedPRForDiff,
      setSelectedPRForDiff,
      isNewPRModalOpen,
      setIsNewPRModalOpen,
      isWebhookSimulatorOpen,
      setIsWebhookSimulatorOpen,
      isRepoSettingsModalOpen,
      setIsRepoSettingsModalOpen,
      // Module 4: CI/CD Monitoring
      workflowRuns,
      selectedRunForLogs,
      setSelectedRunForLogs,
      isDispatchModalOpen,
      setIsDispatchModalOpen,
      dispatchWorkflow,
      cancelWorkflowRun,
      rerunWorkflowRun,
      isFetchingWorkflows,
      fetchWorkflowRuns,
      activities,
      searchQuery,
      setSearchQuery,
      priorityFilter,
      setPriorityFilter,
      assigneeFilter,
      setAssigneeFilter,
      severityFilter,
      setSeverityFilter,
      issueStatusFilter,
      setIssueStatusFilter,
      isTaskModalOpen,
      setIsTaskModalOpen,
      editingTask,
      setEditingTask,
      isIssueModalOpen,
      setIsIssueModalOpen,
      editingIssue,
      setEditingIssue,
      isNewProjectModalOpen,
      setIsNewProjectModalOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
