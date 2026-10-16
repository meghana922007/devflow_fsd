import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Code2,
  Copy,
  Check
} from 'lucide-react';

export const WebhookLogView: React.FC = () => {
  const {
    activeProject,
    webhookEvents,
    repoSettings,
    setIsWebhookSimulatorOpen
  } = useApp();

  const [expandedId, setExpandedId] = useState<string | null>(webhookEvents[0]?.id || null);
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  const projectEvents = webhookEvents.filter(w => w.projectId === activeProject.id);

  const handleCopyPayload = (id: string, payload: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 1800);
  };

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'push':
        return (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            backgroundColor: '#e2eff2',
            color: '#2b6777',
            padding: '3px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            push
          </span>
        );
      case 'pull_request':
        return (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            backgroundColor: '#e6f6f3',
            color: '#52ab98',
            padding: '3px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            pull_request
          </span>
        );
      case 'workflow_run':
        return (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            backgroundColor: '#c8d8e4',
            color: '#1c3d44',
            padding: '3px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            workflow_run
          </span>
        );
      default:
        return (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            backgroundColor: '#f2f2f2',
            color: '#527982',
            padding: '3px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            {event}
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Webhook Endpoint Banner */}
      <div style={{
        backgroundColor: '#e2eff2',
        border: '1px solid #c8d8e4',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#2b6777',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={18} />
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1c3d44', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Webhook Receiver Endpoint:</span>
              <code style={{ color: '#2b6777', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #c8d8e4' }}>
                {repoSettings.webhookUrl}
              </code>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#527982', marginTop: '2px' }}>
              Status: <strong style={{ color: '#52ab98' }}>🟢 Ingestion Pipeline Active</strong> • HMAC-SHA256 signature verification enabled
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsWebhookSimulatorOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#52ab98',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(82, 171, 152, 0.3)'
          }}
        >
          <Zap size={14} /> Simulate Incoming Webhook
        </button>
      </div>

      {/* Deliveries Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projectEvents.map(event => {
          const isExpanded = expandedId === event.id;
          return (
            <div
              key={event.id}
              className="pastel-card animate-fade-in"
              style={{
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Event Header Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#e6f6f3',
                    color: '#52ab98'
                  }}>
                    <CheckCircle2 size={12} /> 200 OK
                  </span>

                  {getEventBadge(event.event)}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <img src={event.senderAvatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>@{event.sender}</span>
                  </div>

                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {event.summary}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{event.timestamp}</span>
                  </div>

                  <button
                    style={{
                      padding: '4px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expandable JSON Payload Viewer */}
              {isExpanded && (
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2b6777', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Code2 size={13} /> Parsed Webhook Payload (JSON):
                    </span>

                    <button
                      onClick={() => handleCopyPayload(event.id, event.payload)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #c8d8e4',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#2b6777'
                      }}
                    >
                      {copiedPayloadId === event.id ? <Check size={12} color="#52ab98" /> : <Copy size={12} />}
                      {copiedPayloadId === event.id ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>

                  <pre style={{
                    backgroundColor: '#1c3d44',
                    color: '#c8d8e4',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
