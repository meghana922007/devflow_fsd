import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, UserCheck, FolderGit2 } from 'lucide-react';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

export const UserModal: React.FC = () => {
  const { isUserModalOpen, setIsUserModalOpen, editingUser, addUser, updateUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Full Stack Engineer');
  const [githubUsername, setGithubUsername] = useState('');
  const [avatar, setAvatar] = useState(avatarPresets[0]);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setGithubUsername(editingUser.githubUsername || '');
      setAvatar(editingUser.avatar || avatarPresets[0]);
    } else {
      setName('');
      setEmail('');
      setRole('Full Stack Engineer');
      setGithubUsername('');
      setAvatar(avatarPresets[0]);
    }
  }, [editingUser, isUserModalOpen]);

  if (!isUserModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        githubUsername: githubUsername.trim().replace('@', ''),
        avatar
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        githubUsername: githubUsername.trim().replace('@', ''),
        avatar
      });
    }

    setIsUserModalOpen(false);
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--pastel-sky)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--pastel-sky-dark)'
            }}>
              {editingUser ? <UserCheck size={18} /> : <UserPlus size={18} />}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {editingUser ? `Edit ${editingUser.name}'s Profile` : 'Add New Software Engineer'}
            </h3>
          </div>

          <button onClick={() => setIsUserModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              FULL NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              ENGINEERING ROLE / TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Frontend Architect / DevOps Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Row: Email & GitHub Handle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                required
                placeholder="dev@devflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                GITHUB USERNAME
              </label>
              <div style={{ position: 'relative' }}>
                <FolderGit2 size={14} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="rahul_dev"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 30px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Avatar Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              CHOOSE AVATAR PRESET
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {avatarPresets.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Avatar ${idx}`}
                  onClick={() => setAvatar(url)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: avatar === url ? '3px solid var(--pastel-sky-dark)' : '2px solid transparent',
                    boxShadow: avatar === url ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ backgroundColor: '#0284C7' }}
            >
              {editingUser ? 'Save Member Updates' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
