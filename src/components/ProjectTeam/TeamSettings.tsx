import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Kanban, Bug, ExternalLink, FolderGit2, UserPlus, Trash2 } from 'lucide-react';

export const TeamSettings: React.FC = () => {
  const {
    activeProject,
    tasks,
    issues,
    removeMemberFromProject,
    addMemberToProject,
    currentUser,
    apiError,
  } = useApp();

  const [memberEmail, setMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const projectTasks = tasks.filter(t => t.projectId === activeProject.id);
  const projectIssues = issues.filter(i => i.projectId === activeProject.id);

  const handleAddMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberEmail.trim()) return;
    setIsAddingMember(true);
    try {
      if (await addMemberToProject(activeProject.id, memberEmail.trim())) setMemberEmail('');
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      {/* Top Card: Repository & Project Info */}
      <div className="pastel-card" style={{ padding: '24px', backgroundColor: '#F5F2FF', border: '1px solid var(--pastel-lavender)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--pastel-lavender-dark)', textTransform: 'uppercase' }}>
              PROJECT WORKSPACE INFRASTRUCTURE
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {activeProject.name} ({activeProject.key})
            </h2>
          </div>

          {activeProject.gitRepo && (
            <a
              href={activeProject.gitRepo}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ backgroundColor: '#7C65C1', textDecoration: 'none' }}
            >
              <FolderGit2 size={16} /> Open GitHub Repo <ExternalLink size={14} />
            </a>
          )}
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {activeProject.description}
        </p>
      </div>

      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Assigned Engineering Team ({activeProject.teamMembers.length} Engineers)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Add registered DevFlow users to this project or remove their access.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <form onSubmit={handleAddMember} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Registered user's email"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '0.82rem'
                }}
              />
              <button
                type="submit"
                className="btn-secondary"
                disabled={isAddingMember}
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              >
                <UserPlus size={14} /> Add member
              </button>
          </form>
        </div>
      </div>
      {apiError && <p role="alert" style={{ color: 'var(--pastel-rose-dark)', fontSize: '0.85rem' }}>{apiError}</p>}

      {/* Team Roster Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {activeProject.teamMembers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
            No team members are assigned to this project yet.
          </div>
        ) : (
          activeProject.teamMembers.map(member => {
            const assignedTasks = projectTasks.filter(t => t.assigneeId === member.id);
            const assignedBugs = projectIssues.filter(i => i.assigneeId === member.id);

            return (
              <div key={member.id} className="pastel-card animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {member.name}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--pastel-lavender-dark)', fontWeight: 700 }}>
                          {member.role}
                        </div>
                      </div>
                    </div>

                    {member.id !== currentUser?.id && (
                      <button
                        onClick={() => void removeMemberFromProject(activeProject.id, member.id)}
                        title="Remove from Project"
                        style={{ padding: '6px', color: 'var(--pastel-rose-dark)', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    {member.githubUsername && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderGit2 size={14} color="var(--text-main)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>@{member.githubUsername}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="var(--text-light)" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-sky" style={{ fontSize: '0.72rem' }}>
                      <Kanban size={12} /> {assignedTasks.length} Tasks
                    </span>
                    <span className="badge badge-rose" style={{ fontSize: '0.72rem' }}>
                      <Bug size={12} /> {assignedBugs.length} Bugs
                    </span>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
