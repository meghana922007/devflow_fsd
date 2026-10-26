import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Bug,
  LogOut,
  ChevronDown,
  GitPullRequest,
  UserPlus
} from 'lucide-react';
import { mockUsers } from '../data/mockData';

export const Header: React.FC = () => {
  const {
    activeProject,
    searchQuery,
    setSearchQuery,
    setIsTaskModalOpen,
    setEditingTask,
    setIsIssueModalOpen,
    setEditingIssue,
    setIsNewPRModalOpen,
    setIsNewProjectModalOpen,
    setIsUserModalOpen,
    setEditingUser,
    activeTab,
    currentView,
    currentUser,
    logout,
    switchUser,
    users
  } = useApp();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleContextAction = () => {
    if (currentView === 'hub') {
      setIsNewProjectModalOpen(true);
    } else if (activeTab === 'kanban' || activeTab === 'dashboard') {
      setEditingTask(null);
      setIsTaskModalOpen(true);
    } else if (activeTab === 'issues') {
      setEditingIssue(null);
      setIsIssueModalOpen(true);
    } else if (activeTab === 'github') {
      setIsNewPRModalOpen(true);
    } else if (activeTab === 'team') {
      setEditingUser(null);
      setIsUserModalOpen(true);
    }
  };

  const getActionButton = () => {
    if (currentView === 'hub') {
      return (
        <button onClick={handleContextAction} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.7rem' }}>
          <Plus size={14} /> NEW PROJECT
        </button>
      );
    }
    if (activeTab === 'kanban' || activeTab === 'dashboard') {
      return (
        <button onClick={handleContextAction} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.7rem' }}>
          <Plus size={14} /> NEW TASK
        </button>
      );
    }
    if (activeTab === 'issues') {
      return (
        <button
          onClick={handleContextAction}
          className="btn-primary"
          style={{
            padding: '7px 16px', fontSize: '0.7rem',
            background: '#ff2d55',
            boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.35), inset 3px 3px 0 rgba(255,255,255,0.2), 0 0 14px rgba(255,45,85,0.45)',
          }}
        >
          <Bug size={14} /> REPORT BUG
        </button>
      );
    }
    if (activeTab === 'github') {
      return (
        <button onClick={handleContextAction} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.7rem' }}>
          <GitPullRequest size={14} /> NEW PR
        </button>
      );
    }
    if (activeTab === 'team') {
      return (
        <button onClick={handleContextAction} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.7rem' }}>
          <UserPlus size={14} /> ADD ENG
        </button>
      );
    }
    return null;
  };

  const getSearchPlaceholder = () => {
    if (currentView === 'hub') return '> search projects...';
    if (activeTab === 'kanban') return '> search tasks...';
    if (activeTab === 'issues') return '> search bugs...';
    if (activeTab === 'github') return '> search PRs, commits...';
    return '> search workspace...';
  };

  return (
    <header style={{
      height: '60px',
      backgroundColor: '#080b16',
      borderBottom: '1px solid rgba(0,245,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 15,
      gap: '16px',
    }}>

      {/* ── Left: Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {currentView === 'hub' ? (
          <h2 style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.6rem',
            color: '#00f5ff',
            letterSpacing: '0.04em',
            textShadow: '0 0 10px rgba(0,245,255,0.5)',
            whiteSpace: 'nowrap',
          }}>
            ORG HUB
          </h2>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.48rem',
              color: '#000',
              background: '#00f5ff',
              padding: '3px 8px',
              letterSpacing: '0.02em',
              boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.25), 0 0 8px rgba(0,245,255,0.35)',
            }}>
              {activeProject.key}
            </span>
            <span style={{ color: '#2a4a5a', fontSize: '0.85rem' }}>/</span>
            <h2 style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#e8f4fd',
              whiteSpace: 'nowrap',
            }}>
              {activeTab === 'dashboard' && 'Overview'}
              {activeTab === 'kanban' && 'Board & Tasks'}
              {activeTab === 'issues' && 'Issue Tracker'}
              {activeTab === 'github' && 'GitHub Integration'}
              {activeTab === 'team' && 'Team & Workspace'}
              {activeTab === 'cicd' && 'CI/CD Pipelines'}
            </h2>
          </div>
        )}
      </div>

      {/* ── Middle: Search ── */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
        <Search
          size={14}
          color="#2a4a5a"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 14px 8px 34px',
            background: '#0a0e1a',
            border: '1px solid rgba(0,245,255,0.18)',
            color: '#e8f4fd',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.82rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            borderRadius: '2px',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(0,245,255,0.6)';
            e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(0,245,255,0.18)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* ── Right: Action button + User ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {getActionButton()}

        {/* User dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,245,255,0.05)',
              border: '1px solid rgba(0,245,255,0.2)',
              padding: '5px 10px 5px 6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,245,255,0.45)';
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,245,255,0.09)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,245,255,0.2)';
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,245,255,0.05)';
            }}
          >
            <img
              src={currentUser?.avatar || mockUsers[1].avatar}
              alt=""
              style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(0,245,255,0.3)' }}
            />
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#e8f4fd',
            }}>
              {currentUser?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={13} color="#2a4a5a" />
          </div>

          {showDropdown && (
            <div
              className="animate-modal-pop"
              style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                width: '220px',
                background: '#080b16',
                border: '1px solid rgba(0,245,255,0.25)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 0 20px rgba(0,245,255,0.06)',
                zIndex: 50,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {/* Current user info */}
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.4rem',
                color: '#2a4a5a',
                letterSpacing: '0.05em',
                marginBottom: '2px',
              }}>
                LOGGED IN AS:
              </div>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#e8f4fd',
              }}>
                {currentUser?.name}
              </div>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.72rem',
                color: '#00f5ff',
                marginBottom: '4px',
              }}>
                @{currentUser?.githubUsername} &bull; {currentUser?.role}
              </div>

              <div style={{ borderTop: '1px solid rgba(0,245,255,0.1)', paddingTop: '8px' }}>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.4rem',
                  color: '#2a4a5a',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}>
                  SWITCH USER:
                </div>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { switchUser(u); setShowDropdown(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 8px',
                      width: '100%',
                      background: currentUser?.id === u.id ? 'rgba(0,245,255,0.08)' : 'transparent',
                      border: currentUser?.id === u.id ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent',
                      color: currentUser?.id === u.id ? '#00f5ff' : '#4a7c8e',
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: '0.76rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (currentUser?.id !== u.id) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#e8f4fd';
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentUser?.id !== u.id) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#4a7c8e';
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <img src={u.avatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid rgba(0,245,255,0.2)' }} />
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(0,245,255,0.1)', paddingTop: '8px', marginTop: '2px' }}>
                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 8px',
                    color: '#ff2d55',
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '0.78rem',
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
        </div>
      </div>
    </header>
  );
};
