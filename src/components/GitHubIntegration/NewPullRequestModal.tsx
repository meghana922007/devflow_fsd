import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  GitPullRequest,
  Tag,
  Bug
} from 'lucide-react';

export const NewPullRequestModal: React.FC = () => {
  const {
    activeProject,
    branches,
    tasks,
    issues,
    createPullRequest,
    isNewPRModalOpen,
    setIsNewPRModalOpen
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceBranch, setSourceBranch] = useState(branches.find(b => !b.isDefault)?.name || 'feature/new-feature');
  const [targetBranch, setTargetBranch] = useState('main');
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [linkedIssueId, setLinkedIssueId] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  if (!isNewPRModalOpen) return null;

  const projectBranches = branches.filter(b => b.projectId === activeProject.id);
  const projectTasks = tasks.filter(t => t.projectId === activeProject.id);
  const projectIssues = issues.filter(i => i.projectId === activeProject.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sourceBranch.trim()) return;

    createPullRequest({
      title: title.trim(),
      description: description.trim(),
      sourceBranch: sourceBranch.trim(),
      targetBranch,
      linkedTaskId: linkedTaskId || undefined,
      linkedIssueId: linkedIssueId || undefined,
      isDraft
    });

    setTitle('');
    setDescription('');
    setLinkedTaskId('');
    setLinkedIssueId('');
    setIsDraft(false);
    setIsNewPRModalOpen(false);
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
        maxWidth: '650px',
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
              <GitPullRequest size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Create New Pull Request
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Propose changes, link tasks, and initiate automated CI/CD checks.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewPRModalOpen(false)}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Branch Target Flow */}
          <div style={{
            backgroundColor: '#f2f2f2',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1c3d44', marginBottom: '4px' }}>
                Base Branch (Target)
              </label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  outline: 'none',
                  color: '#2b6777'
                }}
              >
                <option value="main">main (default)</option>
                <option value="staging">staging</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#527982', marginTop: '16px' }}>
              <span>←</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1c3d44', marginBottom: '4px' }}>
                Compare Branch (Source)
              </label>
              <input
                type="text"
                required
                list="branch-list"
                value={sourceBranch}
                onChange={(e) => setSourceBranch(e.target.value)}
                placeholder="e.g. feature/my-feature"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  outline: 'none',
                  color: '#1c3d44'
                }}
              />
              <datalist id="branch-list">
                {projectBranches.filter(b => !b.isDefault).map(b => (
                  <option key={b.name} value={b.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* PR Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Pull Request Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. feat(tasks): add 3D perspective tilt to cards"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Description & Changes *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe what changes are included, why they were made, and how to verify..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Task & Bug Cross-Linking */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={13} color="#2b6777" /> Link Module 1 Task
                </span>
              </label>
              <select
                value={linkedTaskId}
                onChange={(e) => setLinkedTaskId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                <option value="">No task linked</option>
                {projectTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.title.substring(0, 26)}... ({t.stage})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                Merging will auto-move task to "Done".
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bug size={13} color="#52ab98" /> Fixes Module 2 Bug
                </span>
              </label>
              <select
                value={linkedIssueId}
                onChange={(e) => setLinkedIssueId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                <option value="">No bug linked</option>
                {projectIssues.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.id}: {i.title.substring(0, 26)}... ({i.severity})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                Auto-links defect ticket to this PR.
              </span>
            </div>
          </div>

          {/* Draft Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#eef6f8',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #c8d8e4'
          }}>
            <input
              type="checkbox"
              id="draft-checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              style={{ accentColor: '#2b6777', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="draft-checkbox" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c3d44', cursor: 'pointer' }}>
              Create as Draft (mark as work in progress before formal review)
            </label>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsNewPRModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <GitPullRequest size={15} /> Create Pull Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
