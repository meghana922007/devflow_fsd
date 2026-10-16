import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
import { fetchGitHubRepoDetails, checkRateLimit, parseGitHubRepo } from '../../services/githubService';

export const RepoSettingsModal: React.FC = () => {
  const {
    activeProject,
    repoSettings,
    updateRepoSettings,
    syncRepoWithGitHub,
    switchGitRepo,
    userPublicRepos,
    isRepoSettingsModalOpen,
    setIsRepoSettingsModalOpen
  } = useApp();

  const [repoUrl, setRepoUrl] = useState(activeProject.gitRepo || repoSettings.repoUrl || 'https://github.com/meghana922007/devflow');
  const [defaultBranch, setDefaultBranch] = useState(repoSettings.defaultBranch || 'main');
  const [webhookSecret, setWebhookSecret] = useState(repoSettings.webhookSecret || 'whsec_9a7d83f21e847c21b9');
  const [patToken, setPatToken] = useState(() => localStorage.getItem('devflow_github_pat') || '');
  const [autoSync, setAutoSync] = useState(repoSettings.autoSync ?? true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    rateLimit?: string;
  } | null>(null);

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
      const info = await fetchGitHubRepoDetails(parsed.owner, parsed.repo, patToken);
      const rl = await checkRateLimit(patToken);
      setTestResult({
        success: true,
        message: `Successfully reached "${info.fullName}". Default branch: ${info.defaultBranch}. Primary language: ${info.language}. Stars: ${info.stars}.`,
        rateLimit: rl ? `${rl.remaining}/${rl.limit} requests remaining (resets at ${rl.resetDate})` : undefined
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to GitHub repository.'
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Store PAT if provided
    if (patToken.trim()) {
      localStorage.setItem('devflow_github_pat', patToken.trim());
    } else {
      localStorage.removeItem('devflow_github_pat');
    }

    updateRepoSettings({
      repoUrl,
      defaultBranch,
      webhookSecret,
      autoSync,
      patConfigured: !!patToken.trim()
    });

    if (repoUrl !== activeProject.gitRepo) {
      await switchGitRepo(repoUrl);
    } else {
      await syncRepoWithGitHub(repoUrl);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsRepoSettingsModalOpen(false);
    }, 1200);
  };

  // Repositories for Meghana (from live GitHub API or verified list)
  const meghanaRepos = userPublicRepos.length > 0
    ? userPublicRepos.map(r => ({ name: r.name, url: r.htmlUrl, desc: r.description || '' }))
    : [
        { name: 'devflow', url: 'https://github.com/meghana922007/devflow', desc: 'Unified Workspace Platform' },
        { name: 'ThinkTank', url: 'https://github.com/meghana922007/ThinkTank', desc: 'TypeScript Reasoning' },
        { name: 'Agentic-RBAC', url: 'https://github.com/meghana922007/Agentic-RBAC', desc: 'Role-Based Access Control' },
        { name: 'sellersense', url: 'https://github.com/meghana922007/sellersense', desc: 'E-commerce Analytics' }
      ];

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
              <img
                src="https://avatars.githubusercontent.com/u/201999808?v=4"
                alt="Meghana"
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #2b6777' }}
              />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1c3d44' }}>
                  Meghana Pinikeshi (@meghana922007)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2b6777' }}>
                  Live GitHub Account Connected
                </div>
              </div>
            </div>

            <a
              href="https://github.com/meghana922007"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#2b6777',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#ffffff',
                border: '1px solid #c8d8e4'
              }}
            >
              View GitHub Profile <ExternalLink size={12} />
            </a>
          </div>

          {/* Quick Repo Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Select Repository from @meghana922007:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {meghanaRepos.map(r => {
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
                placeholder="https://github.com/meghana922007/devflow"
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
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Optional - raises rate limit to 5000/hr)"
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
              Unauthenticated API is active (60 requests/hr). Providing a PAT increases rate limits to 5,000/hr and allows accessing private repos.
            </p>
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
