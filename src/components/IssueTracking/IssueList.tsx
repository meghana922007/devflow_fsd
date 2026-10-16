import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { IssueSeverity, IssueStatus } from '../../types';
import { Bug, AlertTriangle, CheckCircle, ShieldAlert, Filter, Plus, Edit2, Trash2, Link as LinkIcon, Monitor } from 'lucide-react';

export const IssueList: React.FC = () => {
  const {
    issues,
    tasks,
    activeProject,
    searchQuery,
    severityFilter,
    setSeverityFilter,
    issueStatusFilter,
    setIssueStatusFilter,
    assigneeFilter,
    updateIssueStatus,
    deleteIssue,
    setIsIssueModalOpen,
    setEditingIssue
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredIssues = issues.filter(issue => {
    if (issue.projectId !== activeProject.id) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchReporter = issue.reporterName.toLowerCase().includes(q);
      const matchAssignee = issue.assigneeName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchReporter && !matchAssignee) return false;
    }

    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (issueStatusFilter !== 'all' && issue.status !== issueStatusFilter) return false;
    if (assigneeFilter !== 'all' && issue.assigneeId !== assigneeFilter) return false;

    return true;
  });

  const getSeverityBadge = (sev: IssueSeverity) => {
    switch (sev) {
      case 'blocker': return <span className="badge badge-coral">Blocker 🚨</span>;
      case 'critical': return <span className="badge badge-rose">Critical ⚠️</span>;
      case 'major': return <span className="badge badge-peach">Major 📌</span>;
      case 'minor': return <span className="badge badge-sky">Minor 🌿</span>;
    }
  };

  const getStatusBadge = (st: IssueStatus) => {
    switch (st) {
      case 'open': return <span className="badge badge-sky">Open</span>;
      case 'triaged': return <span className="badge badge-lavender">Triaged</span>;
      case 'in_fix': return <span className="badge badge-peach">In Fix</span>;
      case 'resolved': return <span className="badge badge-mint">Resolved ✅</span>;
      case 'closed': return <span style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-light)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600 }}>Closed</span>;
    }
  };

  const totalBugs = filteredIssues.length;
  const criticalCount = filteredIssues.filter(i => i.severity === 'critical' || i.severity === 'blocker').length;
  const openCount = filteredIssues.filter(i => i.status === 'open' || i.status === 'triaged' || i.status === 'in_fix').length;
  const resolvedCount = filteredIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#e2eff2', border: '1px solid #c8d8e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b6777', textTransform: 'uppercase' }}>
              TOTAL DEFECTS
            </span>
            <Bug size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1c3d44' }}>
            {totalBugs}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tracked in Module 2
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #c8d8e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b6777', textTransform: 'uppercase' }}>
              OPEN / IN FIX
            </span>
            <AlertTriangle size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1c3d44' }}>
            {openCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Require developer resolution
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#c8d8e4', border: '1px solid #2b6777' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b6777', textTransform: 'uppercase' }}>
              CRITICAL / BLOCKERS
            </span>
            <ShieldAlert size={18} color="#2b6777" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b6777' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1c3d44' }}>
            Immediate priority
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#e6f6f3', border: '1px solid #52ab98' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#52ab98', textTransform: 'uppercase' }}>
              RESOLVED & CLOSED
            </span>
            <CheckCircle size={18} color="#52ab98" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#52ab98' }}>
            {resolvedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--pastel-mint-text)' }}>
            Verified fixes
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 24px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-soft)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Filter size={15} /> Severity:
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-main)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <option value="all">All Severities</option>
            <option value="blocker">Blocker 🚨</option>
            <option value="critical">Critical ⚠️</option>
            <option value="major">Major 📌</option>
            <option value="minor">Minor 🌿</option>
          </select>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
            Status:
          </div>
          <select
            value={issueStatusFilter}
            onChange={(e) => setIssueStatusFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-main)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="triaged">Triaged</option>
            <option value="in_fix">In Fix</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', padding: '3px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                color: viewMode === 'grid' ? 'var(--pastel-lavender-dark)' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Cards Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'table' ? 'white' : 'transparent',
                color: viewMode === 'table' ? 'var(--pastel-lavender-dark)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => { setEditingIssue(null); setIsIssueModalOpen(true); }}
            className="btn-primary"
            style={{
              backgroundColor: '#E05A8D',
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
          >
            <Plus size={15} />
            Report New Bug
          </button>
        </div>
      </div>

      {/* Issues Grid / Table */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px'
        }}>
          {filteredIssues.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
              No defects match the current filters.
            </div>
          ) : (
            filteredIssues.map(issue => {
              const linkedTask = tasks.find(t => t.id === issue.linkedTaskId);

              return (
                <div key={issue.id} className="pastel-card animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: 'var(--pastel-rose-dark)',
                          backgroundColor: 'var(--pastel-rose)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {issue.id}
                        </span>
                        {getSeverityBadge(issue.severity)}
                        {getStatusBadge(issue.status)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => { setEditingIssue(issue); setIsIssueModalOpen(true); }}
                          title="Edit Bug Report"
                          style={{ padding: '4px', color: 'var(--text-light)' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteIssue(issue.id)}
                          title="Delete Bug Report"
                          style={{ padding: '4px', color: 'var(--pastel-rose-dark)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.3 }}>
                      {issue.title}
                    </h4>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                      {issue.description}
                    </p>

                    {issue.reproductionSteps && issue.reproductionSteps.length > 0 && (
                      <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          REPRODUCTION STEPS
                        </div>
                        <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-main)' }}>
                          {issue.reproductionSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      <Monitor size={13} color="var(--pastel-lavender-dark)" />
                      <span>{issue.environment}</span>
                    </div>

                    {linkedTask && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--pastel-lavender)',
                        color: 'var(--pastel-lavender-text)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        marginBottom: '14px'
                      }}>
                        <LinkIcon size={12} /> Linked Task: {linkedTask.id} ({linkedTask.title})
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={issue.assigneeAvatar}
                        alt={issue.assigneeName}
                        title={`Assigned to ${issue.assigneeName}`}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {issue.assigneeName}
                      </span>
                    </div>

                    <select
                      value={issue.status}
                      onChange={(e) => updateIssueStatus(issue.id, e.target.value as IssueStatus)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--pastel-rose-dark)',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="triaged">Triaged</option>
                      <option value="in_fix">In Fix</option>
                      <option value="resolved">Resolved ✅</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="pastel-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Title & Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Severity</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Assignee</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => (
                <tr key={issue.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--pastel-rose-dark)' }}>{issue.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{issue.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{issue.environment}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{getSeverityBadge(issue.severity)}</td>
                  <td style={{ padding: '14px 16px' }}>{getStatusBadge(issue.status)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={issue.assigneeAvatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                      <span>{issue.assigneeName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={issue.status}
                      onChange={(e) => updateIssueStatus(issue.id, e.target.value as IssueStatus)}
                      style={{ padding: '4px 8px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}
                    >
                      <option value="open">Open</option>
                      <option value="triaged">Triaged</option>
                      <option value="in_fix">In Fix</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
