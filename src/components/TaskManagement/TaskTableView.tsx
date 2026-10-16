import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Task, TaskStage, Priority } from '../../types';
import {
  CheckCircle2,
  Clock,
  Eye,
  ListTodo,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  GitPullRequest,
  GitCommit
} from 'lucide-react';

export const TaskTableView: React.FC = () => {
  const {
    tasks,
    activeProject,
    searchQuery,
    priorityFilter,
    assigneeFilter,
    moveTaskStage,
    deleteTask,
    setEditingTask,
    setIsTaskModalOpen,
    toggleSubTask,
    commits
  } = useApp();

  const [stageFilter, setStageFilter] = useState<TaskStage | 'all'>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const projectTasks = tasks.filter(t => t.projectId === activeProject.id);

  const filteredTasks = projectTasks.filter(t => {
    if (stageFilter !== 'all' && t.stage !== stageFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && t.assigneeId !== assigneeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchAssignee = t.assigneeName.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchTag = t.tags.some(tag => tag.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchAssignee || matchId || matchTag;
    }
    return true;
  });

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#fae3e3',
            color: '#a82a2a',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            Urgent 🔥
          </span>
        );
      case 'high':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#fee9d7',
            color: '#a65100',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            High ⚡
          </span>
        );
      case 'medium':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#e2eff2',
            color: '#2b6777',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            Medium 📌
          </span>
        );
      case 'low':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#e6f6f3',
            color: '#195239',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            Low 🌿
          </span>
        );
    }
  };

  const stageOptions: { key: TaskStage; label: string; icon: React.ReactNode; bg: string; color: string; border: string }[] = [
    { key: 'todo', label: 'To Do', icon: <ListTodo size={13} />, bg: '#f2f2f2', color: '#2b6777', border: '#c8d8e4' },
    { key: 'in_progress', label: 'In Progress', icon: <Clock size={13} />, bg: '#eef6f8', color: '#2b6777', border: '#2b6777' },
    { key: 'review', label: 'In Review', icon: <Eye size={13} />, bg: '#c8d8e4', color: '#1c3d44', border: '#2b6777' },
    { key: 'done', label: 'Done', icon: <CheckCircle2 size={13} />, bg: '#e6f6f3', color: '#195239', border: '#52ab98' }
  ];

  const todoCount = projectTasks.filter(t => t.stage === 'todo').length;
  const inProgressCount = projectTasks.filter(t => t.stage === 'in_progress').length;
  const reviewCount = projectTasks.filter(t => t.stage === 'review').length;
  const doneCount = projectTasks.filter(t => t.stage === 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Stage Quick Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStageFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: stageFilter === 'all' ? '#2b6777' : '#ffffff',
              color: stageFilter === 'all' ? '#ffffff' : '#2b6777',
              border: '1px solid',
              borderColor: stageFilter === 'all' ? '#2b6777' : '#c8d8e4',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            All Tasks ({projectTasks.length})
          </button>

          <button
            onClick={() => setStageFilter('todo')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: stageFilter === 'todo' ? '#2b6777' : '#ffffff',
              color: stageFilter === 'todo' ? '#ffffff' : '#2b6777',
              border: '1px solid',
              borderColor: stageFilter === 'todo' ? '#2b6777' : '#c8d8e4',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ListTodo size={14} /> To Do ({todoCount})
          </button>

          <button
            onClick={() => setStageFilter('in_progress')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: stageFilter === 'in_progress' ? '#2b6777' : '#ffffff',
              color: stageFilter === 'in_progress' ? '#ffffff' : '#2b6777',
              border: '1px solid',
              borderColor: stageFilter === 'in_progress' ? '#2b6777' : '#c8d8e4',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={14} /> In Progress ({inProgressCount})
          </button>

          <button
            onClick={() => setStageFilter('review')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: stageFilter === 'review' ? '#2b6777' : '#ffffff',
              color: stageFilter === 'review' ? '#ffffff' : '#2b6777',
              border: '1px solid',
              borderColor: stageFilter === 'review' ? '#2b6777' : '#c8d8e4',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Eye size={14} /> In Review ({reviewCount})
          </button>

          <button
            onClick={() => setStageFilter('done')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: stageFilter === 'done' ? '#52ab98' : '#ffffff',
              color: stageFilter === 'done' ? '#ffffff' : '#195239',
              border: '1px solid',
              borderColor: stageFilter === 'done' ? '#52ab98' : '#c8d8e4',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={14} /> Done ({doneCount})
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredTasks.length} of {projectTasks.length} tasks
        </div>
      </div>

      {/* Main Tabular View */}
      {filteredTasks.length === 0 ? (
        <div className="pastel-card" style={{ padding: '64px 24px', textAlign: 'center', backgroundColor: '#ffffff' }}>
          <CheckSquare size={42} color="#c8d8e4" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            No Tasks Match Filter
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '6px 0 16px 0' }}>
            Try adjusting your stage, priority, or search query.
          </p>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            + Create New Task
          </button>
        </div>
      ) : (
        <div className="pastel-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
          overflowX: 'auto',
          width: '100%'
        }}>
          <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                backgroundColor: '#eef6f8',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#2b6777',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '14px 18px', width: '36%' }}>Task ID & Summary</th>
                <th style={{ padding: '14px 12px', width: '15%' }}>Stage</th>
                <th style={{ padding: '14px 12px', width: '12%' }}>Priority</th>
                <th style={{ padding: '14px 12px', width: '14%' }}>Assignee</th>
                <th style={{ padding: '14px 12px', width: '13%' }}>Subtasks</th>
                <th style={{ padding: '14px 18px', width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task: Task) => {
                const isExpanded = !!expandedTaskIds[task.id];
                const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                const totalSubtasks = task.subtasks.length;
                const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                const taskCommits = commits.filter(c => c.linkedTaskId === task.id);

                return (
                  <React.Fragment key={task.id}>
                    <tr style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: '#ffffff',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      {/* Task ID & Title */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#2b6777',
                            backgroundColor: '#e2eff2',
                            border: '1px solid #c8d8e4',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'monospace',
                            flexShrink: 0
                          }}>
                            {task.id}
                          </span>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                            <div
                              onClick={() => {
                                setEditingTask(task);
                                setIsTaskModalOpen(true);
                              }}
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                lineHeight: 1.3
                              }}
                              title="Click to view/edit task"
                            >
                              {task.title}
                            </div>

                            <div style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.4,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '420px'
                            }}>
                              {task.description}
                            </div>

                            {/* Tags & Git Badges Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                              {task.tags.map(tag => (
                                <span key={tag} style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  backgroundColor: '#f2f2f2',
                                  color: '#2b6777',
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-pill)',
                                  border: '1px solid #c8d8e4'
                                }}>
                                  #{tag}
                                </span>
                              ))}

                              {task.githubPR && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: '#e2eff2',
                                  color: '#2b6777',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #c8d8e4'
                                }}>
                                  <GitPullRequest size={10} /> {task.githubPR}
                                </span>
                              )}

                              {taskCommits.length > 0 && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: '#e6f6f3',
                                  color: '#195239',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #52ab98'
                                }}>
                                  <GitCommit size={10} color="#52ab98" /> {taskCommits.length} commit{taskCommits.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stage Selector */}
                      <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                        <select
                          value={task.stage}
                          onChange={(e) => moveTaskStage(task.id, e.target.value as TaskStage)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid',
                            borderColor: task.stage === 'done' ? '#52ab98' : '#2b6777',
                            backgroundColor: task.stage === 'done' ? '#e6f6f3' : task.stage === 'in_progress' ? '#eef6f8' : '#ffffff',
                            color: task.stage === 'done' ? '#195239' : '#2b6777',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          {stageOptions.map(s => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                        {getPriorityBadge(task.priority)}
                      </td>

                      {/* Assignee */}
                      <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                            {task.assigneeName}
                          </span>
                        </div>
                      </td>

                      {/* Subtasks Progress */}
                      <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                        {totalSubtasks > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => toggleExpand(task.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#2b6777',
                                cursor: 'pointer'
                              }}
                            >
                              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                              <span>{completedSubtasks}/{totalSubtasks} ({progressPercent}%)</span>
                            </button>
                            <div style={{ width: '70px', height: '5px', backgroundColor: '#f2f2f2', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                              <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                backgroundColor: progressPercent === 100 ? '#52ab98' : '#2b6777',
                                borderRadius: 'var(--radius-pill)',
                                transition: 'width 0.2s ease'
                              }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            title="Edit Task"
                            style={{
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            title="Delete Task"
                            style={{
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--border-color)',
                              color: '#a82a2a',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Subtask Checklist Rows */}
                    {isExpanded && totalSubtasks > 0 && (
                      <tr style={{ backgroundColor: '#f9fbfc', borderBottom: '1px solid var(--border-color)' }}>
                        <td colSpan={6} style={{ padding: '10px 18px 14px 44px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2b6777', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Subtask Checklist for {task.id}:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                              {task.subtasks.map(st => (
                                <label
                                  key={st.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.8rem',
                                    color: st.completed ? 'var(--text-light)' : 'var(--text-main)',
                                    textDecoration: st.completed ? 'line-through' : 'none',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #c8d8e4',
                                    borderRadius: 'var(--radius-sm)'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => toggleSubTask(task.id, st.id)}
                                    style={{ accentColor: '#2b6777', cursor: 'pointer' }}
                                  />
                                  <span>{st.title}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
