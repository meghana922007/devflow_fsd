import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitBranch,
  Star,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  GitPullRequest,
  ExternalLink
} from 'lucide-react';

export const BranchesView: React.FC = () => {
  const {
    activeProject,
    branches,
    setIsNewPRModalOpen
  } = useApp();

  const projectBranches = branches.filter(b => b.projectId === activeProject.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Repository Branches ({projectBranches.length})
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Branch tracking, default protections, and divergence telemetry relative to base branch.
          </p>
        </div>

        <button
          onClick={() => setIsNewPRModalOpen(true)}
          className="btn-primary"
          style={{ fontSize: '0.82rem', padding: '8px 16px' }}
        >
          <Plus size={14} /> New Branch PR
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projectBranches.map(branch => (
          <div
            key={branch.name}
            className="pastel-card animate-fade-in"
            style={{
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            {/* Left: Branch name & status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: branch.isDefault ? '#2b6777' : '#e2eff2',
                color: branch.isDefault ? '#ffffff' : '#2b6777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GitBranch size={18} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {branch.name}
                  </span>

                  {branch.isDefault && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: '#52ab98',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <Star size={10} fill="#ffffff" /> Default
                    </span>
                  )}

                  {branch.isDefault && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: '#c8d8e4',
                      color: '#1c3d44',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <Shield size={10} /> Protected
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Last commit: <code style={{ color: '#2b6777', fontWeight: 700 }}>{branch.lastCommitSha}</code> — {branch.lastCommitMessage} ({branch.updatedAt})
                </div>
              </div>
            </div>

            {/* Right: Ahead / Behind and Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {!branch.isDefault && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f2f2f2',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <span style={{ color: '#52ab98', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ArrowUpRight size={12} /> {branch.ahead} ahead
                  </span>
                  <span>/</span>
                  <span style={{ color: '#527982', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ArrowDownLeft size={12} /> {branch.behind} behind
                  </span>
                </div>
              )}

              <a
                href={`${activeProject.gitRepo || 'https://github.com/meghana922007/devflow'}/tree/${branch.name}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View branch on GitHub.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #c8d8e4',
                  color: '#2b6777',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={12} /> GitHub ↗
              </a>

              {!branch.isDefault && (
                <button
                  onClick={() => setIsNewPRModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: '#e2eff2',
                    border: '1px solid #c8d8e4',
                    color: '#2b6777',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  <GitPullRequest size={13} /> Open PR
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
