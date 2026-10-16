import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderGit2,
  GitPullRequest,
  GitCommit,
  GitBranch,
  Radio,
  ExternalLink,
  Plus,
  RefreshCw,
  Zap,
  CheckCircle2,
  Copy,
  SlidersHorizontal,
  Check,
  AlertCircle
} from 'lucide-react';
import { PullRequestList } from './PullRequestList';
import { CommitsStream } from './CommitsStream';
import { BranchesView } from './BranchesView';
import { WebhookLogView } from './WebhookLogView';

export const GitHubHub: React.FC = () => {
  const {
    activeProject,
    pullRequests,
    commits,
    branches,
    webhookEvents,
    repoSettings,
    syncRepoWithGitHub,
    isSyncingGitHub,
    githubRateLimit,
    setIsNewPRModalOpen,
    setIsWebhookSimulatorOpen,
    setIsRepoSettingsModalOpen
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'prs' | 'commits' | 'branches' | 'webhooks'>('prs');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const projectPRs = pullRequests.filter(pr => pr.projectId === activeProject.id);
  const openPRs = projectPRs.filter(pr => pr.status === 'open');
  const mergedPRs = projectPRs.filter(pr => pr.status === 'merged');
  const projectCommits = commits.filter(c => c.projectId === activeProject.id);
  const projectBranches = branches.filter(b => b.projectId === activeProject.id);
  const projectWebhooks = webhookEvents.filter(w => w.projectId === activeProject.id);

  const handleSync = async () => {
    await syncRepoWithGitHub();
  };

  const handleCopyRepo = () => {
    const url = activeProject.gitRepo || repoSettings.repoUrl;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner - Module 3 Hero & Repository Connection Bar */}
      <div style={{
        backgroundColor: '#2b6777',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(43, 103, 119, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <FolderGit2 size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)'
              }}>
                MODULE 3: LIVE GITHUB SYNC
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#52ab98',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)'
              }}>
                <CheckCircle2 size={12} /> Live API Connected
              </span>
              {githubRateLimit && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  ⚡ Rate Limit: {githubRateLimit.remaining}/{githubRateLimit.limit}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {activeProject.gitRepo ? activeProject.gitRepo.replace('https://github.com/', '') : 'meghana922007/devflow'}
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#c8d8e4',
                color: '#2b6777',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <GitBranch size={12} /> {repoSettings.defaultBranch}
              </span>
            </h2>

            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '2px' }}>
              Bidirectional Git telemetry: PR review pipelines, commit feeds, live webhook payloads, and automated task transitions.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {activeProject.gitRepo && (
            <a
              href={activeProject.gitRepo}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={14} /> Open on GitHub ↗
            </a>
          )}

          <button
            onClick={handleCopyRepo}
            title="Copy Repository URL"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            {copiedUrl ? <Check size={14} color="#52ab98" /> : <Copy size={14} />}
            {copiedUrl ? 'Copied' : 'Clone URL'}
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncingGitHub}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={14} style={{ animation: isSyncingGitHub ? 'spin 1s linear infinite' : 'none' }} />
            {isSyncingGitHub ? 'Syncing...' : 'Sync Live GitHub'}
          </button>

          <button
            onClick={() => setIsWebhookSimulatorOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#52ab98',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(82, 171, 152, 0.35)'
            }}
          >
            <Zap size={14} /> Simulate Webhook
          </button>

          <button
            onClick={() => setIsNewPRModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#ffffff',
              color: '#2b6777',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Plus size={15} /> New Pull Request
          </button>

          <button
            onClick={() => setIsRepoSettingsModalOpen(true)}
            title="Repository & Webhook Configuration"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff'
            }}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Sync Error / Rate Limit Alert if any */}
      {repoSettings.syncError && (
        <div style={{
          backgroundColor: '#fcedea',
          border: '1px solid #e57373',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8a2b2b', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{repoSettings.syncError}</span>
          </div>
          <button
            onClick={() => setIsRepoSettingsModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          >
            Settings / Token
          </button>
        </div>
      )}

      {/* 4-Card Repository Telemetry Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#e2eff2', border: '1px solid #c8d8e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b6777', textTransform: 'uppercase' }}>
              OPEN PULL REQUESTS
            </span>
            <GitPullRequest size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1c3d44' }}>
            {openPRs.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {mergedPRs.length} PRs merged to {repoSettings.defaultBranch}
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #c8d8e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b6777', textTransform: 'uppercase' }}>
              COMMITS INGESTED
            </span>
            <GitCommit size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1c3d44' }}>
            {projectCommits.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Latest SHA: <code style={{ fontWeight: 700, color: '#2b6777' }}>{projectCommits[0]?.id || 'a7f93e1'}</code>
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#c8d8e4', border: '1px solid #2b6777' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b6777', textTransform: 'uppercase' }}>
              ACTIVE BRANCHES
            </span>
            <GitBranch size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b6777' }}>
            {projectBranches.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1c3d44' }}>
            Default branch protected
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#e6f6f3', border: '1px solid #52ab98' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#52ab98', textTransform: 'uppercase' }}>
              WEBHOOK HEALTH
            </span>
            <Radio size={18} color="#52ab98" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#52ab98' }}>
            100% OK
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1c3d44' }}>
            {projectWebhooks.length} payloads delivered
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('prs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: activeSubTab === 'prs' ? '#2b6777' : 'var(--bg-card)',
              color: activeSubTab === 'prs' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid',
              borderColor: activeSubTab === 'prs' ? '#2b6777' : 'var(--border-color)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <GitPullRequest size={16} />
            Pull Requests ({projectPRs.length})
          </button>

          <button
            onClick={() => setActiveSubTab('commits')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: activeSubTab === 'commits' ? '#2b6777' : 'var(--bg-card)',
              color: activeSubTab === 'commits' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid',
              borderColor: activeSubTab === 'commits' ? '#2b6777' : 'var(--border-color)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <GitCommit size={16} />
            Commits Stream ({projectCommits.length})
          </button>

          <button
            onClick={() => setActiveSubTab('branches')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: activeSubTab === 'branches' ? '#2b6777' : 'var(--bg-card)',
              color: activeSubTab === 'branches' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid',
              borderColor: activeSubTab === 'branches' ? '#2b6777' : 'var(--border-color)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <GitBranch size={16} />
            Branches ({projectBranches.length})
          </button>

          <button
            onClick={() => setActiveSubTab('webhooks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: activeSubTab === 'webhooks' ? '#2b6777' : 'var(--bg-card)',
              color: activeSubTab === 'webhooks' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid',
              borderColor: activeSubTab === 'webhooks' ? '#2b6777' : 'var(--border-color)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <Radio size={16} />
            Webhook Ingestion Log ({projectWebhooks.length})
          </button>
        </div>

        {activeProject.gitRepo && (
          <a
            href={activeProject.gitRepo}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#2b6777',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            View on GitHub <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Sub-Tab Views */}
      {activeSubTab === 'prs' && <PullRequestList />}
      {activeSubTab === 'commits' && <CommitsStream />}
      {activeSubTab === 'branches' && <BranchesView />}
      {activeSubTab === 'webhooks' && <WebhookLogView />}
    </div>
  );
};
