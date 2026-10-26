import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project, Task, Issue, TaskStage, IssueStatus, ActivityItem, User, PullRequest, Commit, Branch, WebhookEvent, RepoSettings, WorkflowRun } from '../types';
import {
  parseGitHubRepo,
  fetchGitHubRepoDetails,
  fetchGitHubCommits,
  fetchGitHubBranches,
  fetchGitHubPullRequests,
  fetchUserPublicRepos,
  checkRateLimit,
  fetchGitHubWorkflowRuns
} from '../services/githubService';
import type { GitHubRateLimitInfo, UserPublicRepo } from '../services/githubService';
import {
  mockProjects,
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
  login: (email: string, password?: string) => { success: boolean; error?: string };
  loginWithGithub: () => void;
  signup: (userData: Omit<User, 'id'> & { password?: string }) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (user: User) => void;

  currentView: 'hub' | 'workspace';
  setCurrentView: (view: 'hub' | 'workspace') => void;
  
  activeProject: Project;
  projects: Project[];
  selectProject: (project: Project) => void;
  backToHub: () => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  
  activeTab: 'dashboard' | 'kanban' | 'issues' | 'team' | 'github' | 'cicd';
  setActiveTab: (tab: 'dashboard' | 'kanban' | 'issues' | 'team' | 'github' | 'cicd') => void;
  
  // Team Member Management
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addMemberToProject: (projectId: string, userId: string) => void;
  removeMemberFromProject: (projectId: string, userId: string) => void;

  tasks: Task[];
  moveTaskStage: (taskId: string, newStage: TaskStage) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleSubTask: (taskId: string, subtaskId: string) => void;
  
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIssueStatus: (issueId: string, newStatus: IssueStatus) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => void;
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
  }) => void;
  mergePullRequest: (prId: string) => void;
  closePullRequest: (prId: string) => void;
  addCommit: (commitData: {
    message: string;
    branch?: string;
    linkedTaskId?: string;
    additions?: number;
    deletions?: number;
  }) => void;
  simulateWebhook: (eventType: 'push' | 'pull_request' | 'workflow_run') => void;
  syncRepoWithGitHub: (customUrl?: string, forceRefresh?: boolean) => Promise<void>;
  updateRepoSettings: (settings: Partial<RepoSettings>) => void;
  isSyncingGitHub: boolean;
  githubRateLimit: GitHubRateLimitInfo | null;
  userPublicRepos: UserPublicRepo[];
  fetchUserRepos: (username?: string) => Promise<void>;
  switchGitRepo: (repoUrl: string) => Promise<void>;
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
  }) => void;
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

  isUserModalOpen: boolean;
  setIsUserModalOpen: (open: boolean) => void;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to load persistent users DB
const getStoredUsers = (): User[] => {
  try {
    const saved = localStorage.getItem('devflow_users_db');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem('devflow_users_db', JSON.stringify(mockUsers));
  return mockUsers;
};

// Helper to load current session (starts as null if not logged in)
const getStoredSession = (): User | null => {
  try {
    const saved = localStorage.getItem('devflow_session_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activeProject, setActiveProject] = useState<Project>(mockProjects[0]);
  const [users, setUsers] = useState<User[]>(getStoredUsers);
  
  // Real Persistent Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredSession);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getStoredSession());

  const [currentView, setCurrentView] = useState<'hub' | 'workspace'>('hub');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'issues' | 'team' | 'github' | 'cicd'>('dashboard');
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);

  // Module 3: GitHub Integration State
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(mockPullRequests);
  const [commits, setCommits] = useState<Commit[]>(mockCommits);
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>(mockWebhookEvents);
  const [repoSettings, setRepoSettings] = useState<RepoSettings>(defaultRepoSettings);
  const [selectedPRForDiff, setSelectedPRForDiff] = useState<PullRequest | null>(null);
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);
  const [isWebhookSimulatorOpen, setIsWebhookSimulatorOpen] = useState(false);
  const [isRepoSettingsModalOpen, setIsRepoSettingsModalOpen] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [githubRateLimit, setGithubRateLimit] = useState<GitHubRateLimitInfo | null>(null);
  const [userPublicRepos, setUserPublicRepos] = useState<UserPublicRepo[]>([]);

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

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Real Database Authentication Handlers
  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email or username.' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Refresh users from DB
    const currentDb = getStoredUsers();

    const foundUser = currentDb.find(u =>
      u.email.toLowerCase() === cleanEmail ||
      (u.githubUsername && u.githubUsername.toLowerCase() === cleanEmail.replace('@', ''))
    );

    if (!foundUser) {
      return {
        success: false,
        error: `No registered account found for "${email}". Please verify your email or click "Create New Account".`
      };
    }

    // Strict Password Authentication against database
    const expectedPassword = foundUser.password || 'devflow123';
    if (cleanPassword !== expectedPassword) {
      return {
        success: false,
        error: 'Invalid password. (Testing tip: default passwords are "devflow123" for Meghana, "admin123" for Admin).'
      };
    }

    // Authenticated successfully!
    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    setCurrentView('hub');
    localStorage.setItem('devflow_session_user', JSON.stringify(foundUser));
    return { success: true };
  };

  const loginWithGithub = () => {
    const currentDb = getStoredUsers();
    const defaultGhUser = currentDb.find(u => u.email === 'meghana@devflow.io') || currentDb[0];
    setCurrentUser(defaultGhUser);
    setIsAuthenticated(true);
    setCurrentView('hub');
    localStorage.setItem('devflow_session_user', JSON.stringify(defaultGhUser));
  };

  const signup = (userData: Omit<User, 'id'> & { password?: string }): { success: boolean; error?: string } => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanPassword = (userData.password || '').trim();
    const cleanName = userData.name.trim();

    if (!cleanName) {
      return { success: false, error: 'Full Name is required.' };
    }

    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const currentDb = getStoredUsers();

    if (currentDb.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email is already registered. Please sign in instead.' };
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: userData.role || 'Software Engineer',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      githubUsername: userData.githubUsername || cleanEmail.split('@')[0]
    };

    const updatedDb = [...currentDb, newUser];
    setUsers(updatedDb);
    localStorage.setItem('devflow_users_db', JSON.stringify(updatedDb));

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setCurrentView('hub');
    localStorage.setItem('devflow_session_user', JSON.stringify(newUser));

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('devflow_session_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('hub');
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('devflow_session_user', JSON.stringify(user));
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

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const id = `p-${Date.now()}`;
    const newProj: Project = {
      ...projectData,
      id,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    setCurrentView('workspace');
    setActiveTab('dashboard');

    setActivities(prev => [{
      id: 'act-' + Date.now(),
      type: 'project_created',
      title: `created project "${newProj.name}"`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar
    }, ...prev]);
  };

  // Team Member Actions
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);

    if (activeProject) {
      addMemberToProject(activeProject.id, newUser.id);
    }
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    
    setProjects(prevProjects => prevProjects.map(proj => ({
      ...proj,
      teamMembers: proj.teamMembers.map(m => m.id === userId ? { ...m, ...updates } : m)
    })));

    setActiveProject(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(m => m.id === userId ? { ...m, ...updates } : m)
    }));

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    setProjects(prevProjects => prevProjects.map(proj => ({
      ...proj,
      teamMembers: proj.teamMembers.filter(m => m.id !== userId)
    })));

    setActiveProject(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== userId)
    }));
  };

  const addMemberToProject = (projectId: string, userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    setProjects(prev => prev.map(proj => {
      if (proj.id === projectId) {
        if (proj.teamMembers.some(m => m.id === userId)) return proj;
        return { ...proj, teamMembers: [...proj.teamMembers, targetUser] };
      }
      return proj;
    }));

    if (activeProject.id === projectId) {
      setActiveProject(prev => {
        if (prev.teamMembers.some(m => m.id === userId)) return prev;
        return { ...prev, teamMembers: [...prev.teamMembers, targetUser] };
      });
    }
  };

  const removeMemberFromProject = (projectId: string, userId: string) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id === projectId) {
        return { ...proj, teamMembers: proj.teamMembers.filter(m => m.id !== userId) };
      }
      return proj;
    }));

    if (activeProject.id === projectId) {
      setActiveProject(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.filter(m => m.id !== userId)
      }));
    }
  };

  // Module 1 Handlers
  const moveTaskStage = (taskId: string, newStage: TaskStage) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updated = { ...task, stage: newStage, updatedAt: new Date().toISOString() };
        const newAct: ActivityItem = {
          id: 'act-' + Date.now(),
          type: 'task_moved',
          title: `moved task "${task.title}" to ${newStage.replace('_', ' ').toUpperCase()}`,
          timestamp: 'Just now',
          user: currentUser ? currentUser.name : 'Meghana',
          avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar
        };
        setActivities(acts => [newAct, ...acts]);
        return updated;
      }
      return task;
    }));
  };

  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: Task = {
      ...newTaskData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    
    setActivities(prev => [{
      id: 'act-' + Date.now(),
      type: 'task_created',
      title: `created task "${newTask.title}"`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar
    }, ...prev]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const toggleSubTask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() };
      }
      return task;
    }));
  };

  // Module 2 Handlers
  const addIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `BUG-${Math.floor(200 + Math.random() * 800)}`;
    const newIssue: Issue = {
      ...newIssueData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setIssues(prev => [newIssue, ...prev]);

    setActivities(prev => [{
      id: 'act-' + Date.now(),
      type: 'issue_reported',
      title: `reported bug "${newIssue.title}"`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar,
      details: `Severity: ${newIssue.severity.toUpperCase()}`
    }, ...prev]);
  };

  const updateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const updated = { ...issue, status: newStatus, updatedAt: new Date().toISOString() };
        if (newStatus === 'resolved' || newStatus === 'closed') {
          setActivities(acts => [{
            id: 'act-' + Date.now(),
            type: 'issue_resolved',
            title: `marked bug "${issue.title}" as ${newStatus.toUpperCase()}`,
            timestamp: 'Just now',
            user: currentUser ? currentUser.name : 'Meghana',
            avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar
          }, ...acts]);
        }
        return updated;
      }
      return issue;
    }));
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, ...updates, updatedAt: new Date().toISOString() } : issue));
  };

  const deleteIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  // Module 3: GitHub Integration Handlers
  const createPullRequest = (prData: {
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
    linkedTaskId?: string;
    linkedIssueId?: string;
    isDraft?: boolean;
  }) => {
    const nextNumber = Math.max(0, ...pullRequests.map(p => p.number)) + 1;
    const newPR: PullRequest = {
      id: `pr-${nextNumber}`,
      projectId: activeProject.id,
      number: nextNumber,
      title: prData.title,
      description: prData.description,
      authorId: currentUser?.id || 'u2',
      authorName: currentUser?.name || 'Meghana',
      authorAvatar: currentUser?.avatar || mockUsers[1].avatar,
      githubUsername: currentUser?.githubUsername || 'meghana_codes',
      sourceBranch: prData.sourceBranch,
      targetBranch: prData.targetBranch,
      status: prData.isDraft ? 'draft' : 'open',
      reviewStatus: 'review_required',
      ciStatus: 'pending',
      additions: Math.floor(Math.random() * 80) + 15,
      deletions: Math.floor(Math.random() * 20) + 3,
      changedFilesCount: Math.floor(Math.random() * 3) + 1,
      linkedTaskId: prData.linkedTaskId,
      linkedIssueId: prData.linkedIssueId,
      mergeable: true,
      diffFiles: [
        {
          filename: `src/features/${prData.sourceBranch.replace('/', '-')}.ts`,
          status: 'added',
          additions: 45,
          deletions: 0,
          patch: `@@ -0,0 +1,15 @@\n+// Feature implementation for ${prData.title}\n+export function initializeFeature() {\n+  console.log('Feature initialized from branch ${prData.sourceBranch}');\n+}`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPullRequests(prev => [newPR, ...prev]);

    // Ensure branch is registered in branches
    setBranches(prev => {
      if (prev.some(b => b.name === prData.sourceBranch)) return prev;
      return [...prev, {
        name: prData.sourceBranch,
        projectId: activeProject.id,
        isDefault: false,
        lastCommitSha: Math.random().toString(16).substring(2, 9),
        lastCommitMessage: `feat: ${prData.title}`,
        updatedAt: 'Just now',
        ahead: 1,
        behind: 0
      }];
    });

    // If task was linked, update task with PR link
    if (prData.linkedTaskId) {
      setTasks(prev => prev.map(t => t.id === prData.linkedTaskId ? {
        ...t,
        githubPR: `#${nextNumber} - ${prData.title}`
      } : t));
    }

    // Add activity
    setActivities(acts => [{
      id: 'act-' + Date.now(),
      type: 'pr_opened',
      title: `opened Pull Request #${nextNumber}: "${prData.title}"`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar,
      details: `${prData.sourceBranch} → ${prData.targetBranch}`
    }, ...acts]);

    // Record webhook event
    const newWebhook: WebhookEvent = {
      id: `wh-${Date.now()}`,
      projectId: activeProject.id,
      event: 'pull_request',
      action: 'opened',
      sender: currentUser?.githubUsername || 'meghana_codes',
      senderAvatar: currentUser?.avatar || mockUsers[1].avatar,
      timestamp: 'Just now',
      summary: `PR #${nextNumber} opened: "${prData.title}"`,
      status: 'delivered',
      payload: {
        action: 'opened',
        number: nextNumber,
        pull_request: {
          title: prData.title,
          head: prData.sourceBranch,
          base: prData.targetBranch,
          user: { login: currentUser?.githubUsername || 'meghana_codes' }
        }
      }
    };
    setWebhookEvents(prev => [newWebhook, ...prev]);
  };

  const mergePullRequest = (prId: string) => {
    const pr = pullRequests.find(p => p.id === prId);
    if (!pr || pr.status === 'merged') return;

    setPullRequests(prev => prev.map(p => p.id === prId ? {
      ...p,
      status: 'merged',
      reviewStatus: 'approved',
      ciStatus: 'success',
      updatedAt: new Date().toISOString()
    } : p));

    // Automatically transition linked task to 'done' in Module 1 Kanban!
    if (pr.linkedTaskId) {
      moveTaskStage(pr.linkedTaskId, 'done');
    }

    // Add merge commit to commit stream
    const mergeSha = Math.random().toString(16).substring(2, 9);
    const mergeCommit: Commit = {
      id: mergeSha,
      projectId: pr.projectId,
      message: `Merge pull request #${pr.number} from ${pr.sourceBranch}`,
      authorName: currentUser?.name || 'Meghana',
      authorEmail: currentUser?.email || 'meghana@devflow.io',
      authorAvatar: currentUser?.avatar || mockUsers[1].avatar,
      githubUsername: currentUser?.githubUsername || 'meghana_codes',
      branch: pr.targetBranch,
      timestamp: 'Just now',
      additions: pr.additions,
      deletions: pr.deletions,
      linkedTaskId: pr.linkedTaskId
    };
    setCommits(prev => [mergeCommit, ...prev]);

    // Activity
    setActivities(acts => [{
      id: 'act-' + Date.now(),
      type: 'pr_merged',
      title: `merged Pull Request #${pr.number} into ${pr.targetBranch}`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar
    }, ...acts]);

    // Webhook event
    setWebhookEvents(prev => [{
      id: `wh-${Date.now()}`,
      projectId: pr.projectId,
      event: 'pull_request',
      action: 'closed',
      sender: currentUser?.githubUsername || 'meghana_codes',
      senderAvatar: currentUser?.avatar || mockUsers[1].avatar,
      timestamp: 'Just now',
      summary: `PR #${pr.number} merged into ${pr.targetBranch} (${mergeSha})`,
      status: 'delivered',
      payload: {
        action: 'closed',
        merged: true,
        number: pr.number,
        merge_commit_sha: mergeSha
      }
    }, ...prev]);
  };

  const closePullRequest = (prId: string) => {
    setPullRequests(prev => prev.map(p => p.id === prId ? { ...p, status: 'closed', updatedAt: new Date().toISOString() } : p));
  };

  const addCommit = (commitData: {
    message: string;
    branch?: string;
    linkedTaskId?: string;
    additions?: number;
    deletions?: number;
  }) => {
    const sha = Math.random().toString(16).substring(2, 9);
    const newCommit: Commit = {
      id: sha,
      projectId: activeProject.id,
      message: commitData.message,
      authorName: currentUser?.name || 'Meghana',
      authorEmail: currentUser?.email || 'meghana@devflow.io',
      authorAvatar: currentUser?.avatar || mockUsers[1].avatar,
      githubUsername: currentUser?.githubUsername || 'meghana_codes',
      branch: commitData.branch || 'main',
      timestamp: 'Just now',
      additions: commitData.additions ?? Math.floor(Math.random() * 40) + 5,
      deletions: commitData.deletions ?? Math.floor(Math.random() * 10) + 1,
      linkedTaskId: commitData.linkedTaskId
    };

    setCommits(prev => [newCommit, ...prev]);

    setActivities(acts => [{
      id: 'act-' + Date.now(),
      type: 'github_push',
      title: `pushed commit ${sha}: "${commitData.message}"`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar,
      details: `Branch: ${commitData.branch || 'main'}`
    }, ...acts]);

    setWebhookEvents(prev => [{
      id: `wh-${Date.now()}`,
      projectId: activeProject.id,
      event: 'push',
      action: 'created',
      sender: currentUser?.githubUsername || 'meghana_codes',
      senderAvatar: currentUser?.avatar || mockUsers[1].avatar,
      timestamp: 'Just now',
      summary: `Git push to ${commitData.branch || 'main'} (${sha}): "${commitData.message}"`,
      status: 'delivered',
      payload: {
        ref: `refs/heads/${commitData.branch || 'main'}`,
        head_commit: {
          id: sha,
          message: commitData.message,
          author: { name: currentUser?.name || 'Meghana' }
        }
      }
    }, ...prev]);
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

  const syncRepoWithGitHub = async (customUrl?: string, forceRefresh = true): Promise<void> => {
    const targetUrl = customUrl || activeProject.gitRepo || repoSettings.repoUrl;
    const parsed = parseGitHubRepo(targetUrl);
    if (!parsed) {
      setRepoSettings(prev => ({
        ...prev,
        syncError: `Invalid repository URL "${targetUrl}". Expected https://github.com/owner/repo`,
        lastSyncedAt: 'Error parsing URL'
      }));
      return;
    }

    const { owner, repo } = parsed;
    setIsSyncingGitHub(true);
    setRepoSettings(prev => ({ ...prev, syncError: null }));

    try {
      const [repoRes, commitsRes, branchesRes, pullsRes, rateLimitRes] = await Promise.allSettled([
        fetchGitHubRepoDetails(owner, repo, undefined, forceRefresh),
        fetchGitHubCommits(owner, repo, activeProject.id, undefined, undefined, forceRefresh),
        fetchGitHubBranches(owner, repo, activeProject.id, undefined, undefined, forceRefresh),
        fetchGitHubPullRequests(owner, repo, activeProject.id, undefined, forceRefresh),
        checkRateLimit()
      ]);

      if (rateLimitRes.status === 'fulfilled' && rateLimitRes.value) {
        setGithubRateLimit(rateLimitRes.value);
      }

      if (repoRes.status === 'fulfilled') {
        const info = repoRes.value;
        setRepoSettings(prev => ({
          ...prev,
          connected: true,
          repoUrl: info.htmlUrl,
          defaultBranch: info.defaultBranch,
          owner: info.owner,
          repoName: info.name,
          description: info.description,
          starsCount: info.stars,
          forksCount: info.forks,
          openIssuesCount: info.openIssues,
          isLiveSync: true,
          syncError: null,
          lastSyncedAt: 'Just now'
        }));
      }

      if (commitsRes.status === 'fulfilled' && commitsRes.value.length > 0) {
        const remote = commitsRes.value;
        setCommits(prev => {
          const other = prev.filter(c => c.projectId !== activeProject.id);
          return [...remote, ...other];
        });

        // Automatically update Kanban tasks if commit closes/fixes a task
        remote.forEach(c => {
          if (c.linkedTaskId && /closes|fixes|resolves/i.test(c.message)) {
            setTasks(currentTasks => currentTasks.map(t =>
              t.id === c.linkedTaskId && t.stage !== 'done' ? { ...t, stage: 'done', updatedAt: 'Just now' } : t
            ));
          }
        });
      }

      if (branchesRes.status === 'fulfilled' && branchesRes.value.length > 0) {
        setBranches(prev => {
          const other = prev.filter(b => b.projectId !== activeProject.id);
          return [...branchesRes.value, ...other];
        });
      }

      if (pullsRes.status === 'fulfilled' && pullsRes.value.length > 0) {
        setPullRequests(prev => {
          const other = prev.filter(pr => pr.projectId !== activeProject.id);
          return [...pullsRes.value, ...other];
        });
      }

      // Record live sync event
      const fetchedCount = commitsRes.status === 'fulfilled' ? commitsRes.value.length : 0;
      setWebhookEvents(prev => [{
        id: `wh-${Date.now()}`,
        projectId: activeProject.id,
        event: 'push',
        action: 'synchronized',
        sender: owner,
        senderAvatar: repoRes.status === 'fulfilled' ? repoRes.value.ownerAvatar : 'https://avatars.githubusercontent.com/u/201999808?v=4',
        timestamp: 'Just now',
        summary: `Synchronized telemetry with live GitHub repository ${owner}/${repo} (${fetchedCount} commits verified)`,
        status: 'delivered',
        payload: {
          action: 'synchronized',
          repository: `${owner}/${repo}`,
          commits_count: fetchedCount
        }
      }, ...prev]);

    } catch (err: any) {
      setRepoSettings(prev => ({
        ...prev,
        syncError: err?.message || 'Error communicating with GitHub API',
        lastSyncedAt: 'Error'
      }));
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const fetchUserRepos = async (username = 'meghana922007') => {
    try {
      const repos = await fetchUserPublicRepos(username);
      setUserPublicRepos(repos);
    } catch {
      // non-fatal fallback
    }
  };

  const switchGitRepo = async (newRepoUrl: string) => {
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, gitRepo: newRepoUrl } : p));
    setActiveProject(prev => ({ ...prev, gitRepo: newRepoUrl }));
    await syncRepoWithGitHub(newRepoUrl, true);
  };

  const updateRepoSettings = (settings: Partial<RepoSettings>) => {
    setRepoSettings(prev => ({ ...prev, ...settings }));
  };

  const dispatchWorkflow = (options: {
    workflowName: string;
    branch: string;
    runTests?: boolean;
    verbose?: boolean;
  }) => {
    const nextRunNum = Math.max(100, ...workflowRuns.map(r => r.runNumber)) + 1;
    const runId = `run-dispatch-${Date.now()}`;
    const branchCommits = commits.filter(c => c.branch === options.branch);
    const headSha = branchCommits[0]?.id || '5fe7edf';
    const commitMsg = branchCommits[0]?.message || `Manual workflow dispatch on ${options.branch}`;

    const newRun: WorkflowRun = {
      id: runId,
      runNumber: nextRunNum,
      projectId: activeProject.id,
      name: options.workflowName,
      workflowFileName: options.workflowName.toLowerCase().includes('docker') ? 'docker.yml' : 'ci.yml',
      status: 'in_progress',
      event: 'workflow_dispatch',
      branch: options.branch,
      commitSha: headSha,
      commitMessage: commitMsg,
      authorName: currentUser?.name || 'Meghana Pinikeshi',
      authorAvatar: currentUser?.avatar || mockUsers[1].avatar,
      githubUsername: currentUser?.githubUsername || 'meghana922007',
      duration: 'Running (0s)',
      durationSeconds: 0,
      startedAt: 'Just now',
      jobs: [
        {
          id: `job-${nextRunNum}-1`,
          name: 'Build, Lint & Test Pipeline',
          runner: 'ubuntu-latest',
          status: 'in_progress',
          duration: 'Running...',
          steps: [
            {
              name: 'Set up runner & Node.js 22',
              status: 'completed',
              durationSeconds: 4,
              logs: [
                '[INFO] Initializing GitHub Actions runner (ubuntu-24.04)',
                `[INFO] Triggered via workflow_dispatch by @${currentUser?.githubUsername || 'meghana922007'}`,
                '[SUCCESS] Runner ready.'
              ]
            },
            {
              name: 'Checkout repository',
              status: 'completed',
              durationSeconds: 3,
              logs: [
                `[INFO] Checking out ${options.branch} (${headSha})`,
                '[SUCCESS] Repository checked out.'
              ]
            },
            {
              name: 'Install dependencies (npm ci)',
              status: 'completed',
              durationSeconds: 5,
              logs: [
                '$ npm ci',
                'added 28 packages in 0.9s',
                '[SUCCESS] Dependencies installed.'
              ]
            },
            {
              name: 'Execute lint & typecheck',
              status: 'in_progress',
              durationSeconds: 3,
              logs: [
                '$ npx oxlint',
                'oxlint: 0 errors, 0 warnings',
                '$ tsc -b',
                'TypeScript compilation passed.'
              ]
            },
            {
              name: 'Run unit & component test matrix',
              status: 'queued',
              durationSeconds: 0,
              logs: [
                '$ vitest run --coverage',
                'Running 48 test suites across project modules...'
              ]
            }
          ]
        }
      ],
      testOutcome: {
        total: 48,
        passed: 48,
        failed: 0,
        skipped: 0,
        duration: '14.8s',
        coveragePercent: 94.2
      },
      artifacts: [
        { name: 'devflow-dist-bundle.zip', size: '484 KB' }
      ],
      htmlUrl: `https://github.com/meghana922007/devflow_fsd/actions/runs/${nextRunNum}`,
      isLive: true
    };

    setWorkflowRuns(prev => [newRun, ...prev]);

    setActivities(acts => [{
      id: 'act-' + Date.now(),
      type: 'github_push',
      title: `triggered workflow "${options.workflowName}" on ${options.branch}`,
      timestamp: 'Just now',
      user: currentUser?.name || 'Meghana Pinikeshi',
      avatar: currentUser?.avatar || mockUsers[1].avatar
    }, ...acts]);

    setWebhookEvents(prev => [{
      id: `wh-${Date.now()}`,
      projectId: activeProject.id,
      event: 'workflow_run',
      action: 'requested',
      sender: currentUser?.githubUsername || 'meghana_codes',
      senderAvatar: currentUser?.avatar || mockUsers[1].avatar,
      timestamp: 'Just now',
      summary: `Workflow "${options.workflowName}" #${nextRunNum} queued on ${options.branch}`,
      status: 'delivered',
      payload: {
        action: 'requested',
        workflow_run: {
          id: newRun.id,
          name: options.workflowName,
          head_branch: options.branch,
          event: 'workflow_dispatch'
        }
      }
    }, ...prev]);
  };

  const cancelWorkflowRun = (runId: string) => {
    setWorkflowRuns(prev => prev.map(r => r.id === runId ? {
      ...r,
      status: 'cancelled',
      duration: `${r.durationSeconds}s (Cancelled)`,
      completedAt: 'Just now'
    } : r));
  };

  const rerunWorkflowRun = (runId: string) => {
    setWorkflowRuns(prev => prev.map(r => {
      if (r.id !== runId) return r;
      return {
        ...r,
        status: 'in_progress',
        duration: 'Running (0s)',
        durationSeconds: 0,
        startedAt: 'Just now',
        completedAt: undefined,
        jobs: r.jobs.map(j => ({
          ...j,
          status: 'in_progress',
          duration: 'Running...',
          steps: j.steps.map((s, idx) => ({
            ...s,
            status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'queued'
          }))
        }))
      };
    }));
  };

  const fetchWorkflowRuns = async () => {
    const repoParsed = parseGitHubRepo(activeProject.gitRepo || repoSettings.repoUrl);
    if (!repoParsed) return;
    setIsFetchingWorkflows(true);
    try {
      const runs = await fetchGitHubWorkflowRuns(repoParsed.owner, repoParsed.repo, activeProject.id, undefined, true);
      if (runs && runs.length > 0) {
        setWorkflowRuns(runs);
      }
    } catch (e) {
      console.warn('Could not fetch GitHub Actions runs', e);
    } finally {
      setIsFetchingWorkflows(false);
    }
  };

  // Live simulation ticker for in-progress workflow runs
  useEffect(() => {
    const hasRunning = workflowRuns.some(r => r.status === 'in_progress');
    if (!hasRunning) return;

    const interval = setInterval(() => {
      setWorkflowRuns(prev => prev.map(run => {
        if (run.status !== 'in_progress') return run;
        const nextSec = run.durationSeconds + 1;

        if (nextSec >= 16 && run.id.startsWith('run-dispatch-')) {
          const completedJobs = run.jobs.map(j => ({
            ...j,
            status: 'completed' as const,
            duration: `${nextSec}s`,
            steps: j.steps.map(s => ({
              ...s,
              status: 'completed' as const,
              logs: [...s.logs, `✓ Completed successfully in ${s.durationSeconds || 3}s.`]
            }))
          }));

          setPullRequests(prs => prs.map(p => p.sourceBranch === run.branch && p.ciStatus === 'pending' ? { ...p, ciStatus: 'success' } : p));

          return {
            ...run,
            status: 'success',
            duration: `${nextSec}s`,
            durationSeconds: nextSec,
            completedAt: 'Just now',
            jobs: completedJobs,
            testOutcome: {
              total: 48,
              passed: 48,
              failed: 0,
              skipped: 0,
              duration: '14.8s',
              coveragePercent: 94.2
            }
          };
        }

        const mins = Math.floor(nextSec / 60);
        const secs = nextSec % 60;
        const durStr = mins > 0 ? `Running (${mins}m ${secs}s)` : `Running (${secs}s)`;
        return {
          ...run,
          durationSeconds: nextSec,
          duration: durStr
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [workflowRuns]);

  // Auto-sync live repo on initial mount, project switch, window focus, & interval
  useEffect(() => {
    syncRepoWithGitHub(undefined, false);
    fetchUserRepos('meghana922007');

    const handleWindowFocus = () => {
      syncRepoWithGitHub(undefined, true);
    };
    window.addEventListener('focus', handleWindowFocus);

    const interval = setInterval(() => {
      syncRepoWithGitHub(undefined, true);
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [activeProject.id]);

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      login,
      loginWithGithub,
      signup,
      logout,
      switchUser,
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
      addUser,
      updateUser,
      deleteUser,
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
      addCommit,
      simulateWebhook,
      syncRepoWithGitHub,
      updateRepoSettings,
      isSyncingGitHub,
      githubRateLimit,
      userPublicRepos,
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
      isUserModalOpen,
      setIsUserModalOpen,
      editingUser,
      setEditingUser
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
