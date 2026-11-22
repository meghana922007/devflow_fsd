import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Project,
  Task,
  Issue,
  TaskStage,
  IssueStatus,
  ActivityItem,
  User,
  PullRequest,
  Commit,
  Branch,
  WebhookEvent,
  RepoSettings
} from '../types';
import {
  parseGitHubRepo,
  fetchGitHubRepoDetails,
  fetchGitHubCommits,
  fetchGitHubBranches,
  fetchGitHubPullRequests,
  fetchGitHubPullRequestFiles,
  fetchUserPublicRepos,
  getCachedUserPublicRepos,
  clearGitHubCache,
  hasGitHubToken,
  checkRateLimit
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
  defaultRepoSettings
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

  activeTab: 'dashboard' | 'kanban' | 'issues' | 'team' | 'github';
  setActiveTab: (tab: 'dashboard' | 'kanban' | 'issues' | 'team' | 'github') => void;

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
  saveGitHubPat: (token: string) => Promise<void>;
  isSyncingGitHub: boolean;
  githubRateLimit: GitHubRateLimitInfo | null;
  userPublicRepos: UserPublicRepo[];
  userReposOwner: string;
  isLoadingUserRepos: boolean;
  userReposError: string | null;
  fetchUserRepos: (username?: string, forceRefresh?: boolean) => Promise<void>;
  switchGitRepo: (repoUrl: string) => Promise<void>;
  selectedPRForDiff: PullRequest | null;
  setSelectedPRForDiff: (pr: PullRequest | null) => void;
  openPRDiff: (pr: PullRequest) => Promise<void>;
  isLoadingDiff: boolean;
  diffError: string | null;
  isNewPRModalOpen: boolean;
  setIsNewPRModalOpen: (open: boolean) => void;
  preselectedPRSourceBranch: string | null;
  setPreselectedPRSourceBranch: (branch: string | null) => void;
  isWebhookSimulatorOpen: boolean;
  setIsWebhookSimulatorOpen: (open: boolean) => void;
  isRepoSettingsModalOpen: boolean;
  setIsRepoSettingsModalOpen: (open: boolean) => void;

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

  // Workspace Reset
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  users: 'devflow_users_db',
  sessionUser: 'devflow_session_user',
  projects: 'devflow_projects_v1',
  activeProjectId: 'devflow_active_project_id_v1',
  tasks: 'devflow_tasks_v1',
  issues: 'devflow_issues_v1',
  activities: 'devflow_activities_v1',
  pullRequests: 'devflow_prs_v1',
  commits: 'devflow_commits_v1',
  branches: 'devflow_branches_v1',
  webhookEvents: 'devflow_webhooks_v1',
  repoSettingsMap: 'devflow_repo_settings_map_v1',
} as const;

function loadStoredValue<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? (parsed as T) : fallback;
    }
    if (typeof fallback === 'object' && fallback !== null) {
      return parsed && typeof parsed === 'object' ? (parsed as T) : fallback;
    }
    return parsed as T;
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
    return fallback;
  }
}

function saveStoredValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving storage key ${key}:`, e);
  }
}

// Helper to load persistent users DB
const getStoredUsers = (): User[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.users);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
  return mockUsers;
};

// Helper to load current session (starts as null if not logged in)
const getStoredSession = (): User | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.sessionUser);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return null;
};

const VERIFIED_FALLBACK_REPOS: UserPublicRepo[] = [
  {
    name: 'devflow',
    fullName: 'meghana922007/devflow',
    description: 'Unified developer workspace combining Kanban, Issues, GitHub & CI/CD',
    stars: 0,
    language: 'TypeScript',
    htmlUrl: 'https://github.com/meghana922007/devflow',
    defaultBranch: 'main'
  },
  {
    name: 'ThinkTank',
    fullName: 'meghana922007/ThinkTank',
    description: 'TypeScript multi-agent reasoning and idea generation engine',
    stars: 0,
    language: 'TypeScript',
    htmlUrl: 'https://github.com/meghana922007/ThinkTank',
    defaultBranch: 'main'
  },
  {
    name: 'Agentic-RBAC',
    fullName: 'meghana922007/Agentic-RBAC',
    description: 'Role-based access control and policy enforcement engine',
    stars: 0,
    language: 'TypeScript',
    htmlUrl: 'https://github.com/meghana922007/Agentic-RBAC',
    defaultBranch: 'main'
  },
  {
    name: 'sellersense',
    fullName: 'meghana922007/sellersense',
    description: 'E-commerce sales and storefront analytics platform',
    stars: 0,
    language: 'TypeScript',
    htmlUrl: 'https://github.com/meghana922007/sellersense',
    defaultBranch: 'main'
  }
];

const getDefaultRepoSettingsForProject = (project: Project): RepoSettings => {
  const parsed = project.gitRepo ? parseGitHubRepo(project.gitRepo) : null;
  const hasPat = hasGitHubToken();

  if (project.id === 'p1') {
    return {
      ...defaultRepoSettings,
      patConfigured: hasPat,
      repoUrl: project.gitRepo || defaultRepoSettings.repoUrl,
      owner: parsed?.owner || defaultRepoSettings.owner,
      repoName: parsed?.repo || defaultRepoSettings.repoName,
    };
  }

  return {
    connected: !!parsed,
    repoUrl: project.gitRepo || '',
    defaultBranch: 'main',
    webhookUrl: defaultRepoSettings.webhookUrl,
    webhookSecret: defaultRepoSettings.webhookSecret,
    patConfigured: hasPat,
    autoSync: true,
    lastSyncedAt: parsed ? 'Pending sync' : 'Not connected',
    owner: parsed?.owner || '',
    repoName: parsed?.repo || '',
    description: project.description,
    starsCount: 0,
    forksCount: 0,
    openIssuesCount: 0,
    isLiveSync: false,
    syncError: null,
  };
};

const buildInitialRepoSettingsMap = (projectList: Project[]): Record<string, RepoSettings> => {
  const stored = loadStoredValue<Record<string, RepoSettings>>(STORAGE_KEYS.repoSettingsMap, {});
  const map: Record<string, RepoSettings> = { ...stored };
  projectList.forEach(p => {
    if (!map[p.id]) {
      map[p.id] = getDefaultRepoSettingsForProject(p);
    }
  });
  return map;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => loadStoredValue(STORAGE_KEYS.projects, mockProjects));
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const storedId = localStorage.getItem(STORAGE_KEYS.activeProjectId);
    return storedId || mockProjects[0].id;
  });
  const [users, setUsers] = useState<User[]>(getStoredUsers);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || mockProjects[0];

  // Real Persistent Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredSession);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getStoredSession());

  const [currentView, setCurrentView] = useState<'hub' | 'workspace'>('hub');
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'kanban' | 'issues' | 'team' | 'github'>('dashboard');

  const [tasks, setTasks] = useState<Task[]>(() => loadStoredValue(STORAGE_KEYS.tasks, initialTasks));
  const [issues, setIssues] = useState<Issue[]>(() => loadStoredValue(STORAGE_KEYS.issues, initialIssues));
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadStoredValue(STORAGE_KEYS.activities, mockActivities));

  // Module 3: GitHub Integration State
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(() => loadStoredValue(STORAGE_KEYS.pullRequests, mockPullRequests));
  const [commits, setCommits] = useState<Commit[]>(() => loadStoredValue(STORAGE_KEYS.commits, mockCommits));
  const [branches, setBranches] = useState<Branch[]>(() => loadStoredValue(STORAGE_KEYS.branches, mockBranches));
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>(() => loadStoredValue(STORAGE_KEYS.webhookEvents, mockWebhookEvents));
  const [repoSettingsMap, setRepoSettingsMap] = useState<Record<string, RepoSettings>>(() =>
    buildInitialRepoSettingsMap(loadStoredValue(STORAGE_KEYS.projects, mockProjects))
  );
  const [selectedPRForDiff, setSelectedPRForDiff] = useState<PullRequest | null>(null);
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);
  const [preselectedPRSourceBranch, setPreselectedPRSourceBranch] = useState<string | null>(null);
  const [isWebhookSimulatorOpen, setIsWebhookSimulatorOpen] = useState(false);
  const [isRepoSettingsModalOpen, setIsRepoSettingsModalOpen] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [githubRateLimit, setGithubRateLimit] = useState<GitHubRateLimitInfo | null>(null);
  const [userPublicRepos, setUserPublicRepos] = useState<UserPublicRepo[]>([]);
  const [userReposOwner, setUserReposOwner] = useState<string>('meghana922007');
  const [isLoadingUserRepos, setIsLoadingUserRepos] = useState<boolean>(false);
  const [userReposError, setUserReposError] = useState<string | null>(null);

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

  const repoSettings = repoSettingsMap[activeProject.id] || getDefaultRepoSettingsForProject(activeProject);

  // Persist workspace state to localStorage
  useEffect(() => { saveStoredValue(STORAGE_KEYS.projects, projects); }, [projects]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.activeProjectId, activeProject.id); }, [activeProject.id]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.issues, issues); }, [issues]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.activities, activities); }, [activities]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.pullRequests, pullRequests); }, [pullRequests]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.commits, commits); }, [commits]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.branches, branches); }, [branches]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.webhookEvents, webhookEvents); }, [webhookEvents]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.repoSettingsMap, repoSettingsMap); }, [repoSettingsMap]);
  useEffect(() => { saveStoredValue(STORAGE_KEYS.users, users); }, [users]);

  const setActiveTab = (tab: 'dashboard' | 'kanban' | 'issues' | 'team' | 'github') => {
    setActiveTabState(tab);
    setSearchQuery('');
  };

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
        error: `No registered account found for "${email}". Please verify your email or click "Create Account".`
      };
    }

    // Strict Password Authentication against database
    const expectedPassword = foundUser.password || 'devflow123';
    if (cleanPassword !== expectedPassword) {
      return {
        success: false,
        error: 'Invalid password. (Testing tip: default passwords are "devflow123" for Meghana, "admin123" for Aarav).'
      };
    }

    // Authenticated successfully!
    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    setCurrentView('hub');
    localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(foundUser));
    return { success: true };
  };

  const loginWithGithub = () => {
    const currentDb = getStoredUsers();
    const defaultGhUser = currentDb.find(u => u.email === 'meghana@devflow.io') || currentDb[0];
    setCurrentUser(defaultGhUser);
    setIsAuthenticated(true);
    setCurrentView('hub');
    localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(defaultGhUser));
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
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(updatedDb));

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setCurrentView('hub');
    localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(newUser));

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.sessionUser);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('hub');
    setSearchQuery('');
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(user));
  };

  // Project Navigation & Actions
  const selectProject = (project: Project) => {
    setActiveProjectId(project.id);
    setCurrentView('workspace');
    setActiveTabState('dashboard');
    setSearchQuery('');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setSeverityFilter('all');
    setIssueStatusFilter('all');
  };

  const backToHub = () => {
    setCurrentView('hub');
    setSearchQuery('');
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const id = `p-${Date.now()}`;
    const newProj: Project = {
      ...projectData,
      id,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [newProj, ...prev]);
    setRepoSettingsMap(prev => ({
      ...prev,
      [id]: getDefaultRepoSettingsForProject(newProj)
    }));
    setActiveProjectId(id);
    setCurrentView('workspace');
    setActiveTabState('dashboard');
    setSearchQuery('');

    setActivities(prev => [{
      id: 'act-' + Date.now(),
      projectId: id,
      type: 'project_created',
      title: `created project "${newProj.name}"`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar
    }, ...prev]);
  };

  // Team Member Actions
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
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);

    if (activeProject) {
      setProjects(prev => prev.map(proj => {
        if (proj.id === activeProject.id) {
          if (proj.teamMembers.some(m => m.id === newUser.id)) return proj;
          return { ...proj, teamMembers: [...proj.teamMembers, newUser] };
        }
        return proj;
      }));
    }
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));

    setProjects(prevProjects => prevProjects.map(proj => ({
      ...proj,
      teamMembers: proj.teamMembers.map(m => m.id === userId ? { ...m, ...updates } : m)
    })));

    if (currentUser && currentUser.id === userId) {
      const updatedSession = { ...currentUser, ...updates };
      setCurrentUser(updatedSession);
      localStorage.setItem(STORAGE_KEYS.sessionUser, JSON.stringify(updatedSession));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));

    setProjects(prevProjects => prevProjects.map(proj => ({
      ...proj,
      teamMembers: proj.teamMembers.filter(m => m.id !== userId)
    })));
  };

  const removeMemberFromProject = (projectId: string, userId: string) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id === projectId) {
        return { ...proj, teamMembers: proj.teamMembers.filter(m => m.id !== userId) };
      }
      return proj;
    }));
  };

  // Module 1 Handlers
  const moveTaskStage = (taskId: string, newStage: TaskStage) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updated = { ...task, stage: newStage, updatedAt: new Date().toISOString() };
        const newAct: ActivityItem = {
          id: 'act-' + Date.now(),
          projectId: task.projectId,
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
      projectId: newTask.projectId,
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
      projectId: newIssue.projectId,
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
            projectId: issue.projectId,
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
      if (prev.some(b => b.projectId === activeProject.id && b.name === prData.sourceBranch)) return prev;
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
      projectId: activeProject.id,
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

    const projectRepoSettings = repoSettingsMap[pr.projectId] || repoSettings;

    // Automatically transition linked task & linked bug when autoSync is enabled
    if (projectRepoSettings.autoSync) {
      if (pr.linkedTaskId) {
        moveTaskStage(pr.linkedTaskId, 'done');
      }
      if (pr.linkedIssueId) {
        updateIssueStatus(pr.linkedIssueId, 'resolved');
      }
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
      projectId: pr.projectId,
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
    const branchName = commitData.branch || repoSettings.defaultBranch || 'main';
    const newCommit: Commit = {
      id: sha,
      projectId: activeProject.id,
      message: commitData.message,
      authorName: currentUser?.name || 'Meghana',
      authorEmail: currentUser?.email || 'meghana@devflow.io',
      authorAvatar: currentUser?.avatar || mockUsers[1].avatar,
      githubUsername: currentUser?.githubUsername || 'meghana_codes',
      branch: branchName,
      timestamp: 'Just now',
      additions: commitData.additions ?? Math.floor(Math.random() * 40) + 5,
      deletions: commitData.deletions ?? Math.floor(Math.random() * 10) + 1,
      linkedTaskId: commitData.linkedTaskId
    };

    setCommits(prev => [newCommit, ...prev]);

    setActivities(acts => [{
      id: 'act-' + Date.now(),
      projectId: activeProject.id,
      type: 'github_push',
      title: `pushed commit ${sha}: "${commitData.message}"`,
      timestamp: 'Just now',
      user: currentUser ? currentUser.name : 'Meghana',
      avatar: currentUser ? currentUser.avatar : mockUsers[1].avatar,
      details: `Branch: ${branchName}`
    }, ...acts]);

    setWebhookEvents(prev => [{
      id: `wh-${Date.now()}`,
      projectId: activeProject.id,
      event: 'push',
      action: 'created',
      sender: currentUser?.githubUsername || 'meghana_codes',
      senderAvatar: currentUser?.avatar || mockUsers[1].avatar,
      timestamp: 'Just now',
      summary: `Git push to ${branchName} (${sha}): "${commitData.message}"`,
      status: 'delivered',
      payload: {
        ref: `refs/heads/${branchName}`,
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
        branch: repoSettings.defaultBranch || 'main',
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
        summary: `GitHub Webhook Received: 1 commit pushed to ${repoSettings.defaultBranch || 'main'} (${sha})`,
        status: 'delivered',
        payload: {
          ref: `refs/heads/${repoSettings.defaultBranch || 'main'}`,
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
        targetBranch: repoSettings.defaultBranch || 'main',
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
      setWebhookEvents(prev => [{
        id: `wh-${Date.now()}`,
        projectId: activeProject.id,
        event: 'workflow_run',
        action: 'completed',
        sender: 'github-actions[bot]',
        senderAvatar: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=150&auto=format&fit=crop&q=80',
        timestamp: time,
        summary: 'GitHub Actions CI workflow "E2E Integration Tests" passed (14/14 suites green)',
        status: 'delivered',
        payload: {
          workflow: 'E2E Integration Tests',
          conclusion: 'success',
          duration_seconds: 62,
          branch: repoSettings.defaultBranch || 'main'
        }
      }, ...prev]);
    }
  };

  const updateProjectRepoSettings = useCallback((projectId: string, updater: (prev: RepoSettings) => RepoSettings) => {
    setRepoSettingsMap(prevMap => {
      const targetProj = projects.find(p => p.id === projectId) || activeProject;
      const base = prevMap[projectId] || getDefaultRepoSettingsForProject(targetProj);
      return {
        ...prevMap,
        [projectId]: updater(base)
      };
    });
  }, [projects, activeProject]);

  const syncRepoWithGitHub = useCallback(async (customUrl?: string, forceRefresh = true): Promise<void> => {
    const projectId = activeProject.id;
    const targetUrl = customUrl !== undefined ? customUrl : (activeProject.gitRepo || '');
    const hasPat = hasGitHubToken();

    if (!targetUrl.trim()) {
      updateProjectRepoSettings(projectId, prev => ({
        ...prev,
        connected: false,
        repoUrl: '',
        isLiveSync: false,
        patConfigured: hasPat,
        syncError: null,
        lastSyncedAt: 'No repository linked'
      }));
      return;
    }

    const parsed = parseGitHubRepo(targetUrl);
    if (!parsed) {
      updateProjectRepoSettings(projectId, prev => ({
        ...prev,
        connected: false,
        isLiveSync: false,
        patConfigured: hasPat,
        syncError: `Invalid repository URL "${targetUrl}". Expected https://github.com/owner/repo`,
        lastSyncedAt: 'Error parsing URL'
      }));
      return;
    }

    const { owner, repo } = parsed;
    setIsSyncingGitHub(true);
    updateProjectRepoSettings(projectId, prev => ({ ...prev, syncError: null, patConfigured: hasPat }));

    try {
      const [repoRes, commitsRes, branchesRes, pullsRes, rateLimitRes] = await Promise.allSettled([
        fetchGitHubRepoDetails(owner, repo, undefined, forceRefresh),
        fetchGitHubCommits(owner, repo, projectId, undefined, undefined, forceRefresh),
        fetchGitHubBranches(owner, repo, projectId, undefined, undefined, forceRefresh),
        fetchGitHubPullRequests(owner, repo, projectId, undefined, forceRefresh),
        checkRateLimit()
      ]);

      if (rateLimitRes.status === 'fulfilled' && rateLimitRes.value) {
        setGithubRateLimit(rateLimitRes.value);
      }

      if (repoRes.status === 'fulfilled') {
        const info = repoRes.value;
        updateProjectRepoSettings(projectId, prev => ({
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
          patConfigured: hasPat,
          isLiveSync: true,
          syncError: null,
          lastSyncedAt: 'Just now'
        }));
      } else {
        const reasonMsg = repoRes.reason instanceof Error
          ? repoRes.reason.message
          : 'Unable to reach repository on GitHub REST API.';
        updateProjectRepoSettings(projectId, prev => ({
          ...prev,
          connected: false,
          isLiveSync: false,
          patConfigured: hasPat,
          syncError: reasonMsg,
          lastSyncedAt: 'Sync error'
        }));
      }

      if (commitsRes.status === 'fulfilled' && commitsRes.value.length > 0) {
        const remote = commitsRes.value;
        setCommits(prev => {
          const other = prev.filter(c => c.projectId !== projectId);
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
          const other = prev.filter(b => b.projectId !== projectId);
          return [...branchesRes.value, ...other];
        });
      }

      if (pullsRes.status === 'fulfilled' && pullsRes.value.length > 0) {
        setPullRequests(prev => {
          const other = prev.filter(pr => pr.projectId !== projectId);
          return [...pullsRes.value, ...other];
        });
      }

      // Record live sync event when repo succeeded
      if (repoRes.status === 'fulfilled') {
        const fetchedCount = commitsRes.status === 'fulfilled' ? commitsRes.value.length : 0;
        setWebhookEvents(prev => [{
          id: `wh-${Date.now()}`,
          projectId,
          event: 'push',
          action: 'synchronized',
          sender: owner,
          senderAvatar: repoRes.value.ownerAvatar,
          timestamp: 'Just now',
          summary: `Synchronized telemetry with live GitHub repository ${owner}/${repo} (${fetchedCount} commits verified)`,
          status: 'delivered',
          payload: {
            action: 'synchronized',
            repository: `${owner}/${repo}`,
            commits_count: fetchedCount
          }
        }, ...prev]);
      }
    } catch (err: any) {
      updateProjectRepoSettings(projectId, prev => ({
        ...prev,
        connected: false,
        isLiveSync: false,
        syncError: err?.message || 'Error communicating with GitHub API',
        lastSyncedAt: 'Error'
      }));
    } finally {
      setIsSyncingGitHub(false);
    }
  }, [activeProject.id, activeProject.gitRepo, updateProjectRepoSettings]);

  const openPRDiff = async (pr: PullRequest) => {
    setSelectedPRForDiff(pr);
    setDiffError(null);

    if (!pr.isLive || pr.diffFiles.length > 0) {
      return;
    }

    const prRepoUrl = pr.htmlUrl ? pr.htmlUrl.split('/pull/')[0] : (activeProject.gitRepo || repoSettings.repoUrl);
    const parsed = parseGitHubRepo(prRepoUrl);
    if (!parsed) return;

    setIsLoadingDiff(true);
    try {
      const files = await fetchGitHubPullRequestFiles(parsed.owner, parsed.repo, pr.number);
      const updatedPR: PullRequest = {
        ...pr,
        diffFiles: files,
        changedFilesCount: files.length || pr.changedFilesCount
      };
      setSelectedPRForDiff(current => (current?.id === pr.id ? updatedPR : current));
      setPullRequests(prev => prev.map(p => (p.id === pr.id ? updatedPR : p)));
    } catch (err: any) {
      setDiffError(err?.message || 'Unable to load pull request diff from GitHub.');
    } finally {
      setIsLoadingDiff(false);
    }
  };

  const fetchUserRepos = useCallback(async (username = 'meghana922007', forceRefresh = false) => {
    const cleanUsername = username.trim().replace(/^@/, '') || 'meghana922007';
    setUserReposOwner(cleanUsername);
    setIsLoadingUserRepos(true);
    setUserReposError(null);
    try {
      const repos = await fetchUserPublicRepos(cleanUsername, undefined, forceRefresh);
      setUserPublicRepos(repos);
    } catch (err: any) {
      const staleCached = getCachedUserPublicRepos(cleanUsername);
      if (staleCached && staleCached.length > 0) {
        setUserPublicRepos(staleCached);
      } else if (cleanUsername.toLowerCase() === 'meghana922007') {
        setUserPublicRepos(VERIFIED_FALLBACK_REPOS);
      } else {
        setUserPublicRepos([]);
      }
      setUserReposError(err?.message || `Unable to fetch GitHub repositories for @${cleanUsername}.`);
    } finally {
      setIsLoadingUserRepos(false);
    }
  }, []);

  const switchGitRepo = async (newRepoUrl: string) => {
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, gitRepo: newRepoUrl } : p));
    await syncRepoWithGitHub(newRepoUrl, true);
  };

  const updateRepoSettings = (settings: Partial<RepoSettings>) => {
    updateProjectRepoSettings(activeProject.id, prev => ({ ...prev, ...settings }));
  };

  const saveGitHubPat = useCallback(async (token: string): Promise<void> => {
    const trimmed = token.trim();
    if (trimmed) {
      localStorage.setItem('devflow_github_pat', trimmed);
    } else {
      localStorage.removeItem('devflow_github_pat');
    }

    clearGitHubCache();

    setRepoSettingsMap(prevMap => {
      const next: Record<string, RepoSettings> = {};
      Object.keys(prevMap).forEach(pid => {
        next[pid] = {
          ...prevMap[pid],
          patConfigured: hasGitHubToken()
        };
      });
      return next;
    });

    await Promise.all([
      fetchUserRepos(userReposOwner, true),
      syncRepoWithGitHub(undefined, true)
    ]);
  }, [fetchUserRepos, syncRepoWithGitHub, userReposOwner]);

  const resetDemoData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.sessionUser) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
    setUsers(mockUsers);
    setProjects(mockProjects);
    setActiveProjectId(mockProjects[0].id);
    setTasks(initialTasks);
    setIssues(initialIssues);
    setActivities(mockActivities);
    setPullRequests(mockPullRequests);
    setCommits(mockCommits);
    setBranches(mockBranches);
    setWebhookEvents(mockWebhookEvents);
    setRepoSettingsMap(buildInitialRepoSettingsMap(mockProjects));
    setSearchQuery('');
  };

  // Load GitHub account repositories once authenticated (uses 15-min cache)
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchUserRepos('meghana922007', false);
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, fetchUserRepos]);

  // Sync active project repository on login/project switch (uses 15-min cache to avoid rate limits)
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      syncRepoWithGitHub(undefined, false);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [isAuthenticated, activeProject.id, syncRepoWithGitHub]);

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
      saveGitHubPat,
      isSyncingGitHub,
      githubRateLimit,
      userPublicRepos,
      userReposOwner,
      isLoadingUserRepos,
      userReposError,
      fetchUserRepos,
      switchGitRepo,
      selectedPRForDiff,
      setSelectedPRForDiff,
      openPRDiff,
      isLoadingDiff,
      diffError,
      isNewPRModalOpen,
      setIsNewPRModalOpen,
      preselectedPRSourceBranch,
      setPreselectedPRSourceBranch,
      isWebhookSimulatorOpen,
      setIsWebhookSimulatorOpen,
      isRepoSettingsModalOpen,
      setIsRepoSettingsModalOpen,
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
      setEditingUser,
      resetDemoData
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
