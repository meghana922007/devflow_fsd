import React from 'react';
import type { WorkflowRun } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ArrowRight,
  Layers
} from 'lucide-react';

interface WorkflowGraphProps {
  run: WorkflowRun;
  onSelectJob?: (jobId: string) => void;
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({ run, onSelectJob }) => {
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
      border: '1px solid var(--border-color)',
      overflowX: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="#2b6777" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            PIPELINE EXECUTION DAG & STAGES
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {run.jobs.length} Job{run.jobs.length !== 1 ? 's' : ''} in Pipeline • Runner: ubuntu-latest
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '600px', paddingBottom: '4px' }}>
        {run.jobs.map((job, idx) => {
          const isLast = idx === run.jobs.length - 1;
          const isJobSuccess = job.status === 'completed';
          const isJobFailed = job.status === 'failed';
          const isJobRunning = job.status === 'in_progress';

          return (
            <React.Fragment key={job.id}>
              <div
                onClick={() => onSelectJob && onSelectJob(job.id)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid',
                  borderColor: isJobSuccess ? '#bbf7d0' :
                    isJobFailed ? '#fecdd3' :
                    isJobRunning ? '#38bdf8' : '#e2e8f0',
                  boxShadow: isJobRunning ? '0 0 12px rgba(56, 189, 248, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
                  cursor: onSelectJob ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Status Dot & Duration */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isJobSuccess && <CheckCircle2 size={15} color="#16a34a" />}
                    {isJobFailed && <XCircle size={15} color="#dc2626" />}
                    {isJobRunning && <Loader2 size={15} color="#0284c7" className="animate-spin" />}
                    {job.status === 'queued' && <Clock size={15} color="#94a3b8" />}
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: isJobSuccess ? '#16a34a' :
                        isJobFailed ? '#dc2626' :
                        isJobRunning ? '#0284c7' : '#64748b'
                    }}>
                      {job.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {job.duration}
                  </span>
                </div>

                {/* Job Name */}
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {job.name}
                </div>

                {/* Steps Mini Progress Bar */}
                <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                  {job.steps.map((st, sIdx) => (
                    <div
                      key={sIdx}
                      title={`${st.name} (${st.status})`}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        backgroundColor: st.status === 'completed' ? '#16a34a' :
                          st.status === 'failed' ? '#dc2626' :
                          st.status === 'in_progress' ? '#38bdf8' : '#e2e8f0'
                      }}
                    />
                  ))}
                </div>
              </div>

              {!isLast && (
                <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
