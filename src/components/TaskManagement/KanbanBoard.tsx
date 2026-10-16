import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from './TaskCard';
import { TaskTableView } from './TaskTableView';
import type { TaskStage } from '../../types';
import { mockUsers } from '../../data/mockData';
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  ListTodo,
  Table,
  LayoutGrid
} from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    activeProject,
    searchQuery,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    moveTaskStage,
    setIsTaskModalOpen,
    setEditingTask
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [dragOverColumn, setDragOverColumn] = useState<TaskStage | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (t.projectId !== activeProject.id) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchAssignee = t.assigneeName.toLowerCase().includes(q);
      const matchTag = t.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAssignee && !matchTag) return false;
    }

    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && t.assigneeId !== assigneeFilter) return false;

    return true;
  });

  const getTasksByStage = (stage: TaskStage) => {
    return filteredTasks.filter(t => t.stage === stage);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: TaskStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== stage) {
      setDragOverColumn(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, stage: TaskStage) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      if (dragOverColumn === stage) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStage: TaskStage) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTaskStage(taskId, newStage);
    }
  };

  const columns: { key: TaskStage; title: string; icon: React.ReactNode; bg: string; border: string; badgeBg: string; textColor: string }[] = [
    {
      key: 'todo',
      title: 'To Do',
      icon: <ListTodo size={16} color="#2b6777" />,
      bg: '#f2f2f2',
      border: '#c8d8e4',
      badgeBg: '#e2eff2',
      textColor: '#2b6777'
    },
    {
      key: 'in_progress',
      title: 'In Progress',
      icon: <Clock size={16} color="#2b6777" />,
      bg: '#eef6f8',
      border: '#c8d8e4',
      badgeBg: '#2b6777',
      textColor: '#2b6777'
    },
    {
      key: 'review',
      title: 'In Review',
      icon: <Eye size={16} color="#52ab98" />,
      bg: '#f2f2f2',
      border: '#c8d8e4',
      badgeBg: '#c8d8e4',
      textColor: '#1c3d44'
    },
    {
      key: 'done',
      title: 'Done',
      icon: <CheckCircle2 size={16} color="#52ab98" />,
      bg: '#e6f6f3',
      border: '#52ab98',
      badgeBg: '#52ab98',
      textColor: '#1c3d44'
    }
  ];

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.stage === 'done').length;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top Telemetry & Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '16px 24px',
        border: '1px solid #c8d8e4',
        boxShadow: 'var(--shadow-soft)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Progress Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2b6777', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              PROJECT TASK COMPLETION
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1c3d44' }}>
              {completedTasks} / {totalTasks} Tasks <span style={{ fontSize: '0.9rem', color: '#52ab98', fontWeight: 700 }}>({completionPercent}% Done)</span>
            </div>
          </div>

          <div style={{ width: '160px', height: '8px', backgroundColor: '#f2f2f2', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${completionPercent}%`,
              backgroundColor: '#52ab98',
              borderRadius: 'var(--radius-pill)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Center: View Switcher (Table vs Kanban) */}
        <div style={{
          display: 'inline-flex',
          padding: '3px',
          backgroundColor: '#f2f2f2',
          border: '1px solid #c8d8e4',
          borderRadius: 'var(--radius-pill)',
          gap: '3px'
        }}>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: viewMode === 'table' ? '#2b6777' : 'transparent',
              color: viewMode === 'table' ? '#ffffff' : '#2b6777',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Table size={14} /> Tabular View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: viewMode === 'kanban' ? '#2b6777' : 'transparent',
              color: viewMode === 'kanban' ? '#ffffff' : '#2b6777',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutGrid size={14} /> Board View
          </button>
        </div>

        {/* Right: Filters & New Task Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#2b6777', fontWeight: 700 }}>
            <Filter size={14} />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid #c8d8e4',
              backgroundColor: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1c3d44',
              outline: 'none'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent 🔥</option>
            <option value="high">High ⚡</option>
            <option value="medium">Medium 📌</option>
            <option value="low">Low 🌿</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid #c8d8e4',
              backgroundColor: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1c3d44',
              outline: 'none'
            }}
          >
            <option value="all">All Engineers</option>
            {mockUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <button
            onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* Primary Content View Switch */}
      {viewMode === 'table' ? (
        <TaskTableView />
      ) : (
        /* Proper Structured Kanban Grid View (4 Equal Columns) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
          width: '100%'
        }}>
          {columns.map(col => {
            const colTasks = getTasksByStage(col.key);
            const isOver = dragOverColumn === col.key;

            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
                className={isOver ? 'column-drag-over' : ''}
                style={{
                  backgroundColor: isOver ? '#e2eff2' : col.bg,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: `1px solid ${isOver ? '#2b6777' : col.border}`,
                  minHeight: '620px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingBottom: '10px',
                  borderBottom: `2px solid ${col.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {col.icon}
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: col.textColor }}>
                      {col.title}
                    </h3>
                    <span style={{
                      backgroundColor: col.badgeBg,
                      color: col.textColor,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                    title={`Add task to ${col.title}`}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #c8d8e4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2b6777',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Drop Target Indicator */}
                {isOver && (
                  <div className="drop-placeholder-indicator" style={{ marginBottom: '14px' }}>
                    Drop Task into {col.title}
                  </div>
                )}

                {/* Task Cards Column Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {colTasks.length === 0 ? (
                    <div style={{
                      padding: '32px 16px',
                      textAlign: 'center',
                      color: 'var(--text-light)',
                      fontSize: '0.8rem',
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      {isOver ? 'Drop card here!' : `No tasks in ${col.title}`}
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
