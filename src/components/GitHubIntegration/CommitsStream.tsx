import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitCommit,
  GitBranch,
  Copy,
  Check,
  Search,
  Plus,
  Tag,
  Clock,
  ExternalLink
} from 'lucide-react';

export const CommitsStream: React.FC = () => {
  const {
    activeProject,
    commits,
    branches,
    addCommit,
    tasks
  } = useApp();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [commitSearch, setCommitSearch] = useState('');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  // Quick commit form state
  const [showQuickCommit, setShowQuickCommit] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [targetBranch, setTargetBranch] = useState('main');
  const [linkedTaskId, setLinkedTaskId] = useState('');

  const projectCommits = commits.filter(c => c.projectId === activeProject.id);

  const filteredCommits = projectCommits.filter(c => {
    if (selectedBranch !== 'all' && c.branch !== selectedBranch) return false;
    if (commitSearch.trim()) {
      const q = commitSearch.toLowerCase();
      const matchMsg = c.message.toLowerCase().includes(q);
      const matchSha = c.id.toLowerCase().includes(q);
      const matchAuthor = c.authorName.toLowerCase().includes(q) || c.githubUsername.toLowerCase().includes(q);
      return matchMsg || matchSha || matchAuthor;
    }
    return true;
  });

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1800);
  };

  const handleCreateCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    addCommit({
      message: newMsg.trim(),
      branch: targetBranch,
      linkedTaskId: linkedTaskId || undefined
    });

    setNewMsg('');
    setShowQuickCommit(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Branch Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="all">All Branches ({projectCommits.length} commits)</option>
              {branches.filter(b => b.projectId === activeProject.id).map(b => (
                <option key={b.name} value={b.name}>{b.name} {b.isDefault ? '★' : ''}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowQuickCommit(!showQuickCommit)}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Plus size={14} /> {showQuickCommit ? 'Cancel' : 'Push Commit'}
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search commits, SHA, author..."
            value={commitSearch}
            onChange={(e) => setCommitSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Quick Commit Box (Inline Expandable Form) */}
      {showQuickCommit && (
        <form
          onSubmit={handleCreateCommit}
          className="pastel-card animate-fade-in"
          style={{
            padding: '18px 22px',
            backgroundColor: '#eef6f8',
            border: '1px solid #c8d8e4',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2b6777', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitCommit size={16} /> Record Git Commit to Repository
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1c3d44', marginBottom: '4px' }}>
                Commit Message *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. feat(tasks): add priority filter to Kanban"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1c3d44', marginBottom: '4px' }}>
                Branch
              </label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                {branches.filter(b => b.projectId === activeProject.id).map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1c3d44', marginBottom: '4px' }}>
                Link Task (Optional)
              </label>
              <select
                value={linkedTaskId}
                onChange={(e) => setLinkedTaskId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="">None</option>
                {tasks.filter(t => t.projectId === activeProject.id).map(t => (
                  <option key={t.id} value={t.id}>{t.id}: {t.title.substring(0, 24)}...</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowQuickCommit(false)}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '6px 18px', fontSize: '0.82rem' }}
            >
              Push Commit
            </button>
          </div>
        </form>
      )}

      {/* Commits Timeline List */}
      {filteredCommits.length === 0 ? (
        <div className="pastel-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <GitCommit size={36} color="#c8d8e4" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            No Commits Match Filter
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
            Try selecting "All Branches" or clearing your search term.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredCommits.map(commit => (
            <div
              key={commit.id}
              className="pastel-card animate-fade-in"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              {/* Left: Commit SHA, Message & Metadata */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '320px' }}>
                {/* SHA Pill with Copy */}
                <button
                  onClick={() => handleCopySha(commit.id)}
                  title="Click to copy full commit SHA"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#e2eff2',
                    border: '1px solid #c8d8e4',
                    color: '#2b6777',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {copiedSha === commit.id ? <Check size={12} color="#52ab98" /> : <Copy size={12} />}
                  {commit.id}
                </button>

                {/* Commit info */}
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {commit.message}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <img src={commit.authorAvatar} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{commit.authorName}</span>
                      <span style={{ color: '#2b6777' }}>@{commit.githubUsername}</span>
                    </div>

                    <span>•</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>{commit.timestamp}</span>
                    </div>

                    {commit.linkedTaskId && (
                      <>
                        <span>•</span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          backgroundColor: '#e6f6f3',
                          color: '#52ab98',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.72rem'
                        }}>
                          <Tag size={10} /> {commit.linkedTaskId}
                        </span>
                      </>
                    )}

                    {commit.isLive && (
                      <>
                        <span>•</span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          backgroundColor: '#e6f6f3',
                          color: '#195239',
                          border: '1px solid #52ab98',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }}>
                          Live GitHub
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Branch pill, Additions/Deletions & GitHub Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#f2f2f2',
                  border: '1px solid #c8d8e4',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1c3d44'
                }}>
                  <GitBranch size={12} color="#2b6777" />
                  {commit.branch}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#52ab98', fontWeight: 800 }}>+{commit.additions}</span>
                  <span style={{ color: '#2b6777', fontWeight: 800 }}>-{commit.deletions}</span>
                </div>

                <a
                  href={commit.htmlUrl || `https://github.com/meghana922007/devflow/commit/${commit.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open commit on GitHub.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: '#ffffff',
                    border: '1px solid #c8d8e4',
                    color: '#2b6777',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ExternalLink size={11} /> GitHub ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
