import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  FolderGit2,
  Check,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  KeyRound
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, loginWithGithub, signup } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Signup State
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState('Full Stack Engineer');
  const [githubUsername, setGithubUsername] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = login(email, password);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = signup({
      name: name.trim(),
      email: signupEmail.trim(),
      password: signupPassword.trim(),
      role: role.trim(),
      githubUsername: githubUsername.trim().replace('@', ''),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const fillQuickTest = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMsg(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f2f2f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="pastel-card animate-modal-pop" style={{
        width: '100%',
        maxWidth: '1020px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.1fr',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(43, 103, 119, 0.15)',
        border: '1px solid #c8d8e4',
        backgroundColor: '#ffffff'
      }}>
        {/* Left Side: Deep Teal Professional Branding Banner */}
        <div style={{
          backgroundColor: '#2b6777',
          padding: '44px 36px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              marginBottom: '20px'
            }}>
              <Sparkles size={15} /> DEVFLOW WORKSPACE AUTHENTICATION
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
              Unified Developer Intelligence Platform
            </h1>

            <p style={{ fontSize: '0.92rem', opacity: 0.92, lineHeight: 1.55, marginBottom: '28px' }}>
              Eliminate context switching. Connect tasks, bug reports, GitHub PRs, commits, and webhook automation into one cohesive workspace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check size={16} color="#52ab98" /> <span>Module 1: 4-Column Grid Kanban with 3D Physics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check size={16} color="#52ab98" /> <span>Module 2: Defect Lifecycle & Telemetry Tracker</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check size={16} color="#52ab98" /> <span>Module 3: GitHub PRs, Code Diffs & Webhooks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check size={16} color="#52ab98" /> <span>Multi-Project Hub & Engineer Roster Management</span>
              </div>
            </div>
          </div>

          {/* Seeded Testing Credentials Card */}
          <div style={{
            marginTop: '36px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c8d8e4', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={13} /> Demo Test Accounts (Click to Auto-Fill):
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillQuickTest('meghana@devflow.io', 'devflow123')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  textAlign: 'left'
                }}
              >
                <span><strong>Meghana</strong> (Full Stack Engineer)</span>
                <code style={{ fontSize: '0.72rem', opacity: 0.9 }}>devflow123</code>
              </button>

              <button
                type="button"
                onClick={() => fillQuickTest('admin@devflow.io', 'admin123')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  textAlign: 'left'
                }}
              >
                <span><strong>Admin</strong> (Lead Architect)</span>
                <code style={{ fontSize: '0.72rem', opacity: 0.9 }}>admin123</code>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div style={{ padding: '44px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f2f2f2',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.86rem',
                fontWeight: 700,
                backgroundColor: mode === 'login' ? '#2b6777' : 'transparent',
                color: mode === 'login' ? '#ffffff' : '#527982'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.86rem',
                fontWeight: 700,
                backgroundColor: mode === 'signup' ? '#2b6777' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : '#527982'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="animate-fade-in" style={{
              backgroundColor: '#fbecee',
              border: '1px solid #c8d8e4',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#881337',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form: Sign In */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Work Email or GitHub Handle
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. meghana@devflow.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: '0.92rem',
                  marginTop: '8px'
                }}
              >
                Sign In to Workspace <ArrowRight size={16} />
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '8px 0',
                color: 'var(--text-light)',
                fontSize: '0.78rem'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>

              <button
                type="button"
                onClick={loginWithGithub}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px',
                  fontSize: '0.86rem',
                  gap: '8px'
                }}
              >
                <FolderGit2 size={16} color="#2b6777" /> Continue with GitHub OAuth
              </button>
            </form>
          ) : (
            /* Form: Sign Up */
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <UserIcon size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Work Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@devflow.io"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Password * (Min 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Lead Architect">Lead Architect</option>
                    <option value="Full Stack Engineer">Full Stack Engineer</option>
                    <option value="Backend Specialist">Backend Specialist</option>
                    <option value="QA & DevOps Lead">QA & DevOps Lead</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    GitHub Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. jdoe_dev"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px',
                  fontSize: '0.88rem',
                  marginTop: '6px'
                }}
              >
                Register & Enter Workspace <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
