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

  // Shared nav button style factory
  const navBtn = (tab: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderLeft: `3px solid ${activeTab === tab ? '#00f5ff' : 'transparent'}`,
    background: activeTab === tab
      ? 'rgba(0,245,255,0.07)'
      : 'transparent',
    color: activeTab === tab ? '#00f5ff' : '#4a7c8e',
    fontFamily: "'Share Tech Mono', monospace",
    fontWeight: 600,
    fontSize: '0.82rem',
    textAlign: 'left',
    transition: 'all 0.12s ease',
    cursor: 'pointer',
    boxShadow: activeTab === tab ? 'inset 0 0 14px rgba(0,245,255,0.05)' : 'none',
  });

  // Score badge style
  const scoreBadge = (color: string): React.CSSProperties => ({
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '0.45rem',
    color,
    background: `rgba(${color === '#00f5ff' ? '0,245,255' : color === '#ff2d55' ? '255,45,85' : color === '#39ff14' ? '57,255,20' : '255,183,0'},0.12)`,
    border: `1px solid ${color}`,
    padding: '2px 6px',
    letterSpacing: '0.02em',
  });

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#080b16',
      borderRight: '1px solid rgba(0,245,255,0.12)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>

      {/* ===== LOGO / TITLE ===== */}
      <div style={{
        padding: '22px 16px 18px',
        borderBottom: '1px solid rgba(0,245,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'rgba(0,245,255,0.08)',
          border: '2px solid rgba(0,245,255,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(0,245,255,0.18)',
          flexShrink: 0,
        }}>
          <Sparkles size={18} color="#00f5ff" />
        </div>
        <div>
          <h1 style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.75rem',
            color: '#00f5ff',
            lineHeight: 1.3,
            textShadow: '0 0 10px rgba(0,245,255,0.6)',
          }}>
            DEVFLOW
          </h1>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.62rem',
            color: '#2a4a5a',
            marginTop: '3px',
            letterSpacing: '0.06em',
          }}>
            {currentView === 'hub' ? '// ORG HUB' : '// PROJECT WS'}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0' }}>

        {currentView === 'hub' ? (
          /* ── Hub view ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* New Project button */}
            <div style={{ padding: '0 12px' }}>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '9px 12px', fontSize: '0.7rem' }}
              >
                <Plus size={14} /> NEW PROJECT
              </button>
            </div>

            {/* Nav: All Projects Hub */}
            <div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.42rem',
                color: '#2a4a5a',
                padding: '0 16px',
                marginBottom: '6px',
                letterSpacing: '0.06em',
              }}>
                ── NAVIGATION ──
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px',
                borderLeft: '3px solid #00f5ff',
                background: 'rgba(0,245,255,0.07)',
                color: '#00f5ff',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.82rem',
                fontWeight: 600,
              }}>
                <Home size={16} />
                <span>All Projects Hub</span>
              </div>
            </div>

            {/* Project list */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.42rem',
                color: '#2a4a5a',
                padding: '0 16px',
                marginBottom: '6px',
                letterSpacing: '0.06em',
              }}>
                ── WORKSPACES ({projects.length}) ──
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectProject(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 16px',
                      background: 'transparent',
                      color: '#4a7c8e',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      borderLeft: '3px solid transparent',
                      transition: 'all 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#00f5ff';
                      e.currentTarget.style.borderLeftColor = 'rgba(0,245,255,0.4)';
                      e.currentTarget.style.background = 'rgba(0,245,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4a7c8e';
                      e.currentTarget.style.borderLeftColor = 'transparent';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <div style={{ width: '6px', height: '6px', background: p.color || '#00f5ff', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    </div>
                    <span style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.42rem',
                      color: '#2a4a5a',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '2px 5px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {p.key}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Project workspace view ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Back button */}
            <div style={{ padding: '0 12px' }}>
              <button
                onClick={backToHub}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px',
                  background: 'rgba(0,245,255,0.04)',
                  border: '1px solid rgba(0,245,255,0.2)',
                  color: '#4a7c8e',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.75rem',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#00f5ff'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4a7c8e'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)'; }}
              >
                <ArrowLeft size={13} /> BACK TO HUB
              </button>
            </div>

            {/* Project selector */}
            <div style={{ padding: '0 12px' }}>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.4rem',
                color: '#2a4a5a',
                marginBottom: '6px',
                letterSpacing: '0.06em',
              }}>
                ACTIVE WORKSPACE:
              </div>
              <select
                value={activeProject.id}
                onChange={(e) => {
                  const p = projects.find(proj => proj.id === e.target.value);
                  if (p) selectProject(p);
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#080b16',
                  border: '1px solid rgba(0,245,255,0.25)',
                  color: '#00f5ff',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
                ))}
              </select>
            </div>

            {/* Section label */}
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.42em',
              color: '#2a4a5a',
              padding: '4px 16px',
              letterSpacing: '0.06em',
            }}>
              ── SECTIONS ──
            </div>

            {/* Nav items */}
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Overview */}
              <button onClick={() => setActiveTab('dashboard')} style={navBtn('dashboard')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LayoutDashboard size={15} />
                  <span>Overview</span>
                </div>
              </button>

              {/* Board & Tasks */}
              <button onClick={() => setActiveTab('kanban')} style={navBtn('kanban')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Kanban size={15} />
                  <span>Board &amp; Tasks</span>
                </div>
                {openTasksCount > 0 && (
                  <span style={scoreBadge('#00f5ff')}>{openTasksCount}</span>
                )}
              </button>

              {/* Issue Tracker */}
              <button onClick={() => setActiveTab('issues')} style={navBtn('issues')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bug size={15} />
                  <span>Issue Tracker</span>
                </div>
                {openBugsCount > 0 && (
                  <span style={scoreBadge('#ff2d55')}>{openBugsCount}</span>
                )}
              </button>

              {/* GitHub & Code */}
              <button onClick={() => setActiveTab('github')} style={navBtn('github')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FolderGit2 size={15} />
                  <span>GitHub &amp; Code</span>
                </div>
                {openPRsCount > 0 && (
                  <span style={scoreBadge('#39ff14')}>{openPRsCount} PR</span>
                )}
              </button>

              {/* CI/CD Pipelines */}
              <button onClick={() => setActiveTab('cicd')} style={navBtn('cicd')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Cpu size={15} />
                  <span>CI/CD Pipelines</span>
                </div>
                {runningPipelinesCount > 0 ? (
                  <span style={scoreBadge('#39ff14')}>{runningPipelinesCount} LIVE</span>
                ) : (
                  <span style={scoreBadge('#ffb700')}>M4</span>
                )}
              </button>

              {/* Team & Settings */}
              <button onClick={() => setActiveTab('team')} style={navBtn('team')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={15} />
                  <span>Team &amp; Settings</span>
                </div>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* ===== USER PROFILE FOOTER ===== */}
      <div style={{
        borderTop: '1px solid rgba(0,245,255,0.1)',
        padding: '12px',
        position: 'relative',
      }}>
        {/* User switcher popup */}
        {showUserMenu && (
          <div
            className="animate-modal-pop"
            style={{
              position: 'absolute',
              bottom: '110%',
              left: '12px',
              right: '12px',
              background: '#080b16',
              border: '1px solid rgba(0,245,255,0.25)',
              boxShadow: '0 0 30px rgba(0,0,0,0.6), 0 0 20px rgba(0,245,255,0.08)',
              zIndex: 50,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.42rem',
              color: '#2a4a5a',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}>
              SWITCH ACCOUNT:
            </div>

            {users.map(u => (
              <button
                key={u.id}
                onClick={() => { switchUser(u); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 8px',
                  background: currentUser?.id === u.id ? 'rgba(0,245,255,0.08)' : 'transparent',
                  border: currentUser?.id === u.id ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent',
                  color: currentUser?.id === u.id ? '#00f5ff' : '#4a7c8e',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.76rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                <img src={u.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid rgba(0,245,255,0.2)' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{u.role}</div>
                </div>
                {currentUser?.id === u.id && <CheckCircle2 size={13} color="#00f5ff" />}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(0,245,255,0.1)', paddingTop: '8px', marginTop: '2px' }}>
              <button
                onClick={() => { logout(); setShowUserMenu(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 8px',
                  color: '#ff2d55',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: 'rgba(255,45,85,0.06)',
                  border: '1px solid rgba(255,45,85,0.2)',
                  transition: 'all 0.1s ease',
                }}
              >
                <LogOut size={13} /> LOG OUT
              </button>
            </div>
          </div>
        )}

        {/* Profile row */}
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px',
            background: 'rgba(0,245,255,0.04)',
            border: '1px solid rgba(0,245,255,0.15)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,245,255,0.35)';
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,245,255,0.07)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,245,255,0.15)';
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,245,255,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt=""
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(0,245,255,0.3)', flexShrink: 0 }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#e8f4fd',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {currentUser?.name || 'Developer'}
              </div>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.65rem',
                color: '#00f5ff',
              }}>
                @{currentUser?.githubUsername || 'guest'}
              </div>
            </div>
          </div>
          <ChevronUp size={14} color="#2a4a5a" />
        </div>
      </div>
    </aside>
  );
};
