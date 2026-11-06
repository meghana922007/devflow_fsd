import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../services/api';
import {
  X,
  SlidersHorizontal,
  FolderGit2,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { parseGitHubRepo } from '../../services/githubService';

export const RepoSettingsModal: React.FC = () => {
  const {
    activeProject,
    repoSettings,
    updateRepoSettings,
    syncRepoWithGitHub,
    switchGitRepo,
    userPublicRepos,
    githubAccount,
    refreshGitHubAccount,
    saveGitHubToken,
    removeGitHubToken,
    isRepoSettingsModalOpen,
    setIsRepoSettingsModalOpen
  } = useApp();

  const [repoUrl, setRepoUrl] = useState(activeProject.gitRepo || repoSettings.repoUrl || '');
  const [defaultBranch, setDefaultBranch] = useState(repoSettings.defaultBranch || 'main');
  const [webhookSecret, setWebhookSecret] = useState(repoSettings.webhookSecret || 'whsec_9a7d83f21e847c21b9');
  const [patToken, setPatToken] = useState('');
  const [autoSync, setAutoSync] = useState(repoSettings.autoSync ?? true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    rateLimit?: string;
  } | null>(null);

  useEffect(() => {
    if (!isRepoSettingsModalOpen) return;
    void refreshGitHubAccount();
  }, [isRepoSettingsModalOpen, refreshGitHubAccount]);

  if (!isRepoSettingsModalOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(repoSettings.webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1800);
  };

  const handleTestConnection = async () => {
    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed) {
      setTestResult({
        success: false,
        message: 'Invalid GitHub URL. Format: https://github.com/owner/repository'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      if (!githubAccount.connected) {
        setTestResult({ success: false, message: 'Connect your GitHub account first to load and verify your repositories.' });
        return;
      }
      const { repositories } = await apiRequest<{ repositories: { html_url: string; default_branch: string }[] }>('/github/repos');
      const repository = repositories.find(item => item.html_url.toLowerCase() === repoUrl.replace(/\/$/, '').toLowerCase());
      if (!repository) {
        setTestResult({ success: false, message: 'This repository is not available to the connected GitHub account.' });
        return;
      }
      setTestResult({
        success: true,
        message: `Repository access confirmed. Default branch: ${repository.default_branch}.`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to connect to GitHub repository.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSelectQuickRepo = (url: string) => {
    setRepoUrl(url);
    const parsed = parseGitHubRepo(url);
    if (parsed) {
      setTestResult(null);
    }
  };

  const handleConnectGitHub = async () => {
    if (!patToken.trim()) return;
    setIsConnecting(true);
    setTestResult(null);
    try {
      if (await saveGitHubToken(patToken.trim())) {
        setPatToken('');
        localStorage.removeItem('devflow_github_pat');
        setTestResult({
          success: true,
          message: 'GitHub connected and repository list loaded.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setTestResult({ success: false, message: 'Connect GitHub and select a repository before saving.' });
      return;
    }
    if (patToken.trim() && !(await saveGitHubToken(patToken.trim()))) return;
    setPatToken('');
    localStorage.removeItem('devflow_github_pat');

    updateRepoSettings({
      repoUrl,
      defaultBranch,
      webhookSecret,
      autoSync,
      patConfigured: !!patToken.trim()
    });

    const synced = repoUrl !== activeProject.gitRepo
      ? await switchGitRepo(repoUrl)
      : await syncRepoWithGitHub(repoUrl);
    if (!synced) return;

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsRepoSettingsModalOpen(false);
    }, 1200);
  };

  const githubRepos = userPublicRepos.map(repo => ({
    name: repo.fullName,
    url: repo.htmlUrl,
    desc: repo.description || '',
  }));

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
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        backgroundColor: '#ffffff'
      }}>
        {/* Header */}
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
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#2b6777',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                GitHub Integration & API Settings
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Connect live GitHub repositories, test REST endpoints, and configure webhook telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRepoSettingsModalOpen(false)}
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

        {/* Content Form */}
        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {savedSuccess && (
            <div className="animate-fade-in" style={{
              backgroundColor: '#e6f6f3',
              border: '1px solid #52ab98',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#195239',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={18} color="#52ab98" />
              <span>Repository configuration saved! Synchronizing live telemetry with GitHub...</span>
            </div>
          )}

          {/* Connected GitHub User Banner */}
          <div style={{
            backgroundColor: '#e2eff2',
            border: '1px solid #c8d8e4',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1c3d44' }}>
                  {githubAccount.connected ? `GitHub account: @${githubAccount.username}` : 'No GitHub account connected'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2b6777' }}>
                  {githubAccount.connected ? 'Private and public repositories can be listed.' : 'Connect an account to browse its repositories.'}
                </div>
              </div>
            </div>

            {githubAccount.connected && githubAccount.username && (
              <a href={`https://github.com/${githubAccount.username}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700, color: '#2b6777' }}>
                View GitHub Profile <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Repository selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Repositories for the connected GitHub account:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {githubRepos.map(r => {
                const isSelected = repoUrl.toLowerCase().includes(r.name.toLowerCase());
                return (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => handleSelectQuickRepo(r.url)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: isSelected ? '#2b6777' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#2b6777',
                      border: isSelected ? '1px solid #2b6777' : '1px solid #c8d8e4',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <FolderGit2 size={13} />
                    {r.name}
                  </button>
                );
              })}
              {githubRepos.length === 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {githubAccount.connected ? 'No repositories were returned for this account.' : 'Connect GitHub below to load your repositories.'}
                </span>
              )}
            </div>
          </div>

          {/* Repository URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Target GitHub Repository URL *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <FolderGit2 size={16} color="#2b6777" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                <RefreshCw size={13} style={{ animation: isTesting ? 'spin 1s linear infinite' : 'none' }} />
                {isTesting ? 'Pinging GitHub REST API...' : 'Test Live API Connection'}
              </button>
            </div>

            {testResult && (
              <div className="animate-fade-in" style={{
                marginTop: '10px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: testResult.success ? '#e6f6f3' : '#fcedea',
                border: testResult.success ? '1px solid #52ab98' : '1px solid #e57373',
                fontSize: '0.82rem',
                color: testResult.success ? '#195239' : '#8a2b2b'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {testResult.success ? <CheckCircle2 size={15} color="#52ab98" /> : <X size={15} color="#e57373" />}
                  {testResult.success ? 'GitHub REST API Check: 200 OK' : 'GitHub REST API Check Failed'}
                </div>
                <div>{testResult.message}</div>
                {testResult.rateLimit && (
                  <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.85 }}>
                    Rate limit quota: <code>{testResult.rateLimit}</code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GitHub Personal Access Token (PAT) Field */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} color="#2b6777" /> GitHub Personal Access Token (PAT) <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.74rem', color: '#2b6777', fontWeight: 600, textDecoration: 'underline' }}
              >
                Generate Token ↗
              </a>
            </div>
            <input
              type="password"
              value={patToken}
              onChange={(e) => setPatToken(e.target.value)}
              placeholder="Paste a fine-grained or classic GitHub token"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sent to this app's server for validation and encrypted storage; it is never saved in browser storage.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="btn-secondary" disabled={!patToken.trim() || isConnecting}
                onClick={() => void handleConnectGitHub()}>
                {isConnecting ? 'Connecting…' : 'Connect & load repositories'}
              </button>
              {githubAccount.connected && (
                <button type="button" className="btn-secondary" disabled={isConnecting}
                  onClick={() => void removeGitHubToken().then(removed => {
                    if (removed) setTestResult({ success: true, message: 'GitHub account disconnected.' });
                  })}>
                  Disconnect GitHub
                </button>
              )}
            </div>
          </div>

          {/* Default Branch */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Default Base Branch
            </label>
            <input
              type="text"
              required
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Webhook Endpoint Payload URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              GitHub Webhook Payload URL (Set in GitHub Repo → Settings → Webhooks)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={repoSettings.webhookUrl}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#f2f2f2',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  color: '#2b6777',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              >
                {copiedUrl ? <Check size={14} color="#52ab98" /> : <Copy size={14} />}
                {copiedUrl ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Webhook Secret (HMAC-SHA256 Token)
            </label>
            <input
              type="text"
              required
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
          </div>

          {/* Auto-Sync Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#f2f2f2',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)'
          }}>
            <input
              type="checkbox"
              id="auto-sync"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              style={{ accentColor: '#2b6777', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="auto-sync" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c3d44', cursor: 'pointer' }}>
              Automatically transition linked tasks to "Done" upon Pull Request merge
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsRepoSettingsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save & Synchronize Live Repo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
