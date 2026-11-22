import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { IssueSeverity, IssueStatus } from '../../types';
import { X, Bug } from 'lucide-react';

const IssueModalForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { editingIssue, addIssue, updateIssue, activeProject, tasks, users, currentUser } = useApp();

  const defaultAssigneeId = users[1]?.id || users[0]?.id || 'u1';
  const [title, setTitle] = useState(editingIssue?.title ?? '');
  const [description, setDescription] = useState(editingIssue?.description ?? '');
  const [reproductionStepsText, setReproductionStepsText] = useState(
    editingIssue
      ? (editingIssue.reproductionSteps || []).join('\n')
      : '1. Open DevFlow Board\n2. Click Action Button\n3. Observe behavior'
  );
  const [expectedBehavior, setExpectedBehavior] = useState(
    editingIssue?.expectedBehavior ?? 'Action executes cleanly with zero error logs.'
  );
  const [actualBehavior, setActualBehavior] = useState(
    editingIssue?.actualBehavior ?? 'Console warning observed in developer log output.'
  );
  const [severity, setSeverity] = useState<IssueSeverity>(editingIssue?.severity ?? 'major');
  const [status, setStatus] = useState<IssueStatus>(editingIssue?.status ?? 'open');
  const [environment, setEnvironment] = useState(editingIssue?.environment ?? 'MacOS / Chrome 129');
  const [assigneeId, setAssigneeId] = useState(editingIssue?.assigneeId ?? defaultAssigneeId);
  const [linkedTaskId, setLinkedTaskId] = useState<string>(editingIssue?.linkedTaskId ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = users.find(u => u.id === assigneeId) || users[0];
    const stepsArray = reproductionStepsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingIssue) {
      updateIssue(editingIssue.id, {
        title,
        description,
        reproductionSteps: stepsArray,
        expectedBehavior,
        actualBehavior,
        severity,
        status,
        environment,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        assigneeAvatar: assignee.avatar,
        linkedTaskId: linkedTaskId || undefined
      });
    } else {
      addIssue({
        projectId: activeProject.id,
        title,
        description,
        reproductionSteps: stepsArray,
        expectedBehavior,
        actualBehavior,
        severity,
        status,
        environment,
        reporterName: currentUser?.name || 'Developer',
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        assigneeAvatar: assignee.avatar,
        linkedTaskId: linkedTaskId || undefined
      });
    }

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="pastel-card animate-modal-pop" style={{
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--pastel-rose-dark)'
            }}>
              <Bug size={16} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {editingIssue ? `Edit Bug Report (${editingIssue.id})` : 'Report New Defect'}
            </h3>
          </div>

          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              BUG TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Uncaught TypeError in Webhook payload validator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              PROBLEM DESCRIPTION
            </label>
            <textarea
              rows={2}
              placeholder="Clear summary of what failed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                SEVERITY
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="minor">Minor 🌿</option>
                <option value="major">Major 📌</option>
                <option value="critical">Critical ⚠️</option>
                <option value="blocker">Blocker 🚨</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
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

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              REPRODUCTION STEPS (One per line)
            </label>
            <textarea
              rows={3}
              placeholder="1. Step one&#10;2. Step two&#10;3. Trigger error"
              value={reproductionStepsText}
              onChange={(e) => setReproductionStepsText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                EXPECTED BEHAVIOR
              </label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="What should happen"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ACTUAL BEHAVIOR
              </label>
              <input
                type="text"
                value={actualBehavior}
                onChange={(e) => setActualBehavior(e.target.value)}
                placeholder="What actually happened"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ASSIGNED ENGINEER
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ENVIRONMENT
              </label>
              <input
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="e.g. Chrome 129 / Staging API"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              LINK TO TASK (Optional)
            </label>
            <select
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem'
              }}
            >
              <option value="">None (Standalone Defect)</option>
              {tasks.filter(t => t.projectId === activeProject.id).map(t => (
                <option key={t.id} value={t.id}>{t.id} — {t.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: '#E05A8D' }}
            >
              {editingIssue ? 'Save Defect Updates' : 'Report Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const IssueModal: React.FC = () => {
  const { isIssueModalOpen, setIsIssueModalOpen, editingIssue, activeProject } = useApp();

  if (!isIssueModalOpen) return null;

  return (
    <IssueModalForm
      key={editingIssue?.id || `new-${activeProject.id}`}
      onClose={() => setIsIssueModalOpen(false)}
    />
  );
};
