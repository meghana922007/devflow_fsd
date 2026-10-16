import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { TaskStage, Priority, SubTask } from '../../types';
import { mockUsers } from '../../data/mockData';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, setIsTaskModalOpen, editingTask, addTask, updateTask, activeProject } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<TaskStage>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState(mockUsers[0].id);
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [tags, setTags] = useState('Frontend, UI');
  const [githubPR, setGithubPR] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setStage(editingTask.stage);
      setPriority(editingTask.priority);
      setAssigneeId(editingTask.assigneeId);
      setDueDate(editingTask.dueDate);
      setTags(editingTask.tags.join(', '));
      setGithubPR(editingTask.githubPR || '');
      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStage('todo');
      setPriority('medium');
      setAssigneeId(mockUsers[0].id);
      setDueDate('2026-10-15');
      setTags('Frontend, Core');
      setGithubPR('');
      setSubtasks([
        { id: 'st-new-1', title: 'Write unit tests', completed: false }
      ]);
    }
  }, [editingTask, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [...prev, { id: 'st-' + Date.now(), title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = mockUsers.find(u => u.id === assigneeId) || mockUsers[0];
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        stage,
        priority,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        assigneeAvatar: assignee.avatar,
        dueDate,
        tags: parsedTags,
        githubPR,
        subtasks
      });
    } else {
      addTask({
        projectId: activeProject.id,
        title,
        description,
        stage,
        priority,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        assigneeAvatar: assignee.avatar,
        dueDate,
        tags: parsedTags,
        githubPR,
        subtasks
      });
    }

    setIsTaskModalOpen(false);
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
        maxWidth: '560px',
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
              backgroundColor: 'var(--pastel-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--pastel-lavender-dark)'
            }}>
              <Sparkles size={16} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {editingTask ? `Edit Task (${editingTask.id})` : 'Create New Module 1 Task'}
            </h3>
          </div>

          <button onClick={() => setIsTaskModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              TASK TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement WebSocket state broad-caster"
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
              DESCRIPTION
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of task deliverables..."
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
                STAGE
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as TaskStage)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="low">Low 🌿</option>
                <option value="medium">Medium 📌</option>
                <option value="high">High ⚡</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ASSIGNEE
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
                {mockUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                DUE DATE
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                TAGS (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Frontend, API, Auth"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
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
                LINKED GITHUB PR / BRANCH
              </label>
              <input
                type="text"
                placeholder="#42 - Add Kanban controller"
                value={githubPR}
                onChange={(e) => setGithubPR(e.target.value)}
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
              SUBTASKS CHECKLIST ({subtasks.length})
            </label>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn-secondary"
                style={{ padding: '8px 14px' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {subtasks.map(st => (
                <div key={st.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem'
                }}>
                  <span>{st.title}</span>
                  <button type="button" onClick={() => handleRemoveSubtask(st.id)} style={{ color: 'var(--pastel-rose-dark)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingTask ? 'Save Task Updates' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
