import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Download,
  Search,
  Sparkles,
  ExternalLink,
  GitBranch,
  GitCommit
} from 'lucide-react';

export const BuildLogModal: React.FC = () => {
  const { selectedRunForLogs, setSelectedRunForLogs } = useApp();
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [showAIDiagnosis, setShowAIDiagnosis] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);

  if (!selectedRunForLogs) return null;

  const currentJob = selectedRunForLogs.jobs.find(j => j.id === activeJobId) || selectedRunForLogs.jobs[0];
  const currentStep = currentJob?.steps[activeStepIndex] || currentJob?.steps[0];

  // Aggregate all logs in current job or step
  const activeLogs = currentStep ? currentStep.logs : currentJob?.steps.flatMap(s => s.logs) || [];
  
  const filteredLogs = searchQuery.trim()
    ? activeLogs.filter(line => line.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeLogs;

  const handleCopyLogs = () => {
    const text = activeLogs.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = activeLogs.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-${selectedRunForLogs.runNumber}-${currentJob?.name.toLowerCase().replace(/\s+/g, '-')}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFailed = selectedRunForLogs.status === 'failure';

  const mockAIFix = `// Fix in src/components/TaskManagement/KanbanBoard.tsx (Line 74)
- moveTaskStage(draggedTaskId, targetColumn);
+ // Ensure atomic stage transition to prevent race conditions during drag drop
+ setColumns(prev => {
+   const updated = { ...prev };
+   return updated;
+ });
+ moveTaskStage(draggedTaskId, targetColumn);`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(28, 61, 68, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '24px'
    }}>
      <div className="pastel-card animate-modal-pop" style={{
        width: '100%',
        maxWidth: '1080px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
        backgroundColor: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: '#eef6f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selectedRunForLogs.status === 'success' ? '#e2f5ed' :
                selectedRunForLogs.status === 'failure' ? '#ffe4e6' : '#e0f2fe',
              color: selectedRunForLogs.status === 'success' ? '#2e9367' :
                selectedRunForLogs.status === 'failure' ? '#e11d48' : '#0284c7',
              flexShrink: 0
            }}>
              {selectedRunForLogs.status === 'success' && <CheckCircle2 size={24} />}
              {selectedRunForLogs.status === 'failure' && <XCircle size={24} />}
              {selectedRunForLogs.status === 'in_progress' && <Loader2 size={24} className="animate-spin" />}
              {selectedRunForLogs.status === 'cancelled' && <AlertTriangle size={24} />}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: selectedRunForLogs.status === 'success' ? '#2e9367' :
                    selectedRunForLogs.status === 'failure' ? '#e11d48' : '#0284c7',
                  color: '#ffffff'
                }}>
                  {selectedRunForLogs.status === 'in_progress' ? 'Running' : selectedRunForLogs.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  #{selectedRunForLogs.runNumber} — {selectedRunForLogs.name}
                </span>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#2b6777',
                  backgroundColor: '#c8d8e4',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <GitBranch size={11} /> {selectedRunForLogs.branch}
                </span>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <GitCommit size={12} /> {selectedRunForLogs.commitSha}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                "{selectedRunForLogs.commitMessage}" • Triggered by <strong>{selectedRunForLogs.authorName}</strong> ({selectedRunForLogs.startedAt}) • Duration: <strong>{selectedRunForLogs.duration}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {selectedRunForLogs.htmlUrl && (
              <a
                href={selectedRunForLogs.htmlUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: '#2b6777',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                GitHub Actions <ExternalLink size={12} />
              </a>
            )}
            <button
              onClick={() => setSelectedRunForLogs(null)}
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
        </div>

        {/* AI Failure Diagnostics Banner (if failed) */}
        {isFailed && (
          <div style={{
            backgroundColor: '#fff1f2',
            borderBottom: '1px solid #fecdd3',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#9f1239' }}>
                  Build Failed: 2 tests failed in src/tests/kanban.test.ts:74
                </div>
                <div style={{ fontSize: '0.76rem', color: '#be123c' }}>
                  Root Cause: AssertionError: Expected 'review' to equal 'in_progress'. Race condition during drag-and-drop state promotion.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAIDiagnosis(!showAIDiagnosis)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)'
              }}
            >
              <Sparkles size={14} /> {showAIDiagnosis ? 'Hide AI Solution' : '🤖 Explain Failure with AI'}
            </button>
          </div>
        )}

        {/* Expandable AI Diagnosis Drawer */}
        {showAIDiagnosis && isFailed && (
          <div className="animate-fade-in" style={{
            backgroundColor: '#1c1917',
            color: '#f5f5f4',
            padding: '18px 24px',
            borderBottom: '2px solid #e11d48',
            fontSize: '0.84rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontWeight: 800 }}>
                <Sparkles size={16} /> DevFlow AI Diagnostic Engine (Module 5 Bridge)
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(mockAIFix);
                  setCopiedFix(true);
                  setTimeout(() => setCopiedFix(false), 2000);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#292524',
                  color: '#e7e5e4',
                  fontSize: '0.74rem',
                  border: '1px solid #44403c'
                }}
              >
                {copiedFix ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                {copiedFix ? 'Copied!' : 'Copy Proposed Code Fix'}
              </button>
            </div>

            <p style={{ color: '#d6d3d1', lineHeight: 1.5, marginBottom: '10px' }}>
              <strong>Analysis:</strong> The test runner dispatched a simulated HTML5 drag-and-drop event on the task card, triggering an asynchronous transition handler. Because state changes were batched, the assertion at line 74 evaluated before the updated task stage could settle.
            </p>

            <div style={{
              backgroundColor: '#0c0a09',
              borderRadius: '6px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: '#34d399',
              whiteSpace: 'pre-wrap',
              border: '1px solid #292524'
            }}>
              {mockAIFix}
            </div>
          </div>
        )}

        {/* Modal Body with Jobs/Steps Sidebar & Terminal Output */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Left Column: Jobs and Steps Explorer */}
          <div style={{
            width: '280px',
            borderRight: '1px solid var(--border-color)',
            backgroundColor: '#fafbfc',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '16px 12px'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em', paddingLeft: '8px' }}>
              PIPELINE JOBS ({selectedRunForLogs.jobs.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedRunForLogs.jobs.map(job => (
                <div key={job.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setActiveJobId(job.id);
                      setActiveStepIndex(0);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: (activeJobId === job.id || (!activeJobId && job === selectedRunForLogs.jobs[0])) ? '#e2eff2' : 'transparent',
                      color: (activeJobId === job.id || (!activeJobId && job === selectedRunForLogs.jobs[0])) ? '#2b6777' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      {job.status === 'completed' && <CheckCircle2 size={14} color="#2e9367" />}
                      {job.status === 'failed' && <XCircle size={14} color="#e11d48" />}
                      {job.status === 'in_progress' && <Loader2 size={14} color="#0284c7" className="animate-spin" />}
                      {job.status === 'queued' && <Clock size={14} color="#527982" />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{job.duration}</span>
                  </button>

                  {/* Steps under this job */}
                  {(activeJobId === job.id || (!activeJobId && job === selectedRunForLogs.jobs[0])) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '16px', borderLeft: '2px solid #c8d8e4', marginLeft: '12px' }}>
                      {job.steps.map((step, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setActiveStepIndex(sIdx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            backgroundColor: activeStepIndex === sIdx ? '#2b6777' : 'transparent',
                            color: activeStepIndex === sIdx ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '0.76rem',
                            fontWeight: activeStepIndex === sIdx ? 700 : 500,
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            {step.status === 'completed' && <Check size={12} color={activeStepIndex === sIdx ? '#ffffff' : '#2e9367'} />}
                            {step.status === 'failed' && <XCircle size={12} color={activeStepIndex === sIdx ? '#ffffff' : '#e11d48'} />}
                            {step.status === 'in_progress' && <Loader2 size={12} color={activeStepIndex === sIdx ? '#ffffff' : '#0284c7'} className="animate-spin" />}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {step.name}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>
                            {step.durationSeconds}s
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Test Outcome Box */}
            {selectedRunForLogs.testOutcome && (
              <div style={{
                marginTop: 'auto',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: selectedRunForLogs.testOutcome.failed > 0 ? '#fff1f2' : '#f0fdf4',
                border: '1px solid',
                borderColor: selectedRunForLogs.testOutcome.failed > 0 ? '#fecdd3' : '#bbf7d0'
              }}>
                <div style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: selectedRunForLogs.testOutcome.failed > 0 ? '#be123c' : '#15803d',
                  marginBottom: '6px'
                }}>
                  TEST SUITE SUMMARY
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div>Total Tests: <strong>{selectedRunForLogs.testOutcome.total}</strong></div>
                  <div>Passed: <strong style={{ color: '#16a34a' }}>{selectedRunForLogs.testOutcome.passed}</strong></div>
                  {selectedRunForLogs.testOutcome.failed > 0 && (
                    <div>Failed: <strong style={{ color: '#dc2626' }}>{selectedRunForLogs.testOutcome.failed}</strong></div>
                  )}
                  <div>Coverage: <strong>{selectedRunForLogs.testOutcome.coveragePercent}%</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Terminal Style Console Output */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            minWidth: 0
          }}>
            {/* Terminal Top Control Bar */}
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid #30363d',
              backgroundColor: '#161b22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                </div>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#8b949e', marginLeft: '6px' }}>
                  runner@ubuntu-24.04: ~/work/devflow/{currentStep?.name || 'logs'}
                </span>
              </div>

              {/* Search & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={13} color="#8b949e" style={{ position: 'absolute', left: '8px' }} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '4px 8px 4px 26px',
                      borderRadius: '4px',
                      backgroundColor: '#0d1117',
                      border: '1px solid #30363d',
                      color: '#c9d1d9',
                      fontSize: '0.76rem',
                      outline: 'none',
                      width: '160px'
                    }}
                  />
                </div>

                <button
                  onClick={handleCopyLogs}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    color: '#c9d1d9',
                    fontSize: '0.74rem',
                    fontWeight: 600
                  }}
                >
                  {copiedLogs ? <Check size={12} color="#3fb950" /> : <Copy size={12} />}
                  {copiedLogs ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleDownloadLogs}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                    color: '#c9d1d9',
                    fontSize: '0.74rem',
                    fontWeight: 600
                  }}
                >
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>

            {/* Scrollable Terminal Output */}
            <div style={{
              flex: 1,
              padding: '16px',
              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
              fontSize: '0.8rem',
              lineHeight: 1.6,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {filteredLogs.length === 0 ? (
                <div style={{ color: '#8b949e', textAlign: 'center', padding: '40px 0' }}>
                  No log entries matched your filter.
                </div>
              ) : (
                filteredLogs.map((line, index) => {
                  const isError = line.includes('FAIL') || line.includes('Error:') || line.includes('[ERROR]') || line.includes('AssertionError');
                  const isSuccess = line.includes('✓') || line.includes('[SUCCESS]') || line.includes('PASSED');
                  const isCommand = line.startsWith('$');
                  const isInfo = line.startsWith('[INFO]');

                  let textColor = '#c9d1d9';
                  if (isError) textColor = '#f85149';
                  else if (isSuccess) textColor = '#3fb950';
                  else if (isCommand) textColor = '#58a6ff';
                  else if (isInfo) textColor = '#8b949e';

                  return (
                    <div key={index} style={{ display: 'flex', gap: '14px' }}>
                      <span style={{ color: '#484f58', width: '30px', textAlign: 'right', userSelect: 'none', flexShrink: 0 }}>
                        {index + 1}
                      </span>
                      <span style={{ color: textColor }}>
                        {line}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
