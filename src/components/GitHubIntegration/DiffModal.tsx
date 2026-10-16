import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileCode,
  GitPullRequest,
  GitMerge,
  Tag
} from 'lucide-react';

export const DiffModal: React.FC = () => {
  const {
    selectedPRForDiff,
    setSelectedPRForDiff,
    mergePullRequest
  } = useApp();

  if (!selectedPRForDiff) return null;

  const pr = selectedPRForDiff;

  const handleMerge = () => {
    mergePullRequest(pr.id);
    setSelectedPRForDiff(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(28, 61, 68, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="pastel-card animate-modal-pop" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        backgroundColor: '#ffffff'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#eef6f8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#2b6777',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileCode size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2b6777' }}>
                  PR #{pr.number}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: pr.status === 'open' ? '#52ab98' : pr.status === 'merged' ? '#2b6777' : '#c8d8e4',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  textTransform: 'uppercase'
                }}>
                  {pr.status}
                </span>
                {pr.linkedTaskId && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#e2eff2',
                    color: '#2b6777',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Tag size={10} /> {pr.linkedTaskId}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {pr.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setSelectedPRForDiff(null)}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* PR Meta Subheader */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#f2f2f2',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={pr.authorAvatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pr.authorName}</span>
            <span style={{ color: '#2b6777', fontWeight: 700 }}>@{pr.githubUsername}</span>
            <span>wants to merge into</span>
            <code style={{ backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#2b6777', border: '1px solid #c8d8e4' }}>
              {pr.targetBranch}
            </code>
            <span>from</span>
            <code style={{ backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#1c3d44', border: '1px solid #c8d8e4' }}>
              {pr.sourceBranch}
            </code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', fontWeight: 700 }}>
            <span style={{ color: '#52ab98' }}>+{pr.additions}</span>
            <span style={{ color: '#2b6777' }}>-{pr.deletions}</span>
            <span style={{ color: 'var(--text-muted)' }}>({pr.diffFiles.length || pr.changedFilesCount} files changed)</span>
          </div>
        </div>

        {/* Code Diffs Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pr.diffFiles.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <GitPullRequest size={32} color="#c8d8e4" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontWeight: 700 }}>No diff files available for this historical pull request.</p>
              <p style={{ fontSize: '0.8rem' }}>Summary: {pr.additions} additions, {pr.deletions} deletions.</p>
            </div>
          ) : (
            pr.diffFiles.map((file, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* File Header */}
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: '#eef6f8',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={15} color="#2b6777" />
                    <span style={{ fontWeight: 800, color: '#1c3d44', fontFamily: 'monospace' }}>
                      {file.filename}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      color: file.status === 'added' ? '#52ab98' : '#2b6777',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid #c8d8e4'
                    }}>
                      {file.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    <span style={{ color: '#52ab98', fontWeight: 800 }}>+{file.additions}</span>
                    <span style={{ color: '#2b6777', fontWeight: 800 }}>-{file.deletions}</span>
                  </div>
                </div>

                {/* Diff Lines */}
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  overflowX: 'auto',
                  backgroundColor: '#ffffff'
                }}>
                  {file.patch.split('\n').map((line, lineIdx) => {
                    const isAddition = line.startsWith('+');
                    const isDeletion = line.startsWith('-');
                    const isHunk = line.startsWith('@@');

                    let bg = '#ffffff';
                    let textColor = '#1c3d44';

                    if (isAddition) {
                      bg = '#e6f6f3';
                      textColor = '#195239';
                    } else if (isDeletion) {
                      bg = '#fbecee';
                      textColor = '#881337';
                    } else if (isHunk) {
                      bg = '#e2eff2';
                      textColor = '#2b6777';
                    }

                    return (
                      <div
                        key={lineIdx}
                        style={{
                          display: 'flex',
                          backgroundColor: bg,
                          color: textColor,
                          padding: '1px 12px',
                          borderLeft: isAddition ? '3px solid #52ab98' : isDeletion ? '3px solid #c8d8e4' : isHunk ? '3px solid #2b6777' : '3px solid transparent'
                        }}
                      >
                        <span style={{
                          width: '36px',
                          userSelect: 'none',
                          color: 'var(--text-light)',
                          fontSize: '0.75rem',
                          textAlign: 'right',
                          paddingRight: '12px'
                        }}>
                          {lineIdx + 1}
                        </span>
                        <span style={{ whiteSpace: 'pre', fontWeight: isHunk ? 700 : 400 }}>
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f2f2f2'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Review status: <strong style={{ color: '#52ab98' }}>{pr.reviewStatus}</strong> • CI Status: <strong style={{ color: '#2b6777' }}>{pr.ciStatus}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSelectedPRForDiff(null)}
              className="btn-secondary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Close Diff
            </button>

            {pr.status === 'open' && (
              <button
                onClick={handleMerge}
                className="btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <GitMerge size={15} /> Merge Pull Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
