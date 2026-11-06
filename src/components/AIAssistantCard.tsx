import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { apiRequest } from '../services/api';

type AnalysisKind = 'pull_request' | 'issue' | 'error';

const demoExamples = [
  {
    name: 'Large upload returns 500',
    kind: 'issue' as const,
    title: 'Large file uploads return HTTP 500',
    context: 'Uploads larger than 10 MB intermittently fail with a server error.',
  },
  {
    name: 'Login returns 401',
    kind: 'issue' as const,
    title: 'Users are logged out after token refresh',
    context: 'The API returns 401 after the access token refreshes and the user cannot open the project board.',
  },
  {
    name: 'Database connection error',
    kind: 'error' as const,
    title: 'PostgreSQL connection pool exhausted',
    context: 'Error: too many connections; the task API times out during peak traffic.',
  },
  {
    name: 'CORS preflight failure',
    kind: 'error' as const,
    title: 'Browser blocks API request',
    context: 'OPTIONS preflight fails with an Access-Control-Allow-Origin error for the local frontend origin.',
  },
  {
    name: 'Flaky integration test',
    kind: 'issue' as const,
    title: 'Integration test fails intermittently',
    context: 'A flaky test passes alone but fails in the full suite with multiple workers.',
  },
  {
    name: 'Review a pull request',
    kind: 'pull_request' as const,
    title: 'Add retry handling for upload failures',
    context: 'This pull request adds retry handling for upload timeouts and includes regression tests for boundary file sizes.',
  },
];

export const AIAssistantCard: React.FC = () => {
  const [kind, setKind] = useState<AnalysisKind>('issue');
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'demo' | 'provider' | null>(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadExample = (name: string) => {
    const example = demoExamples.find(item => item.name === name);
    if (!example) return;
    setKind(example.kind);
    setTitle(example.title);
    setContext(example.context);
    setError('');
    setAnalysis('');
    setAnalysisMode(null);
  };

  const analyze = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setAnalysis('');
    setAnalysisMode(null);
    setIsAnalyzing(true);
    try {
      const result = await apiRequest<{ analysis: string; mode: 'demo' | 'provider' }>('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ kind, title, context }),
      });
      setAnalysis(result.analysis);
      setAnalysisMode(result.mode);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'AI analysis could not be completed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="pastel-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Sparkles size={18} color="#2563eb" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>AI developer assistance</h3>
      </div>
      <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Analyze an issue, pull request, or error log. {analysisMode === 'demo' || !analysisMode
          ? 'Local demo assistance works without credentials; configure OPENAI_API_KEY for provider-powered analysis.'
          : 'Provider-powered analysis is enabled.'}
      </p>
      <form onSubmit={analyze} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Try a demo case
          <select aria-label="Load demo case" defaultValue="" onChange={event => loadExample(event.target.value)}>
            <option value="" disabled>Choose an issue, error, or PR example…</option>
            {demoExamples.map(example => <option key={example.name} value={example.name}>{example.name}</option>)}
          </select>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 2fr', gap: 12 }}>
          <select value={kind} onChange={event => setKind(event.target.value as AnalysisKind)} aria-label="Analysis type">
            <option value="issue">Issue analysis</option>
            <option value="pull_request">Pull request summary</option>
            <option value="error">Error and log explanation</option>
          </select>
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Title (optional)" />
        </div>
        <textarea
          required
          maxLength={20000}
          rows={5}
          value={context}
          onChange={event => setContext(event.target.value)}
          placeholder="Paste issue details, a pull request description/diff, or an error log..."
        />
        <div>
          <button type="submit" className="btn-primary" disabled={isAnalyzing || !context.trim()}>
            <Sparkles size={15} /> {isAnalyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      </form>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: 0 }}>{error}</p>}
      {analysis && (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--text-main)' }}>
            {analysisMode === 'demo' ? 'Local demo analysis' : 'AI analysis'}
          </h4>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text-main)', lineHeight: 1.6 }}>{analysis}</p>
        </div>
      )}
    </section>
  );
};
