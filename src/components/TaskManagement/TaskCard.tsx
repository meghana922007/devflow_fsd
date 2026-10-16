import React, { useState } from 'react';
import type { Task, TaskStage, Priority } from '../../types';
import { useApp } from '../../context/AppContext';
import { Calendar, GitPullRequest, GitCommit, CheckSquare, Trash2, Edit2, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { moveTaskStage, deleteTask, setEditingTask, setIsTaskModalOpen, toggleSubTask, commits } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [showSubtasks, setShowSubtasks] = useState(false);

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent': return <span className="badge badge-coral">Urgent 🔥</span>;
      case 'high': return <span className="badge badge-rose">High ⚡</span>;
      case 'medium': return <span className="badge badge-peach">Medium 📌</span>;
      case 'low': return <span className="badge badge-sky">Low 🌿</span>;
    }
  };

  const stages: { key: TaskStage; label: string }[] = [
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'review', label: 'In Review' },
    { key: 'done', label: 'Done' }
  ];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) scale(1.01)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    });
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`pastel-card animate-fade-in ${isDragging ? 'card-dragging' : ''}`}
      style={{
        padding: '16px',
        position: 'relative',
        ...tiltStyle
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-light)', cursor: 'grab', display: 'flex', alignItems: 'center' }} title="Drag task to move between columns">
            <GripVertical size={15} />
          </span>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#2b6777',
            backgroundColor: '#e2eff2',
            border: '1px solid #c8d8e4',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)'
          }}>
            {task.id}
          </span>
          {getPriorityBadge(task.priority)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
            title="Edit Task"
            style={{ padding: '4px', color: 'var(--text-light)', borderRadius: '4px' }}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            title="Delete Task"
            style={{ padding: '4px', color: 'var(--pastel-rose-dark)', borderRadius: '4px' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h4 style={{
        fontSize: '0.96rem',
        fontWeight: 700,
        color: 'var(--text-main)',
        marginBottom: '6px',
        lineHeight: 1.3
      }}>
        {task.title}
      </h4>

      <p style={{
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        marginBottom: '14px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {task.description}
      </p>

      {totalSubtasks > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setShowSubtasks(!showSubtasks)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#2b6777',
                fontWeight: 700,
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              <CheckSquare size={12} color="#2b6777" />
              <span>{completedSubtasks}/{totalSubtasks} Subtasks ({progressPercent}%)</span>
            </button>
            <span style={{ fontSize: '0.7rem', color: '#527982' }}>
              {showSubtasks ? '▲ Hide' : '▼ View'}
            </span>
          </div>
          <div style={{ height: '5px', backgroundColor: '#f2f2f2', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? '#52ab98' : '#2b6777',
              borderRadius: 'var(--radius-pill)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {showSubtasks && (
            <div className="animate-fade-in" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {task.subtasks.map(st => (
                <label key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: st.completed ? 'var(--text-light)' : 'var(--text-main)', textDecoration: st.completed ? 'line-through' : 'none', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubTask(task.id, st.id)}
                    style={{ accentColor: '#2b6777', cursor: 'pointer' }}
                  />
                  {st.title}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {task.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
          {task.tags.map((tag, idx) => (
            <span key={idx} style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {task.githubPR && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--pastel-sky)',
          color: 'var(--pastel-sky-text)',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '12px'
        }}>
          <GitPullRequest size={13} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.githubPR}
          </span>
        </div>
      )}

      {/* Linked Commits Telemetry */}
      {commits.filter(c => c.linkedTaskId === task.id).length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#e6f6f3',
          color: '#195239',
          border: '1px solid #52ab98',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '10px'
        }}>
          <GitCommit size={12} color="#52ab98" />
          <span>
            {commits.filter(c => c.linkedTaskId === task.id).length} linked commit{commits.filter(c => c.linkedTaskId === task.id).length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={task.assigneeAvatar}
            alt={task.assigneeName}
            title={`Assigned to ${task.assigneeName}`}
            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Calendar size={12} />
            <span>{task.dueDate}</span>
          </div>
        </div>

        <select
          value={task.stage}
          onChange={(e) => moveTaskStage(task.id, e.target.value as TaskStage)}
          style={{
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-main)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--pastel-lavender-dark)',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {stages.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
