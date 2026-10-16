import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';
import { X, FolderPlus, Check, FolderGit2 } from 'lucide-react';

const pastelColors = [
  { name: 'Lavender', hex: '#7C65C1' },
  { name: 'Rose', hex: '#E05A8D' },
  { name: 'Mint', hex: '#2E9367' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Peach', hex: '#EA580C' },
  { name: 'Coral', hex: '#E11D48' }
];

export const NewProjectModal: React.FC = () => {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, addProject } = useApp();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [gitRepo, setGitRepo] = useState('https://github.com/my-org/my-project');
  const [color, setColor] = useState(pastelColors[0].hex);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([mockUsers[0].id, mockUsers[1].id]);

  if (!isNewProjectModalOpen) return null;

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) return;
      setSelectedMemberIds(prev => prev.filter(mId => mId !== id));
    } else {
      setSelectedMemberIds(prev => [...prev, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    const assignedMembers = mockUsers.filter(u => selectedMemberIds.includes(u.id));

    addProject({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
      color,
      gitRepo: gitRepo.trim(),
      teamMembers: assignedMembers
    });

    setIsNewProjectModalOpen(false);
    setName('');
    setKey('');
    setDescription('');
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
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--pastel-lavender-dark)'
            }}>
              <FolderPlus size={18} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Create New Engineering Project
            </h3>
          </div>

          <button onClick={() => setIsNewProjectModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                PROJECT NAME *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI Workflow Engine"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!key && e.target.value) {
                    setKey(e.target.value.substring(0, 3).toUpperCase());
                  }
                }}
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
                PROJECT KEY *
              </label>
              <input
                type="text"
                required
                maxLength={4}
                placeholder="AIW"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              PROJECT DESCRIPTION
            </label>
            <textarea
              rows={2}
              placeholder="High-level goal and scope of this development project..."
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

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              GITHUB REPOSITORY URL
            </label>
            <div style={{ position: 'relative' }}>
              <FolderGit2 size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="url"
                placeholder="https://github.com/my-org/my-project"
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              THEME ACCENT COLOR
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {pastelColors.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: color === c.hex ? '3px solid var(--text-main)' : 'none',
                    cursor: 'pointer'
                  }}
                  title={c.name}
                >
                  {color === c.hex && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              ASSIGN TEAM MEMBERS ({selectedMemberIds.length} Selected)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {mockUsers.map(user => {
                const isSelected = selectedMemberIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleMember(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--pastel-lavender)' : 'var(--bg-main)',
                      border: `1px solid ${isSelected ? 'var(--pastel-lavender-dark)' : 'var(--border-color)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={user.avatar} alt={user.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.role} • @{user.githubUsername}</div>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ accentColor: 'var(--pastel-lavender-dark)', cursor: 'pointer' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Initialize Project Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
