import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { hasGitHubToken, type UserPublicRepo } from '../../services/githubService';
import {
  Plus,
  Search,
  FolderGit2,
  Kanban,
  Bug,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ListTodo,
  GitPullRequest,
  ExternalLink,
  Star,
  GitBranch,
  RefreshCw,
  AlertCircle,
  KeyRound
} from 'lucide-react';

export const ProjectsHub: React.FC = () => {
  const {
    projects,
    selectProject,
    addProject,
    tasks,
    issues,
    pullRequests,
    users,
    currentUser,
    repoSettings,
    setIsNewProjectModalOpen,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    userPublicRepos,
    userReposOwner,
    isLoadingUserRepos,
    userReposError,
    fetchUserRepos,
    saveGitHubPat
  } = useApp();

  const [githubUserInput, setGithubUserInput] = useState(userReposOwner || 'meghana922007');
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  const [patInput, setPatInput] = useState(() => localStorage.getItem('devflow_github_pat') || '');
  const [isSavingPat, setIsSavingPat] = useState(false);
  const patConfigured = repoSettings.patConfigured || hasGitHubToken();

  const filteredProjects = projects.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  const filteredGithubRepos = userPublicRepos.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.fullName.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.language || '').toLowerCase().includes(q)
    );
  });

  // Cross-project work assigned to currentUser
  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id && t.stage !== 'done');
  const myIssues = issues.filter(i => i.assigneeId === currentUser?.id && i.status !== 'closed' && i.status !== 'resolved');
  const myPRs = pullRequests.filter(pr => pr.authorId === currentUser?.id && pr.status === 'open');

  const handleOpenProjectWithTab = (projectId: string, tab: 'kanban' | 'issues' | 'github') => {
    const p = projects.find(proj => proj.id === projectId);
    if (p) {
      selectProject(p);
      setActiveTab(tab);
    }
  };

  const handleLoadGithubAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = githubUserInput.trim().replace(/^@/, '');
    if (!clean) return;
    fetchUserRepos(clean, true);
  };

  const handleSavePat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPat(true);
    try {
      await saveGitHubPat(patInput);
      setShowTokenPanel(false);
    } finally {
      setIsSavingPat(false);
    }
  };

  const handleClearPat = async () => {
    setPatInput('');
    setIsSavingPat(true);
    try {
      await saveGitHubPat('');
      setShowTokenPanel(false);
    } finally {
      setIsSavingPat(false);
    }
  };

  const handleImportGithubRepo = (repo: UserPublicRepo) => {
    const normalizedUrl = repo.htmlUrl.replace(/\/$/, '').toLowerCase();
    const existing = projects.find(
      p => p.gitRepo && p.gitRepo.replace(/\/$/, '').toLowerCase() === normalizedUrl
    );
    if (existing) {
      selectProject(existing);
      return;
    }

    const cleanKey = (repo.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4) || 'GH').toUpperCase();
    addProject({
      name: repo.name,
      key: cleanKey,
      description: repo.description || `GitHub repository ${repo.fullName}`,
      color: '#2b6777',
      gitRepo: repo.htmlUrl,
      teamMembers: currentUser ? [currentUser] : users.slice(0, 1)
    });
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Welcome Banner */}
      <div style={{
        backgroundColor: '#2b6777',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        color: '#ffffff',
        boxShadow: '0 12px 32px rgba(43, 103, 119, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ zIndex: 2, maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}>
            <Sparkles size={14} /> CENTRAL ORGANIZATION WORKSPACE
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.15, marginBottom: '10px' }}>
            Welcome back, {currentUser?.name || 'Developer'}
          </h1>

          <p style={{ fontSize: '0.92rem', opacity: 0.92, lineHeight: 1.55 }}>
            Access all engineering workspaces, monitor tasks, track defect lifecycles, and synchronize code changes across repositories from one unified portal.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '18px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#ffffff' }}>{projects.length}</strong>
              <span style={{ opacity: 0.85 }}>Active Workspaces</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ backgroundColor: '#ffffff', color: '#2b6777', padding: '1px 8px', borderRadius: 'var(--radius-pill)' }}>
                {myTasks.length}
              </strong>
              <span style={{ opacity: 0.85 }}>Tasks Assigned to You</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#ffffff' }}>{myPRs.length}</strong>
              <span style={{ opacity: 0.85 }}>Open PRs</span>
            </div>
            <span>•</span>
            <button
              type="button"
              onClick={() => document.getElementById('github-repositories-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <FolderGit2 size={13} />
              <span>{userPublicRepos.length} GitHub Projects ↓</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          style={{
            zIndex: 2,
            backgroundColor: '#ffffff',
            color: '#2b6777',
            padding: '13px 26px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 800,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} />
          Create New Project
        </button>
      </div>

      {/* SECTION 1: My Assigned Work (Cross-Project Telemetry) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListTodo size={18} color="#2b6777" /> My Active Work Items ({myTasks.length + myIssues.length})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Tasks, bug reports, and PRs assigned to @{currentUser?.githubUsername || 'you'} across all workspaces.
            </p>
          </div>
        </div>

        {myTasks.length === 0 && myIssues.length === 0 ? (
          <div className="pastel-card" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <CheckCircle2 size={28} color="#52ab98" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1c3d44' }}>
              All Caught Up!
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              You have no active pending tasks or blockers assigned right now.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '14px'
          }}>
            {myTasks.map(task => {
              const proj = projects.find(p => p.id === task.projectId);
              return (
                <div
                  key={task.id}
                  className="pastel-card animate-fade-in"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #2b6777'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: '#e2eff2',
                        color: '#2b6777',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {proj?.key || 'DEV'} • {task.id}
                      </span>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: task.stage === 'in_progress' ? '#eef6f8' : '#f2f2f2',
                        color: task.stage === 'in_progress' ? '#2b6777' : '#527982',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        textTransform: 'uppercase'
                      }}>
                        {task.stage.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c3d44', lineHeight: 1.3 }}>
                      {task.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Project: <strong>{proj?.name}</strong>
                    </span>

                    <button
                      onClick={() => handleOpenProjectWithTab(task.projectId, 'kanban')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#2b6777'
                      }}
                    >
                      Open Board <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {myIssues.map(issue => {
              const proj = projects.find(p => p.id === issue.projectId);
              return (
                <div
                  key={issue.id}
                  className="pastel-card animate-fade-in"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #52ab98'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: '#e6f6f3',
                        color: '#52ab98',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {proj?.key || 'DEV'} • {issue.id}
                      </span>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#f2f2f2',
                        color: '#881337',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        textTransform: 'uppercase'
                      }}>
                        {issue.severity}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c3d44', lineHeight: 1.3 }}>
                      {issue.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Project: <strong>{proj?.name}</strong>
                    </span>

                    <button
                      onClick={() => handleOpenProjectWithTab(issue.projectId, 'issues')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#52ab98'
                      }}
                    >
                      View Issue <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: All Active Projects Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              All Engineering Workspaces ({filteredProjects.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Select a project to launch its dedicated Kanban board, issue telemetry, and GitHub sync pipeline.
            </p>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search projects & GitHub repos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 36px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#f2f2f2',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {filteredProjects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const projectIssues = issues.filter(i => i.projectId === project.id);
            const projectPRs = pullRequests.filter(pr => pr.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.stage === 'done').length;
            const openBugs = projectIssues.filter(i => i.status !== 'closed' && i.status !== 'resolved').length;
            const progressPercent = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                className="pastel-card animate-fade-in"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${project.color || '#2b6777'}`,
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: '#e2eff2',
                        color: '#2b6777',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid #c8d8e4'
                      }}>
                        {project.key}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {project.name}
                      </h3>
                    </div>

                    {project.gitRepo && (
                      <a
                        href={project.gitRepo}
                        target="_blank"
                        rel="noreferrer"
                        title="View GitHub Repository"
                        style={{ color: '#2b6777', display: 'flex', alignItems: 'center' }}
                      >
                        <FolderGit2 size={18} />
                      </a>
                    )}
                  </div>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-main)' }}>Task Velocity</span>
                      <span style={{ color: '#2b6777' }}>{progressPercent}% Done</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f2f2f2', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor: '#2b6777',
                        borderRadius: 'var(--radius-pill)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      backgroundColor: '#e2eff2',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#2b6777'
                    }}>
                      <Kanban size={13} />
                      <span>{completedTasks}/{projectTasks.length} Tasks Done</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      backgroundColor: openBugs > 0 ? '#fbecee' : '#e6f6f3',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: openBugs > 0 ? '#881337' : '#52ab98'
                    }}>
                      <Bug size={13} />
                      <span>{openBugs} Open Bugs</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      backgroundColor: '#f2f2f2',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#1c3d44'
                    }}>
                      <GitPullRequest size={13} />
                      <span>{projectPRs.filter(p => p.status === 'open').length} Open PRs</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Team & Enter Workspace Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  marginTop: '10px'
                }}>
                  {/* Team Avatars */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {project.teamMembers.map((member, i) => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        title={`${member.name} (@${member.githubUsername})`}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          marginLeft: i > 0 ? '-8px' : 0,
                          objectFit: 'cover'
                        }}
                      />
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: '8px' }}>
                      {project.teamMembers.length} devs
                    </span>
                  </div>

                  <button
                    onClick={() => selectProject(project)}
                    className="btn-primary"
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.84rem'
                    }}
                  >
                    Open Workspace <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: All GitHub Repositories Directory */}
      <div id="github-repositories-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderGit2 size={18} color="#2b6777" />
              All GitHub Repositories for @{userReposOwner} ({filteredGithubRepos.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Browse all live repositories on GitHub, open them directly, or import any repository into a DevFlow workspace.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <form onSubmit={handleLoadGithubAccount} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="text"
                placeholder="GitHub username..."
                value={githubUserInput}
                onChange={(e) => setGithubUserInput(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#f2f2f2',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  width: '180px'
                }}
              />
              <button
                type="submit"
                disabled={isLoadingUserRepos}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={13} style={{ animation: isLoadingUserRepos ? 'spin 1s linear infinite' : 'none' }} />
                {isLoadingUserRepos ? 'Loading...' : 'Load Repos'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowTokenPanel(prev => !prev)}
              className="btn-secondary"
              style={{
                padding: '7px 14px',
                fontSize: '0.8rem',
                backgroundColor: patConfigured ? '#e6f6f3' : undefined,
                color: patConfigured ? '#195239' : undefined,
                borderColor: patConfigured ? '#52ab98' : undefined
              }}
            >
              <KeyRound size={13} />
              {patConfigured ? 'Token Active (5,000/hr)' : 'Add API Token'}
            </button>

            <a
              href={`https://github.com/${encodeURIComponent(userReposOwner)}?tab=repositories`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{
                padding: '7px 14px',
                fontSize: '0.8rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Open All on GitHub <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {userReposError && (
          <div style={{
            backgroundColor: '#fcedea',
            border: '1px solid #e57373',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            color: '#8a2b2b',
            fontSize: '0.84rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 320px' }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 700 }}>{userReposError}</span>
                {userPublicRepos.length > 0 && (
                  <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                    Showing cached/verified starter repositories below so you can continue browsing and importing projects.
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowTokenPanel(true)}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <KeyRound size={13} /> {patConfigured ? 'Update GitHub Token' : 'Add GitHub Token'}
              </button>
              <button
                type="button"
                onClick={() => fetchUserRepos(userReposOwner, true)}
                disabled={isLoadingUserRepos}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {showTokenPanel && (
          <form
            onSubmit={handleSavePat}
            className="animate-fade-in"
            style={{
              backgroundColor: '#e2eff2',
              border: '1px solid #c8d8e4',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1c3d44', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={15} color="#2b6777" /> GitHub Personal Access Token (60 → 5,000 req/hr)
                </div>
                <p style={{ fontSize: '0.78rem', color: '#527982', marginTop: '2px' }}>
                  Generate a fine-grained or classic token on GitHub (public repo read access requires no special scopes) and paste it here. Stored locally in your browser.
                </p>
              </div>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b6777', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Generate Token on GitHub <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="password"
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                placeholder="Paste ghp_... or github_pat_..."
                style={{
                  flex: '1 1 280px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #c8d8e4',
                  backgroundColor: '#ffffff',
                  fontSize: '0.84rem',
                  fontFamily: 'monospace',
                  color: '#1c3d44',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isSavingPat || !patInput.trim()}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                {isSavingPat ? 'Saving...' : 'Save Token & Retry'}
              </button>
              {patConfigured && (
                <button
                  type="button"
                  onClick={handleClearPat}
                  disabled={isSavingPat}
                  className="btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                >
                  Remove Token
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowTokenPanel(false)}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </form>
        )}

        {isLoadingUserRepos && userPublicRepos.length === 0 ? (
          <div className="pastel-card" style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <RefreshCw size={26} color="#2b6777" style={{ margin: '0 auto 10px auto', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1c3d44' }}>
              Fetching repositories from GitHub for @{userReposOwner}...
            </div>
          </div>
        ) : filteredGithubRepos.length === 0 ? (
          <div className="pastel-card" style={{ padding: '32px 24px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <FolderGit2 size={32} color="#c8d8e4" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {searchQuery.trim() ? 'No GitHub repositories match your search' : `No public repositories loaded for @${userReposOwner}`}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {searchQuery.trim()
                ? 'Try clearing your search filter or load another GitHub username.'
                : 'Enter a GitHub username above or open your repositories directly on GitHub.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px'
          }}>
            {filteredGithubRepos.map(repo => {
              const normalizedUrl = repo.htmlUrl.replace(/\/$/, '').toLowerCase();
              const linkedProject = projects.find(
                p => p.gitRepo && p.gitRepo.replace(/\/$/, '').toLowerCase() === normalizedUrl
              );

              return (
                <div
                  key={repo.fullName}
                  className="pastel-card animate-fade-in"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    backgroundColor: '#ffffff',
                    border: linkedProject ? '1px solid #52ab98' : '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <FolderGit2 size={17} color="#2b6777" style={{ flexShrink: 0 }} />
                        <h4 style={{
                          fontSize: '1.02rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {repo.name}
                        </h4>
                      </div>

                      {linkedProject && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: '#e6f6f3',
                          color: '#195239',
                          border: '1px solid #52ab98',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          flexShrink: 0
                        }}>
                          In Workspace ({linkedProject.key})
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
                      marginBottom: '12px',
                      minHeight: '36px'
                    }}>
                      {repo.description || 'No description provided on GitHub.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {repo.language && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#e2eff2',
                          color: '#2b6777',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)'
                        }}>
                          {repo.language}
                        </span>
                      )}

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#f2f2f2',
                        color: '#1c3d44',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)'
                      }}>
                        <GitBranch size={11} color="#2b6777" /> {repo.defaultBranch}
                      </span>

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#f2f2f2',
                        color: '#527982',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)'
                      }}>
                        <Star size={11} color="#2b6777" /> {repo.stars}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px',
                    gap: '10px'
                  }}>
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#2b6777',
                        textDecoration: 'none'
                      }}
                    >
                      GitHub <ExternalLink size={12} />
                    </a>

                    {linkedProject ? (
                      <button
                        type="button"
                        onClick={() => selectProject(linkedProject)}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        Open Workspace <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImportGithubRepo(repo)}
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        <Plus size={13} /> Import Project
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
