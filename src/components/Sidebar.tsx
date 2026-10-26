import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Kanban,
  Bug,
  Sparkles,
  FolderGit2,
  ArrowLeft,
  Users,
  Home,
  LogOut,
  ChevronUp,
  Plus,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeProject,
    projects,
    selectProject,
    backToHub,
    tasks,
    issues,
    pullRequests,
    workflowRuns,
    currentView,
    currentUser,
    logout,
    users,
    switchUser,
    setIsNewProjectModalOpen
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const projectTasks = tasks.filter(t => t.projectId === activeProject.id);
  const projectIssues = issues.filter(i => i.projectId === activeProject.id);
  const projectPRs = pullRequests.filter(p => p.projectId === activeProject.id);
  const runningPipelinesCount = workflowRuns.filter(r => (r.projectId === activeProject.id || !r.projectId) && r.status === 'in_progress').length;

  const openTasksCount = projectTasks.filter(t => t.stage !== 'done').length;
  const openBugsCount = projectIssues.filter(i => i.status !== 'closed' && i.status !== 'resolved').length;
  const openPRsCount = projectPRs.filter(p => p.status === 'open').length;

  return (
    <aside style={{
      width: '270px',
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      {/* DevFlow Logo & App Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 18px 8px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          backgroundColor: '#2b6777',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(43, 103, 119, 0.25)'
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            DevFlow
          </h1>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2b6777', letterSpacing: '0.06em' }}>
            {currentView === 'hub' ? 'ORGANIZATION HUB' : 'PROJECT WORKSPACE'}
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: Organization / Projects Hub Navigation */}
      {currentView === 'hub' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '18px' }}>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px 14px',
              fontSize: '0.84rem'
            }}
          >
            <Plus size={16} /> Create New Project
          </button>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#527982', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '8px', letterSpacing: '0.05em' }}>
              MAIN NAVIGATION
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#e2eff2',
                  color: '#2b6777',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                <Home size={18} />
                <span>All Projects Hub</span>
              </div>
            </nav>
          </div>

          {/* Quick Projects List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#527982', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '8px', letterSpacing: '0.05em' }}>
              WORKSPACES ({projects.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectProject(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f2f2f2';
                    e.currentTarget.style.borderColor = '#c8d8e4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color || '#2b6777', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#527982', backgroundColor: '#e2eff2', padding: '1px 6px', borderRadius: '4px' }}>
                    {p.key}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: Project Workspace Navigation */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
          {/* Back to Hub Button */}
          <button
            onClick={backToHub}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#f2f2f2',
              color: '#2b6777',
              border: '1px solid #c8d8e4',
              fontWeight: 700,
              fontSize: '0.82rem',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={15} /> Back to Projects Hub
          </button>

          {/* Active Project Card / Switcher */}
          <div style={{
            background: '#eef6f8',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            border: '1px solid #c8d8e4'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#527982', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
              CURRENT WORKSPACE
            </div>
            <select
              value={activeProject.id}
              onChange={(e) => {
                const p = projects.find(proj => proj.id === e.target.value);
                if (p) selectProject(p);
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #c8d8e4',
                backgroundColor: '#ffffff',
                color: '#1c3d44',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
              ))}
            </select>
          </div>

          {/* Clean Unified Project Tabs */}
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#527982', textTransform: 'uppercase', paddingLeft: '8px', marginTop: '4px', letterSpacing: '0.05em' }}>
            PROJECT SECTIONS
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
            {/* 1. Overview */}
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'dashboard' ? '#e2eff2' : 'transparent',
                color: activeTab === 'dashboard' ? '#2b6777' : 'var(--text-muted)',
                fontWeight: activeTab === 'dashboard' ? 700 : 500,
                fontSize: '0.88rem',
                border: '1px solid',
                borderColor: activeTab === 'dashboard' ? '#c8d8e4' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LayoutDashboard size={17} color={activeTab === 'dashboard' ? '#2b6777' : 'currentColor'} />
                <span>Overview & Health</span>
              </div>
            </button>

            {/* 2. Board & Tasks (Module 1) */}
            <button
              onClick={() => setActiveTab('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'kanban' ? '#e2eff2' : 'transparent',
                color: activeTab === 'kanban' ? '#2b6777' : 'var(--text-muted)',
                fontWeight: activeTab === 'kanban' ? 700 : 500,
                fontSize: '0.88rem',
                border: '1px solid',
                borderColor: activeTab === 'kanban' ? '#c8d8e4' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Kanban size={17} color={activeTab === 'kanban' ? '#2b6777' : 'currentColor'} />
                <span>Board & Tasks</span>
              </div>
              {openTasksCount > 0 && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: activeTab === 'kanban' ? '#2b6777' : '#f2f2f2',
                  color: activeTab === 'kanban' ? '#ffffff' : '#527982',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  {openTasksCount}
                </span>
              )}
            </button>

            {/* 3. Issue Tracker (Module 2) */}
            <button
              onClick={() => setActiveTab('issues')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'issues' ? '#e2eff2' : 'transparent',
                color: activeTab === 'issues' ? '#2b6777' : 'var(--text-muted)',
                fontWeight: activeTab === 'issues' ? 700 : 500,
                fontSize: '0.88rem',
                border: '1px solid',
                borderColor: activeTab === 'issues' ? '#c8d8e4' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bug size={17} color={activeTab === 'issues' ? '#2b6777' : 'currentColor'} />
                <span>Issue Tracker</span>
              </div>
              {openBugsCount > 0 && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: activeTab === 'issues' ? '#52ab98' : '#f2f2f2',
                  color: activeTab === 'issues' ? '#ffffff' : '#527982',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  {openBugsCount}
                </span>
              )}
            </button>

            {/* 4. GitHub & Code (Module 3) */}
            <button
              onClick={() => setActiveTab('github')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'github' ? '#e2eff2' : 'transparent',
                color: activeTab === 'github' ? '#2b6777' : 'var(--text-muted)',
                fontWeight: activeTab === 'github' ? 700 : 500,
                fontSize: '0.88rem',
                border: '1px solid',
                borderColor: activeTab === 'github' ? '#c8d8e4' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderGit2 size={17} color={activeTab === 'github' ? '#2b6777' : 'currentColor'} />
                <span>GitHub & Code</span>
              </div>
              {openPRsCount > 0 && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#52ab98',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  {openPRsCount} PRs
                </span>
              )}
            </button>

            {/* 5. CI/CD Pipelines (Module 4) */}
            <button
              onClick={() => setActiveTab('cicd')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'cicd' ? '#e2eff2' : 'transparent',
                color: activeTab === 'cicd' ? '#2b6777' : 'var(--text-muted)',
                fontWeight: activeTab === 'cicd' ? 700 : 500,
                fontSize: '0.88rem',
                border: '1px solid',
                borderColor: activeTab === 'cicd' ? '#c8d8e4' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={17} color={activeTab === 'cicd' ? '#2b6777' : 'currentColor'} />
                <span>CI/CD Pipelines</span>
              </div>
              {runningPipelinesCount > 0 ? (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#38bdf8',
                  color: '#0c4a6e',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
                  {runningPipelinesCount} live
                </span>
              ) : (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  backgroundColor: activeTab === 'cicd' ? '#2b6777' : '#f2f2f2',
                  color: activeTab === 'cicd' ? '#ffffff' : '#527982',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  M4
                </span>
              )}
            </button>

            {/* 6. Team & Settings */}
            <button
              onClick={() => setActiveTab('team')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === 'team' ? '#e2eff2' : 'transparent',
                color: activeTab === 'team' ? '#2b6777' : 'var(--text-muted)',
                fontWeight: activeTab === 'team' ? 700 : 500,
                fontSize: '0.88rem',
                border: '1px solid',
                borderColor: activeTab === 'team' ? '#c8d8e4' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={17} color={activeTab === 'team' ? '#2b6777' : 'currentColor'} />
                <span>Team & Settings</span>
              </div>
            </button>
          </nav>
        </div>
      )}

      {/* Footer Profile & Switcher */}
      <div style={{ position: 'relative', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        {showUserMenu && (
          <div className="pastel-card animate-modal-pop" style={{
            position: 'absolute',
            bottom: '105%',
            left: 0,
            right: 0,
            padding: '14px',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#527982', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SWITCH ACCOUNT (DB USERS):
            </div>

            {users.map(u => (
              <button
                key={u.id}
                onClick={() => { switchUser(u); setShowUserMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: currentUser?.id === u.id ? '#e2eff2' : 'transparent',
                  fontSize: '0.78rem',
                  textAlign: 'left'
                }}
              >
                <img src={u.avatar} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: '#1c3d44' }}>{u.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#527982' }}>{u.role}</div>
                </div>
                {currentUser?.id === u.id && <CheckCircle2 size={14} color="#2b6777" />}
              </button>
            ))}

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
              <button
                onClick={() => { logout(); setShowUserMenu(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  color: '#881337',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        )}

        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#f2f2f2',
            border: '1px solid #c8d8e4',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt=""
              style={{ width: '30px', height: '30px', borderRadius: '50%' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1c3d44', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Developer'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#2b6777', fontWeight: 600 }}>
                @{currentUser?.githubUsername || 'guest'}
              </div>
            </div>
          </div>

          <ChevronUp size={16} color="#527982" />
        </div>
      </div>
    </aside>
  );
};
