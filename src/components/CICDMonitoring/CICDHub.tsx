import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Clock,
  Terminal,
  RefreshCw,
  Search,
  GitBranch,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  StopCircle
} from 'lucide-react';
import { WorkflowGraph } from './WorkflowGraph';

export const CICDHub: React.FC = () => {
  const {
    activeProject,
    workflowRuns,
    setSelectedRunForLogs,
    setIsDispatchModalOpen,
    cancelWorkflowRun,
    rerunWorkflowRun,
    fetchWorkflowRuns,
    isFetchingWorkflows,
    repoSettings,
    branches
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGraphRunId, setExpandedGraphRunId] = useState<string | null>(null);

  const projectRuns = workflowRuns.filter(r => r.projectId === activeProject.id || !r.projectId);

  // Filter runs
  const filteredRuns = projectRuns.filter(run => {
    if (statusFilter !== 'all' && run.status !== statusFilter) return false;
    if (workflowFilter !== 'all' && run.name !== workflowFilter) return false;
    if (branchFilter !== 'all' && run.branch !== branchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = run.commitMessage.toLowerCase().includes(q);
      const matchSha = run.commitSha.toLowerCase().includes(q);
      const matchAuthor = run.authorName.toLowerCase().includes(q);
      const matchName = run.name.toLowerCase().includes(q);
      if (!matchMsg && !matchSha && !matchAuthor && !matchName) return false;
    }
    return true;
  });

  // Telemetry Calculations
  const totalRuns = projectRuns.length;
  const passedRuns = projectRuns.filter(r => r.status === 'success').length;
  const failedRuns = projectRuns.filter(r => r.status === 'failure').length;
  const activeRuns = projectRuns.filter(r => r.status === 'in_progress');
  const passRate = totalRuns > 0 ? Math.round((passedRuns / (passedRuns + failedRuns || 1)) * 100) : 100;

  // Average Duration calculation
  const completedWithDur = projectRuns.filter(r => r.durationSeconds > 0 && r.status !== 'in_progress');
  const avgSec = completedWithDur.length > 0
    ? Math.round(completedWithDur.reduce((acc, r) => acc + r.durationSeconds, 0) / completedWithDur.length)
    : 72;
  const avgDurationStr = `${Math.floor(avgSec / 60)}m ${avgSec % 60}s`;

  const distinctWorkflows = Array.from(new Set(projectRuns.map(r => r.name)));

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner - Module 4 CI/CD Hero Bar */}
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
            <Cpu size={28} />
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
                MODULE 4: CI/CD PIPELINE MONITORING
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
                <CheckCircle2 size={12} /> GitHub Actions Connected
              </span>
              {activeRuns.length > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#38bdf8',
                  color: '#0c4a6e',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  <Loader2 size={12} className="animate-spin" /> {activeRuns.length} Running Live
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Automated Pipelines & Workflows
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

            <p style={{ fontSize: '0.84rem', color: '#c8d8e4', marginTop: '3px' }}>
              Real-time workflow runs, build diagnostics, test coverage telemetry, and one-click AI failure explanations.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchWorkflowRuns()}
            disabled={isFetchingWorkflows}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: isFetchingWorkflows ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={isFetchingWorkflows ? 'animate-spin' : ''} />
            {isFetchingWorkflows ? 'Syncing...' : 'Refresh Actions'}
          </button>

          <button
            onClick={() => setIsDispatchModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#52ab98',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(82, 171, 152, 0.35)'
            }}
          >
            <Play size={15} fill="#ffffff" /> Run Pipeline
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="pastel-card" style={{ padding: '18px 20px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              TOTAL WORKFLOW RUNS
            </span>
            <Layers size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {totalRuns}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Across all project branches
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '18px 20px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
              BUILD PASS RATE
            </span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {passRate}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {passedRuns} passed / {failedRuns} failed
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '18px 20px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              AVG BUILD DURATION
            </span>
            <Clock size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {avgDurationStr}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Runner: ubuntu-latest
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '18px 20px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeRuns.length > 0 ? '#0284c7' : 'var(--text-muted)', textTransform: 'uppercase' }}>
              ACTIVE PIPELINES
            </span>
            <Loader2 size={18} color={activeRuns.length > 0 ? '#0284c7' : '#94a3b8'} className={activeRuns.length > 0 ? 'animate-spin' : ''} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {activeRuns.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activeRuns.length > 0 ? 'Processing job matrix' : 'All jobs idle'}
          </div>
        </div>
      </div>

      {/* Active Pipeline Live Monitor (if any runs in progress) */}
      {activeRuns.length > 0 && (
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid #bae6fd',
          padding: '18px 24px',
          boxShadow: '0 4px 16px rgba(186, 230, 253, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                boxShadow: '0 0 10px #0284c7'
              }} className="animate-pulse" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                LIVE RUNNING PIPELINE: {activeRuns[0].name} #{activeRuns[0].runNumber}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>
                Elapsed: {activeRuns[0].duration}
              </span>
              <button
                onClick={() => setSelectedRunForLogs(activeRuns[0])}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #bae6fd',
                  color: '#0369a1',
                  fontSize: '0.76rem',
                  fontWeight: 700
                }}
              >
                <Terminal size={13} /> Stream Terminal
              </button>
              <button
                onClick={() => cancelWorkflowRun(activeRuns[0].id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.76rem',
                  fontWeight: 700
                }}
              >
                <StopCircle size={13} /> Cancel Run
              </button>
            </div>
          </div>

          {/* Embedded DAG Graph for running pipeline */}
          <WorkflowGraph run={activeRuns[0]} onSelectJob={() => setSelectedRunForLogs(activeRuns[0])} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="pastel-card" style={{
        padding: '14px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Status Filter Pills */}
          {[
            { id: 'all', label: 'All Runs' },
            { id: 'success', label: 'Passed ✅' },
            { id: 'failure', label: 'Failed ❌' },
            { id: 'in_progress', label: 'Running ⏳' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: statusFilter === pill.id ? '#2b6777' : '#f2f2f2',
                color: statusFilter === pill.id ? '#ffffff' : 'var(--text-main)',
                border: '1px solid',
                borderColor: statusFilter === pill.id ? '#2b6777' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              {pill.label}
            </button>
          ))}

          {/* Workflow Filter Dropdown */}
          <select
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#f8fafc',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Workflows</option>
            {distinctWorkflows.map(wf => (
              <option key={wf} value={wf}>{wf}</option>
            ))}
          </select>

          {/* Branch Filter Dropdown */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#f8fafc',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Branches</option>
            {branches.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} color="#527982" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Search commits, authors, SHAs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '7px 12px 7px 34px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#f8fafc',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              outline: 'none',
              width: '240px'
            }}
          />
        </div>
      </div>

      {/* Workflow Runs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRuns.length === 0 ? (
          <div className="pastel-card" style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)'
          }}>
            <Cpu size={36} color="#527982" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              No Workflow Runs Found
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
              No CI/CD pipeline runs matched your active filters or search criteria.
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setWorkflowFilter('all');
                setBranchFilter('all');
                setSearchQuery('');
              }}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredRuns.map(run => {
            const isSuccess = run.status === 'success';
            const isFail = run.status === 'failure';
            const isRunning = run.status === 'in_progress';
            const isExpanded = expandedGraphRunId === run.id;

            return (
              <div
                key={run.id}
                className="pastel-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid',
                  borderColor: isSuccess ? '#e2f5ed' :
                    isFail ? '#fecdd3' :
                    isRunning ? '#bae6fd' : 'var(--border-color)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Main Run Row */}
                <div style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  {/* Left: Status Icon & Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSuccess ? '#e2f5ed' :
                        isFail ? '#ffe4e6' :
                        isRunning ? '#e0f2fe' : '#f1f5f9',
                      color: isSuccess ? '#2e9367' :
                        isFail ? '#e11d48' :
                        isRunning ? '#0284c7' : '#64748b',
                      flexShrink: 0
                    }}>
                      {isSuccess && <CheckCircle2 size={20} />}
                      {isFail && <XCircle size={20} />}
                      {isRunning && <Loader2 size={20} className="animate-spin" />}
                      {run.status === 'cancelled' && <AlertTriangle size={20} />}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {run.name}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0'
                        }}>
                          #{run.runNumber}
                        </span>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: isSuccess ? '#dcfce7' :
                            isFail ? '#fee2e2' :
                            isRunning ? '#e0f2fe' : '#f1f5f9',
                          color: isSuccess ? '#166534' :
                            isFail ? '#991b1b' :
                            isRunning ? '#075985' : '#475569',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          textTransform: 'uppercase'
                        }}>
                          {isRunning ? 'RUNNING' : run.status.toUpperCase()}
                        </span>
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
                          <GitBranch size={11} /> {run.branch}
                        </span>
                      </div>

                      {/* Commit info and metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          "{run.commitMessage}"
                        </span>
                        <span>•</span>
                        <span style={{ fontFamily: 'monospace', color: '#2b6777' }}>
                          {run.commitSha}
                        </span>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <img
                            src={run.authorAvatar}
                            alt={run.authorName}
                            style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span>{run.authorName}</span>
                        </div>
                        <span>•</span>
                        <span>{run.startedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right Telemetry Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    {/* Test suite badge */}
                    {run.testOutcome && (
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: run.testOutcome.failed > 0 ? '#fff1f2' : '#f0fdf4',
                        border: '1px solid',
                        borderColor: run.testOutcome.failed > 0 ? '#fecdd3' : '#bbf7d0',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontWeight: 800,
                          color: run.testOutcome.failed > 0 ? '#be123c' : '#15803d'
                        }}>
                          {run.testOutcome.passed}/{run.testOutcome.total} Tests
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {run.testOutcome.coveragePercent}% Coverage
                        </span>
                      </div>
                    )}

                    {/* Duration */}
                    <div style={{ textAlign: 'right', minWidth: '70px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {run.duration}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        duration
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedRunForLogs(run)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: '#f2f2f2',
                          border: '1px solid #c8d8e4',
                          color: '#2b6777',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        <Terminal size={13} /> View Logs
                      </button>

                      {isFail && (
                        <button
                          onClick={() => rerunWorkflowRun(run.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '7px 12px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: '#e2eff2',
                            border: '1px solid #c8d8e4',
                            color: '#2b6777',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          <RotateCcw size={13} /> Re-run
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedGraphRunId(isExpanded ? null : run.id)}
                        style={{
                          padding: '7px',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: '#f8fafc',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)'
                        }}
                        title="Toggle Pipeline Execution DAG"
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible DAG Graph View */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 16px 20px' }}>
                    <WorkflowGraph run={run} onSelectJob={() => setSelectedRunForLogs(run)} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
