import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Search,
  FolderGit2,
  Kanban,
  Bug,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ListTodo,
  GitPullRequest
} from 'lucide-react';

export const ProjectsHub: React.FC = () => {
  const {
    projects,
    selectProject,
    tasks,
    issues,
    pullRequests,
    currentUser,
    setIsNewProjectModalOpen,
    setActiveTab
  } = useApp();

  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  // Cross-project work assigned to currentUser
  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id && t.stage !== 'done');
  const myIssues = issues.filter(i => i.assigneeId === currentUser?.id && i.status !== 'closed' && i.status !== 'resolved');
  const myPRs = pullRequests.filter(pr => pr.authorId === currentUser?.id && pr.status === 'open');

  const handleOpenProjectWithTab = (projectId: string, tab: 'kanban' | 'issues' | 'github') => {
    const p = projects.find(proj => proj.id === projectId);
    if (p) {
      selectProject(p);
      setActiveTab(tab);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Welcome Banner */}
      <div style={{
        backgroundColor: '#2b6777',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        color: '#ffffff',
        boxShadow: '0 12px 32px rgba(43, 103, 119, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ zIndex: 2, maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}>
            <Sparkles size={14} /> CENTRAL ORGANIZATION WORKSPACE
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.15, marginBottom: '10px' }}>
            Welcome back, {currentUser?.name || 'Developer'}
          </h1>

          <p style={{ fontSize: '0.92rem', opacity: 0.92, lineHeight: 1.55 }}>
            Access all engineering workspaces, monitor tasks, track defect lifecycles, and synchronize code changes across repositories from one unified portal.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '18px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#ffffff' }}>{projects.length}</strong>
              <span style={{ opacity: 0.85 }}>Active Projects</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ backgroundColor: '#ffffff', color: '#2b6777', padding: '1px 8px', borderRadius: 'var(--radius-pill)' }}>
                {myTasks.length}
              </strong>
              <span style={{ opacity: 0.85 }}>Tasks Assigned to You</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#ffffff' }}>{myPRs.length}</strong>
              <span style={{ opacity: 0.85 }}>Open PRs</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          style={{
            zIndex: 2,
            backgroundColor: '#ffffff',
            color: '#2b6777',
            padding: '13px 26px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 800,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} />
          Create New Project
        </button>
      </div>

      {/* SECTION 1: My Assigned Work (Cross-Project Telemetry) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListTodo size={18} color="#2b6777" /> My Active Work Items ({myTasks.length + myIssues.length})
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Tasks, bug reports, and PRs assigned to @{currentUser?.githubUsername || 'you'} across all workspaces.
            </p>
          </div>
        </div>

        {myTasks.length === 0 && myIssues.length === 0 ? (
          <div className="pastel-card" style={{ padding: '24px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <CheckCircle2 size={28} color="#52ab98" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1c3d44' }}>
              All Caught Up!
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              You have no active pending tasks or blockers assigned right now.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '14px'
          }}>
            {myTasks.map(task => {
              const proj = projects.find(p => p.id === task.projectId);
              return (
                <div
                  key={task.id}
                  className="pastel-card animate-fade-in"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #2b6777'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: '#e2eff2',
                        color: '#2b6777',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {proj?.key || 'DEV'} • {task.id}
                      </span>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: task.stage === 'in_progress' ? '#eef6f8' : '#f2f2f2',
                        color: task.stage === 'in_progress' ? '#2b6777' : '#527982',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        textTransform: 'uppercase'
                      }}>
                        {task.stage.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c3d44', lineHeight: 1.3 }}>
                      {task.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Project: <strong>{proj?.name}</strong>
                    </span>

                    <button
                      onClick={() => handleOpenProjectWithTab(task.projectId, 'kanban')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#2b6777'
                      }}
                    >
                      Open Board <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

            {myIssues.map(issue => {
              const proj = projects.find(p => p.id === issue.projectId);
              return (
                <div
                  key={issue.id}
                  className="pastel-card animate-fade-in"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #52ab98'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: '#e6f6f3',
                        color: '#52ab98',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {proj?.key || 'DEV'} • {issue.id}
                      </span>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#f2f2f2',
                        color: '#881337',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        textTransform: 'uppercase'
                      }}>
                        {issue.severity}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c3d44', lineHeight: 1.3 }}>
                      {issue.title}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Project: <strong>{proj?.name}</strong>
                    </span>

                    <button
                      onClick={() => handleOpenProjectWithTab(issue.projectId, 'issues')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#52ab98'
                      }}
                    >
                      View Issue <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: All Active Projects Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              All Engineering Workspaces ({filteredProjects.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Select a project to launch its dedicated Kanban board, issue telemetry, and GitHub sync pipeline.
            </p>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 36px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-color)',
                backgroundColor: '#f2f2f2',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {filteredProjects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const projectIssues = issues.filter(i => i.projectId === project.id);
            const projectPRs = pullRequests.filter(pr => pr.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.stage === 'done').length;
            const openBugs = projectIssues.filter(i => i.status !== 'closed' && i.status !== 'resolved').length;
            const progressPercent = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                className="pastel-card animate-fade-in"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${project.color || '#2b6777'}`,
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: '#e2eff2',
                        color: '#2b6777',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid #c8d8e4'
                      }}>
                        {project.key}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {project.name}
                      </h3>
                    </div>

                    {project.gitRepo && (
                      <a
                        href={project.gitRepo}
                        target="_blank"
                        rel="noreferrer"
                        title="View GitHub Repository"
                        style={{ color: '#2b6777', display: 'flex', alignItems: 'center' }}
                      >
                        <FolderGit2 size={18} />
                      </a>
                    )}
                  </div>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-main)' }}>Task Velocity</span>
                      <span style={{ color: '#2b6777' }}>{progressPercent}% Done</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f2f2f2', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor: '#2b6777',
                        borderRadius: 'var(--radius-pill)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      backgroundColor: '#e2eff2',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#2b6777'
                    }}>
                      <Kanban size={13} />
                      <span>{completedTasks}/{projectTasks.length} Tasks Done</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      backgroundColor: openBugs > 0 ? '#fbecee' : '#e6f6f3',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: openBugs > 0 ? '#881337' : '#52ab98'
                    }}>
                      <Bug size={13} />
                      <span>{openBugs} Open Bugs</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      backgroundColor: '#f2f2f2',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#1c3d44'
                    }}>
                      <GitPullRequest size={13} />
                      <span>{projectPRs.filter(p => p.status === 'open').length} Open PRs</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Team & Enter Workspace Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  marginTop: '10px'
                }}>
                  {/* Team Avatars */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {project.teamMembers.map((member, i) => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        title={`${member.name} (@${member.githubUsername})`}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          marginLeft: i > 0 ? '-8px' : 0,
                          objectFit: 'cover'
                        }}
                      />
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: '8px' }}>
                      {project.teamMembers.length} devs
                    </span>
                  </div>

                  <button
                    onClick={() => selectProject(project)}
                    className="btn-primary"
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.84rem'
                    }}
                  >
                    Open Workspace <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
