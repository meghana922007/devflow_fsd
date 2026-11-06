import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  FolderGit2,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  KeyRound
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, loginWithGithub, signup, apiError } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success && result.error) setErrorMsg(result.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await signup({
        name: name.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: role.trim(),
        githubUsername: githubUsername.trim().replace('@', ''),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      if (!result.success && result.error) setErrorMsg(result.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px 11px 40px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#1e293b',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    borderRadius: '8px',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    color: '#475569',
    marginBottom: '7px',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
  };

  return (
    <div
      className="scanline-bg auth-screen"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f8fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      <div
        className="animate-modal-pop auth-card"
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ===== LEFT PANEL: Branding ===== */}
        <div
          style={{
            background: '#f1f5f9',
            padding: '52px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid #e2e8f0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '48px', height: '48px',
              background: '#dbeafe',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '24px',
            }}>
              <Sparkles size={22} color="#2563eb" />
            </div>

            <h1 style={{
              fontSize: '1.8rem',
              color: '#0f172a',
              lineHeight: 1.2,
              marginBottom: '20px',
            }}>
              DevFlowOne
            </h1>

            <p style={{
              fontSize: '0.95rem',
              color: '#475569',
              lineHeight: 1.7,
              marginBottom: '28px',
              maxWidth: '340px',
            }}>
              Your development workflow, in one place. Manage projects and tasks, track issues, review GitHub activity, and monitor builds.
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              color: '#334155',
              fontSize: '0.84rem',
            }}>
              {['Projects & tasks', 'Issue tracking', 'GitHub activity', 'Build health'].map((feature) => (
                <span key={feature} style={{
                  padding: '6px 10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                }}>
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            position: 'relative', zIndex: 1,
            fontSize: '0.82rem',
            color: '#64748b',
          }}>
            A unified workspace for your team.
          </div>
        </div>

        {/* ===== RIGHT PANEL: Forms ===== */}
        <div style={{
          background: '#ffffff',
          padding: '48px 42px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginBottom: '30px',
            overflow: 'hidden',
          }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: mode === m
                    ? '#ffffff'
                    : 'transparent',
                  color: mode === m ? '#1d4ed8' : '#64748b',
                  borderRight: m === 'login' ? '1px solid #e2e8f0' : 'none',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {(errorMsg || apiError) && (
            <div
              className="animate-fade-in"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                boxShadow: '0 0 12px rgba(255,45,85,0.15)',
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg || apiError}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>EMAIL / HANDLE</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={iconStyle} />
                  <input
                    type="text"
                    required
                    placeholder="user@devflow.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={iconStyle} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '6px', fontSize: '0.72rem' }}
              >
                {isSubmitting ? 'SIGNING IN…' : 'ENTER WORKSPACE'} <ArrowRight size={15} />
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                color: '#94a3b8', fontSize: '0.8rem',
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              <button
                type="button"
                onClick={loginWithGithub}
                disabled={isSubmitting}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.72rem' }}
              >
                <FolderGit2 size={15} /> CONTINUE WITH GITHUB
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={15} style={iconStyle} />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>WORK EMAIL</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={iconStyle} />
                  <input
                    type="email"
                    required
                    placeholder="john@devflow.io"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>PASSWORD (MIN 8)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={iconStyle} />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>ROLE</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      ...inputStyle,
                      padding: '10px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Lead Architect">Lead Architect</option>
                    <option value="Full Stack Engineer">Full Stack Engineer</option>
                    <option value="Backend Specialist">Backend Specialist</option>
                    <option value="QA & DevOps Lead">QA &amp; DevOps Lead</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>GITHUB</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={13} style={iconStyle} />
                    <input
                      type="text"
                      placeholder="@handle"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#cbd5e1';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px', fontSize: '0.68rem' }}
              >
                {isSubmitting ? 'CREATING ACCOUNT…' : 'REGISTER & ENTER'} <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
