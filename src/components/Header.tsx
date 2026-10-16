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
        <button
          onClick={handleContextAction}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> New Project
        </button>
      );
    }

    if (activeTab === 'kanban' || activeTab === 'dashboard') {
      return (
        <button
          onClick={handleContextAction}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> New Task
        </button>
      );
    }

    if (activeTab === 'issues') {
      return (
        <button
          onClick={handleContextAction}
          className="btn-primary"
          style={{
            backgroundColor: '#52ab98',
            boxShadow: '0 4px 14px rgba(82, 171, 152, 0.25)',
            padding: '8px 18px',
            fontSize: '0.85rem'
          }}
        >
          <Bug size={16} /> Report Bug
        </button>
      );
    }

    if (activeTab === 'github') {
      return (
        <button
          onClick={handleContextAction}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <GitPullRequest size={15} /> New Pull Request
        </button>
      );
    }

    if (activeTab === 'team') {
      return (
        <button
          onClick={handleContextAction}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <UserPlus size={15} /> Add Engineer
        </button>
      );
    }

    return null;
  };

  const getSearchPlaceholder = () => {
    if (currentView === 'hub') return 'Search projects by name, key, description...';
    if (activeTab === 'kanban') return 'Search tasks by title, tag, priority...';
    if (activeTab === 'issues') return 'Search bug reports by title, severity...';
    if (activeTab === 'github') return 'Search PRs, branches, commits...';
    return 'Search workspace...';
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 15
    }}>
      {/* Left: Dynamic Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentView === 'hub' ? (
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Organization Projects Hub
              </h2>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#e2eff2',
                  color: '#2b6777',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid #c8d8e4'
                }}>
                  {activeProject.name} ({activeProject.key})
                </span>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>/</span>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  {activeTab === 'dashboard' && 'Overview'}
                  {activeTab === 'kanban' && 'Board & Tasks'}
                  {activeTab === 'issues' && 'Issue Tracker'}
                  {activeTab === 'github' && 'GitHub Integration'}
                  {activeTab === 'team' && 'Team & Workspace'}
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Search Box */}
      <div style={{ position: 'relative', width: '340px' }}>
        <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 14px 8px 36px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-color)',
            backgroundColor: '#f2f2f2',
            fontSize: '0.82rem',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        />
      </div>

      {/* Right: Context Action Button & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {getActionButton()}

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f2f2f2',
              border: '1px solid #c8d8e4',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer'
            }}
          >
            <img
              src={currentUser?.avatar || mockUsers[1].avatar}
              alt=""
              style={{ width: '26px', height: '26px', borderRadius: '50%' }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c3d44' }}>
              {currentUser?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={14} color="#527982" />
          </div>

          {showDropdown && (
            <div className="pastel-card animate-modal-pop" style={{
              position: 'absolute',
              right: 0,
              top: '115%',
              width: '230px',
              padding: '12px',
              backgroundColor: '#ffffff',
              boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#527982', textTransform: 'uppercase', marginBottom: '2px' }}>
                CURRENT USER
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1c3d44' }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.74rem', color: '#2b6777', fontWeight: 700, marginBottom: '6px' }}>
                @{currentUser?.githubUsername} • {currentUser?.role}
              </div>

              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#527982', textTransform: 'uppercase', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                SWITCH USER (DB):
              </div>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => { switchUser(u); setShowDropdown(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: currentUser?.id === u.id ? '#e2eff2' : 'transparent',
                    fontSize: '0.78rem',
                    textAlign: 'left'
                  }}
                >
                  <img src={u.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 600, color: '#1c3d44' }}>{u.name}</span>
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
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
        </div>
      </div>
    </header>
  );
};
