import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { PullRequest, PullRequestStatus } from '../../types';
import {
  GitPullRequest,
  GitMerge,
  FileCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  GitBranch,
  Search,
  Tag,
  ExternalLink
} from 'lucide-react';

export const PullRequestList: React.FC = () => {
  const {
    activeProject,
    pullRequests,
    mergePullRequest,
    closePullRequest,
    setSelectedPRForDiff,
    setIsNewPRModalOpen,
    setActiveTab
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<PullRequestStatus | 'all'>('all');
  const [prSearch, setPrSearch] = useState('');

  const projectPRs = pullRequests.filter(pr => pr.projectId === activeProject.id);

  const filteredPRs = projectPRs.filter(pr => {
    if (statusFilter !== 'all' && pr.status !== statusFilter) return false;
    if (prSearch.trim()) {
      const q = prSearch.toLowerCase();
      const matchTitle = pr.title.toLowerCase().includes(q);
      const matchAuthor = pr.authorName.toLowerCase().includes(q) || pr.githubUsername.toLowerCase().includes(q);
      const matchBranch = pr.sourceBranch.toLowerCase().includes(q);
      const matchTask = pr.linkedTaskId ? pr.linkedTaskId.toLowerCase().includes(q) : false;
      return matchTitle || matchAuthor || matchBranch || matchTask;
    }
    return true;
  });

  const getStatusBadge = (status: PullRequestStatus) => {
    switch (status) {
      case 'open':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#52ab98',
            color: '#ffffff'
          }}>
            <GitPullRequest size={12} /> Open
          </span>
        );
      case 'merged':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#2b6777',
            color: '#ffffff'
          }}>
            <GitMerge size={12} /> Merged
          </span>
        );
      case 'closed':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#c8d8e4',
            color: '#1c3d44'
          }}>
            Closed
          </span>
        );
      case 'draft':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#f2f2f2',
            color: '#527982',
            border: '1px solid #c8d8e4'
          }}>
            Draft
          </span>
        );
    }
  };

  const getReviewBadge = (review: PullRequest['reviewStatus']) => {
    switch (review) {
      case 'approved':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#52ab98'
          }}>
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case 'changes_requested':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#2b6777'
          }}>
            <AlertCircle size={13} /> Changes Requested
          </span>
        );
      case 'review_required':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#527982'
          }}>
            <Clock size={13} /> Review Required
          </span>
        );
      default:
        return null;
    }
  };

  const getCIBadge = (ci: PullRequest['ciStatus']) => {
    switch (ci) {
      case 'success':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#52ab98',
            backgroundColor: '#e6f6f3',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)'
          }}>
            <CheckCircle2 size={12} /> CI Passed
          </span>
        );
      case 'failure':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#2b6777',
            backgroundColor: '#e2eff2',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)'
          }}>
            <AlertCircle size={12} /> CI Failed
          </span>
        );
      case 'pending':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#527982',
            backgroundColor: '#f2f2f2',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)'
          }}>
            <Clock size={12} /> CI Running
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search and Status Filter Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(['all', 'open', 'merged', 'closed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: statusFilter === tab ? '#2b6777' : 'var(--bg-card)',
                color: statusFilter === tab ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: statusFilter === tab ? '#2b6777' : 'var(--border-color)',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'all' ? `All PRs (${projectPRs.length})` : `${tab} (${projectPRs.filter(p => p.status === tab).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search PRs, branches, tasks..."
            value={prSearch}
            onChange={(e) => setPrSearch(e.target.value)}
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

      {/* Pull Requests List */}
      {filteredPRs.length === 0 ? (
        <div className="pastel-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <GitPullRequest size={36} color="#c8d8e4" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            No Pull Requests Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '6px auto 16px auto' }}>
            {prSearch ? 'Try adjusting your search criteria or status filter.' : 'Create your first pull request to sync code changes with project tasks.'}
          </p>
          <button
            onClick={() => setIsNewPRModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            Create New Pull Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPRs.map(pr => (
            <div
              key={pr.id}
              className="pastel-card animate-fade-in"
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: `4px solid ${pr.status === 'open' ? '#52ab98' : pr.status === 'merged' ? '#2b6777' : '#c8d8e4'}`
              }}
            >
              {/* Header row: Status, Number, Title, Review & CI */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                  {getStatusBadge(pr.status)}

                  <div>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>#{pr.number}</span>
                      <span>{pr.title}</span>
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={pr.authorAvatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pr.authorName}</span>
                        <span style={{ color: '#2b6777', fontWeight: 700 }}>@{pr.githubUsername}</span>
                      </div>

                      <span>•</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f2f2f2', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        <GitBranch size={12} color="#2b6777" />
                        <code style={{ fontWeight: 700, color: '#1c3d44' }}>{pr.sourceBranch}</code>
                        <span>→</span>
                        <code style={{ fontWeight: 700, color: '#2b6777' }}>{pr.targetBranch}</code>
                      </div>

                      <span>•</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#52ab98', fontWeight: 700 }}>+{pr.additions}</span>
                        <span style={{ color: '#2b6777', fontWeight: 700 }}>-{pr.deletions}</span>
                        <span>({pr.changedFilesCount} files)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getReviewBadge(pr.reviewStatus)}
                  {getCIBadge(pr.ciStatus)}
                </div>
              </div>

              {/* Description */}
              {pr.description && (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, paddingLeft: '4px' }}>
                  {pr.description}
                </p>
              )}

              {/* Bottom bar: Cross links & Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '12px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {/* Linked Items */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {pr.linkedTaskId && (
                    <button
                      onClick={() => setActiveTab('kanban')}
                      title="Jump to Module 1 Kanban Task"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: '#e2eff2',
                        color: '#2b6777',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid #c8d8e4'
                      }}
                    >
                      <Tag size={12} /> Linked Task: {pr.linkedTaskId}
                    </button>
                  )}

                  {pr.linkedIssueId && (
                    <button
                      onClick={() => setActiveTab('issues')}
                      title="Jump to Module 2 Issue Tracker"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: '#e6f6f3',
                        color: '#52ab98',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid #52ab98'
                      }}
                    >
                      <Tag size={12} /> Fixes Bug: {pr.linkedIssueId}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedPRForDiff(pr)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <FileCode size={14} /> View Code Diff
                  </button>

                  {pr.htmlUrl && (
                    <a
                      href={pr.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open PR on GitHub.com"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '7px 12px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: '#ffffff',
                        border: '1px solid #c8d8e4',
                        color: '#2b6777',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={13} /> GitHub ↗
                    </a>
                  )}

                  {pr.status === 'open' && (
                    <>
                      <button
                        onClick={() => closePullRequest(pr.id)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid #c8d8e4',
                          color: '#527982',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        Close PR
                      </button>

                      <button
                        onClick={() => mergePullRequest(pr.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 16px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: '#2b6777',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(43, 103, 119, 0.25)'
                        }}
                      >
                        <GitMerge size={14} /> Merge Pull Request
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
