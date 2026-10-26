import React from 'react';
import { useApp } from '../context/AppContext';
import { Kanban, Bug, CheckCircle2, ArrowUpRight, Activity, Cpu } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { tasks, issues, activities, activeProject, setActiveTab, workflowRuns } = useApp();

  const projectTasks = tasks.filter(t => t.projectId === activeProject.id);
  const projectIssues = issues.filter(i => i.projectId === activeProject.id);

  const todoCount = projectTasks.filter(t => t.stage === 'todo').length;
  const inProgressCount = projectTasks.filter(t => t.stage === 'in_progress').length;
  const reviewCount = projectTasks.filter(t => t.stage === 'review').length;
  const doneCount = projectTasks.filter(t => t.stage === 'done').length;
  const totalTasks = projectTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const openBugs = projectIssues.filter(i => i.status !== 'closed' && i.status !== 'resolved');
  const criticalBugs = projectIssues.filter(i => i.severity === 'critical' || i.severity === 'blocker');
  const resolvedBugs = projectIssues.filter(i => i.status === 'resolved' || i.status === 'closed');

  const projectRuns = workflowRuns.filter(r => r.projectId === activeProject.id || !r.projectId);
  const passedPipelines = projectRuns.filter(r => r.status === 'success').length;
  const activePipelines = projectRuns.filter(r => r.status === 'in_progress').length;
  const passRate = projectRuns.length > 0 ? Math.round((passedPipelines / projectRuns.length) * 100) : 100;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner - Solid Color */}
      <div style={{
        backgroundColor: '#2b6777',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        color: 'white',
        boxShadow: '0 8px 24px rgba(43, 103, 119, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}>
            UNIFIED WORKFLOW TELEMETRY
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '10px', marginBottom: '6px' }}>
            Welcome back to {activeProject.name}
          </h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Modules 1, 2, 3 & 4 operational. {inProgressCount} tasks in progress, {openBugs.length} bugs tracked, {passRate}% CI/CD pass rate.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('kanban')}
            style={{
              backgroundColor: 'white',
              color: 'var(--pastel-lavender-text)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            <Kanban size={16} /> Open Kanban <ArrowUpRight size={14} />
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Bug size={16} /> Bug Tracker <ArrowUpRight size={14} />
          </button>
          <button
            onClick={() => setActiveTab('cicd')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '10px 18px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cpu size={16} /> CI/CD Pipelines <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#F0F7FF', border: '1px solid var(--pastel-sky)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--pastel-sky-text)', textTransform: 'uppercase' }}>
              MODULE 1: TASKS
            </span>
            <Kanban size={18} color="var(--pastel-sky-text)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {doneCount}/{totalTasks}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {taskProgress}% Sprint Complete
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#FFF0F3', border: '1px solid var(--pastel-coral)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--pastel-coral-dark)', textTransform: 'uppercase' }}>
              MODULE 2: BUGS
            </span>
            <Bug size={18} color="var(--pastel-coral-dark)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--pastel-coral-dark)' }}>
            {openBugs.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--pastel-coral-text)', marginTop: '4px' }}>
            {criticalBugs.length} Critical / Blocker
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#F0FAF5', border: '1px solid var(--pastel-mint)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--pastel-mint-dark)', textTransform: 'uppercase' }}>
              RESOLVED DEFECTS
            </span>
            <CheckCircle2 size={18} color="var(--pastel-mint-dark)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--pastel-mint-dark)' }}>
            {resolvedBugs.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--pastel-mint-text)', marginTop: '4px' }}>
            Verified in recent builds
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '20px', backgroundColor: '#F0FDF4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
              MODULE 4: CI/CD HEALTH
            </span>
            <Cpu size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d' }}>
            {passRate}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {passedPipelines}/{projectRuns.length} Passed {activePipelines > 0 ? `(${activePipelines} running)` : ''}
          </div>
        </div>
      </div>

      {/* Split Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="pastel-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Kanban size={18} color="var(--pastel-lavender-dark)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Module 1: Kanban Board State Distribution
                </h3>
              </div>
              <button onClick={() => setActiveTab('kanban')} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--pastel-lavender-dark)' }}>
                View Board →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#F0F7FF', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--pastel-sky)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--pastel-sky-text)' }}>TO DO</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{todoCount}</div>
              </div>
              <div style={{ backgroundColor: '#F5F2FF', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--pastel-lavender)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--pastel-lavender-dark)' }}>IN PROGRESS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{inProgressCount}</div>
              </div>
              <div style={{ backgroundColor: '#FFF8F0', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--pastel-peach)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--pastel-peach-dark)' }}>REVIEW</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{reviewCount}</div>
              </div>
              <div style={{ backgroundColor: '#F0FAF5', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--pastel-mint)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--pastel-mint-dark)' }}>DONE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pastel-mint-dark)', marginTop: '4px' }}>{doneCount}</div>
              </div>
            </div>
          </div>

          <div className="pastel-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug size={18} color="var(--pastel-rose-dark)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Module 2: Defect Severity Breakdown
                </h3>
              </div>
              <button onClick={() => setActiveTab('issues')} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--pastel-rose-dark)' }}>
                View Issues →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projectIssues.map(issue => (
                <div key={issue.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--pastel-rose-dark)' }}>{issue.id}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{issue.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${issue.severity === 'blocker' || issue.severity === 'critical' ? 'badge-coral' : 'badge-peach'}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{issue.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pastel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <Activity size={18} color="var(--pastel-lavender-dark)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Real-Time Activity Feed
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {activities.map(act => (
              <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <img
                  src={act.avatar}
                  alt={act.user}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ fontSize: '0.84rem' }}>
                  <div style={{ color: 'var(--text-main)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{act.user}</strong> {act.title}
                  </div>
                  {act.details && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--pastel-coral-dark)', fontWeight: 600 }}>
                      {act.details}
                    </span>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>
                    {act.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
