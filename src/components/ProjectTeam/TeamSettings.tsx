import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Kanban, Bug, ExternalLink, FolderGit2, UserPlus, Edit2, Trash2, UserCheck } from 'lucide-react';

export const TeamSettings: React.FC = () => {
  const {
    activeProject,
    tasks,
    issues,
    users,
    setEditingUser,
    setIsUserModalOpen,
    removeMemberFromProject,
    addMemberToProject
  } = useApp();

  const [selectedUnassignedUser, setSelectedUnassignedUser] = useState('');

  const projectTasks = tasks.filter(t => t.projectId === activeProject.id);
  const projectIssues = issues.filter(i => i.projectId === activeProject.id);

  const unassignedUsers = users.filter(u => !activeProject.teamMembers.some(m => m.id === u.id));

  const handleAssignExisting = () => {
    if (!selectedUnassignedUser) return;
    addMemberToProject(activeProject.id, selectedUnassignedUser);
    setSelectedUnassignedUser('');
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
            Manage team members, update GitHub handles, roles, and project assignments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {unassignedUsers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={selectedUnassignedUser}
                onChange={(e) => setSelectedUnassignedUser(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <option value="">Select Existing Member...</option>
                {unassignedUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>

              <button
                onClick={handleAssignExisting}
                className="btn-secondary"
                disabled={!selectedUnassignedUser}
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              >
                <UserCheck size={14} /> Assign
              </button>
            </div>
          )}

          <button
            onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
            className="btn-primary"
            style={{ backgroundColor: '#0284C7', padding: '9px 18px', fontSize: '0.85rem' }}
          >
            <UserPlus size={16} /> Add New Engineer
          </button>
        </div>
      </div>

      {/* Team Roster Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {activeProject.teamMembers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
            No team members assigned to this project yet. Click "+ Add New Engineer" to add team members.
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => { setEditingUser(member); setIsUserModalOpen(true); }}
                        title="Edit Member Details"
                        style={{ padding: '6px', color: 'var(--pastel-sky-dark)', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => removeMemberFromProject(activeProject.id, member.id)}
                        title="Remove from Project"
                        style={{ padding: '6px', color: 'var(--pastel-rose-dark)', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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

                  <button
                    onClick={() => { setEditingUser(member); setIsUserModalOpen(true); }}
                    style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--pastel-sky-dark)' }}
                  >
                    Edit Profile →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
