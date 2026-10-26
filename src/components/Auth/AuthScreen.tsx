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

  // Dev utility — logic preserved, card hidden from UI
  const fillQuickTest = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMsg(null);
  };
  void fillQuickTest; // suppress unused warning

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px 11px 40px',
    background: '#080b16',
    border: '1px solid rgba(0,245,255,0.25)',
    color: '#e8f4fd',
    fontSize: '0.88rem',
    fontFamily: "'Share Tech Mono', monospace",
    outline: 'none',
    borderRadius: '3px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    fontFamily: "'Press Start 2P', monospace",
    color: '#4a7c8e',
    marginBottom: '7px',
    letterSpacing: '0.04em',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#4a7c8e',
  };

  return (
    <div
      className="scanline-bg"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0e1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Ambient background blobs */}
      <div style={{
        position: 'fixed', top: '10%', left: '5%',
        width: '320px', height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '8%',
        width: '260px', height: '260px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,0,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="animate-modal-pop"
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(0,245,255,0.3)',
          boxShadow: '0 0 60px rgba(0,245,255,0.08), 0 0 120px rgba(0,245,255,0.04)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ===== LEFT PANEL: Branding ===== */}
        <div
          style={{
            background: 'linear-gradient(160deg, #080b16 0%, #0d1224 60%, #0a0e1a 100%)',
            padding: '52px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid rgba(0,245,255,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative pixel grid lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo mark */}
            <div style={{
              width: '52px', height: '52px',
              background: 'rgba(0,245,255,0.08)',
              border: '2px solid rgba(0,245,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '28px',
              boxShadow: '0 0 20px rgba(0,245,255,0.2)',
            }}>
              <Sparkles size={24} color="#00f5ff" />
            </div>

            <h1
              className="pixel-glow"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '1.5rem',
                color: '#00f5ff',
                lineHeight: 1.4,
                marginBottom: '20px',
                letterSpacing: '0.02em',
              }}
            >
              DEV<br />FLOW
            </h1>

            <p style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.85rem',
              color: '#4a7c8e',
              lineHeight: 1.7,
              marginBottom: '36px',
              maxWidth: '280px',
            }}>
              Unified developer intelligence platform. Kanban boards, issue tracking, GitHub integration & CI/CD pipelines in one workspace.
            </p>

            {/* Pixel-art stat bars */}
            {[
              { label: 'TASKS', color: '#00f5ff', pct: 78 },
              { label: 'BUGS', color: '#ff2d55', pct: 42 },
              { label: 'PIPELINES', color: '#39ff14', pct: 91 },
            ].map(({ label, color, pct }) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.5rem',
                  color: '#4a7c8e',
                  marginBottom: '5px',
                }}>
                  <span>{label}</span>
                  <span style={{ color }}>{pct}%</span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom version tag */}
          <div style={{
            position: 'relative', zIndex: 1,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.45rem',
            color: '#2a4a5a',
            letterSpacing: '0.06em',
          }}>
            SYS v2.0.0 &nbsp;|&nbsp; ALL SYSTEMS NOMINAL
          </div>
        </div>

        {/* ===== RIGHT PANEL: Forms ===== */}
        <div style={{
          background: '#0d1224',
          padding: '48px 42px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex',
            background: '#080b16',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '4px',
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
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '0.5rem',
                  letterSpacing: '0.04em',
                  background: mode === m
                    ? 'rgba(0,245,255,0.12)'
                    : 'transparent',
                  color: mode === m ? '#00f5ff' : '#2a4a5a',
                  borderRight: m === 'login' ? '1px solid rgba(0,245,255,0.2)' : 'none',
                  boxShadow: mode === m ? 'inset 0 0 12px rgba(0,245,255,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {m === 'login' ? '[ SIGN IN ]' : '[ REGISTER ]'}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div
              className="animate-fade-in"
              style={{
                background: 'rgba(255,45,85,0.1)',
                border: '1px solid rgba(255,45,85,0.4)',
                borderRadius: '3px',
                padding: '10px 14px',
                color: '#ff2d55',
                fontSize: '0.78rem',
                fontFamily: "'Share Tech Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                boxShadow: '0 0 12px rgba(255,45,85,0.15)',
              }}
            >
              <AlertCircle size={15} />
              <span>&gt; ERR: {errorMsg}</span>
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
                      e.target.style.borderColor = 'rgba(0,245,255,0.7)';
                      e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,245,255,0.25)';
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
                      e.target.style.borderColor = 'rgba(0,245,255,0.7)';
                      e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,245,255,0.25)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '6px', fontSize: '0.72rem' }}
              >
                ENTER WORKSPACE <ArrowRight size={15} />
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                color: '#2a4a5a', fontSize: '0.7rem',
                fontFamily: "'Share Tech Mono', monospace",
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,245,255,0.1)' }} />
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,245,255,0.1)' }} />
              </div>

              <button
                type="button"
                onClick={loginWithGithub}
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
                      e.target.style.borderColor = 'rgba(0,245,255,0.7)';
                      e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,245,255,0.25)';
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
                      e.target.style.borderColor = 'rgba(0,245,255,0.7)';
                      e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,245,255,0.25)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>PASSWORD (MIN 6)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={iconStyle} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(0,245,255,0.7)';
                      e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,245,255,0.25)';
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
                        e.target.style.borderColor = 'rgba(0,245,255,0.7)';
                        e.target.style.boxShadow = '0 0 12px rgba(0,245,255,0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0,245,255,0.25)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px', fontSize: '0.68rem' }}
              >
                REGISTER &amp; ENTER <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
