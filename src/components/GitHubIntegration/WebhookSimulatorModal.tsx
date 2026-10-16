import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Zap,
  GitCommit,
  GitPullRequest,
  Radio,
  CheckCircle2,
  Code2,
  Play
} from 'lucide-react';

export const WebhookSimulatorModal: React.FC = () => {
  const {
    isWebhookSimulatorOpen,
    setIsWebhookSimulatorOpen,
    simulateWebhook,
    repoSettings
  } = useApp();

  const [selectedEvent, setSelectedEvent] = useState<'push' | 'pull_request' | 'workflow_run'>('push');
  const [lastDispatched, setLastDispatched] = useState<string | null>(null);

  if (!isWebhookSimulatorOpen) return null;

  const handleSimulate = (eventType: 'push' | 'pull_request' | 'workflow_run') => {
    simulateWebhook(eventType);
    setLastDispatched(eventType);
    setTimeout(() => {
      setLastDispatched(null);
    }, 3000);
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
        maxWidth: '680px',
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
              backgroundColor: '#52ab98',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                GitHub Webhook Event Simulator
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Trigger live HTTP POST payloads into DevFlow's webhook ingestion engine.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWebhookSimulatorOpen(false)}
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

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target Info */}
          <div style={{
            backgroundColor: '#f2f2f2',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              Endpoint: <code style={{ color: '#2b6777', fontWeight: 700 }}>{repoSettings.webhookUrl}</code>
            </div>
            <span style={{ color: '#52ab98', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={12} /> Ready
            </span>
          </div>

          {/* Success toast if dispatched */}
          {lastDispatched && (
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
              <span>
                Simulated <code>{lastDispatched}</code> event ingested! 200 OK verified. Check the Commits, PRs, or Webhook tabs.
              </span>
            </div>
          )}

          {/* Preset Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1c3d44', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Event to Ingest:
            </div>

            {/* Event 1: Push */}
            <div
              onClick={() => setSelectedEvent('push')}
              style={{
                border: '2px solid',
                borderColor: selectedEvent === 'push' ? '#2b6777' : 'var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: selectedEvent === 'push' ? '#e2eff2' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#2b6777',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GitCommit size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    git push (Commit Payload)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Simulates a developer pushing a commit to the remote repository.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSimulate('push'); }}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <Play size={12} /> Trigger
              </button>
            </div>

            {/* Event 2: Pull Request */}
            <div
              onClick={() => setSelectedEvent('pull_request')}
              style={{
                border: '2px solid',
                borderColor: selectedEvent === 'pull_request' ? '#2b6777' : 'var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: selectedEvent === 'pull_request' ? '#e2eff2' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#52ab98',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GitPullRequest size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    pull_request.opened (PR Event)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Simulates opening a new PR with branch diff and review requirements.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSimulate('pull_request'); }}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: '#52ab98' }}
              >
                <Play size={12} /> Trigger
              </button>
            </div>

            {/* Event 3: Workflow Run */}
            <div
              onClick={() => setSelectedEvent('workflow_run')}
              style={{
                border: '2px solid',
                borderColor: selectedEvent === 'workflow_run' ? '#2b6777' : 'var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: selectedEvent === 'workflow_run' ? '#e2eff2' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#1c3d44',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Radio size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    workflow_run.completed (CI/CD Pipeline)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Simulates GitHub Actions CI test suite passing with full telemetry.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSimulate('workflow_run'); }}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <Play size={12} /> Trigger
              </button>
            </div>
          </div>

          {/* Sample Payload Preview */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2b6777', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Code2 size={13} /> Sample Outgoing Headers & Payload:
            </div>
            <pre style={{
              backgroundColor: '#1c3d44',
              color: '#c8d8e4',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              margin: 0,
              lineHeight: 1.4
            }}>
{`POST ${repoSettings.webhookUrl}
X-GitHub-Event: ${selectedEvent}
X-Hub-Signature-256: sha256=d5b91a78e4f2010...
Content-Type: application/json`}
            </pre>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setIsWebhookSimulatorOpen(false)}
              className="btn-secondary"
            >
              Close Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
