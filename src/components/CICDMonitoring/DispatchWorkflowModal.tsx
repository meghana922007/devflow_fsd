import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Play,
  GitBranch
} from 'lucide-react';

export const DispatchWorkflowModal: React.FC = () => {
  const {
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    branches,
    dispatchWorkflow
  } = useApp();

  const [selectedWorkflow, setSelectedWorkflow] = useState('CI / Build, Lint & Test Suite');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [runTests, setRunTests] = useState(true);
  const [coverage, setCoverage] = useState(true);
  const [verbose, setVerbose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isDispatchModalOpen) return null;

  const workflows = [
    {
      name: 'CI / Build, Lint & Test Suite',
      file: 'ci.yml',
      desc: 'Compiles TypeScript, runs oxlint, and executes full 48-spec unit test matrix.'
    },
    {
      name: 'Automated Playwright E2E Regression',
      file: 'e2e.yml',
      desc: 'Cross-browser integration tests across Chromium and Firefox.'
    },
    {
      name: 'Docker Container Package & Vulnerability Scan',
      file: 'docker.yml',
      desc: 'Builds multi-stage Docker container and scans with Aquasec Trivy.'
    },
    {
      name: 'Security CodeQL Deep Scan',
      file: 'codeql.yml',
      desc: 'Evaluates AST rules for security flaws and injection vulnerabilities.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      dispatchWorkflow({
        workflowName: selectedWorkflow,
        branch: selectedBranch,
        runTests,
        verbose
      });
      setIsSubmitting(false);
      setIsDispatchModalOpen(false);
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(28, 61, 68, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="pastel-card animate-modal-pop" style={{
        width: '100%',
        maxWidth: '560px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        backgroundColor: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: '#eef6f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#2b6777',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Play size={18} fill="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Trigger GitHub Actions Workflow
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Dispatch real-time CI/CD pipeline run with automated job execution.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDispatchModalOpen(false)}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Workflow Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              SELECT WORKFLOW
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {workflows.map(wf => (
                <div
                  key={wf.name}
                  onClick={() => setSelectedWorkflow(wf.name)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid',
                    borderColor: selectedWorkflow === wf.name ? '#2b6777' : 'var(--border-color)',
                    backgroundColor: selectedWorkflow === wf.name ? '#e2eff2' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {wf.name}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      color: '#2b6777',
                      border: '1px solid #c8d8e4'
                    }}>
                      {wf.file}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {wf.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              TARGET GIT BRANCH
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <GitBranch size={16} color="#527982" style={{ position: 'absolute', left: '12px' }} />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              >
                {branches.map(b => (
                  <option key={b.name} value={b.name}>
                    {b.name} {b.isDefault ? '(default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              EXECUTION PARAMETERS
            </span>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={runTests}
                onChange={(e) => setRunTests(e.target.checked)}
                style={{ accentColor: '#2b6777' }}
              />
              <span>Execute 48 unit & component tests in runner</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={coverage}
                onChange={(e) => setCoverage(e.target.checked)}
                style={{ accentColor: '#2b6777' }}
              />
              <span>Generate code coverage artifact (lcov & html)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={verbose}
                onChange={(e) => setVerbose(e.target.checked)}
                style={{ accentColor: '#2b6777' }}
              />
              <span>Enable verbose step logs & command echo</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="btn-secondary"
              style={{ padding: '9px 16px', fontSize: '0.84rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: '9px 20px',
                fontSize: '0.84rem',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <Play size={14} fill="#ffffff" />
              {isSubmitting ? 'Dispatching...' : 'Trigger Pipeline Run'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
