type AnalysisKind = 'pull_request' | 'issue' | 'error';

function getInvestigation(input: string) {
  if (/upload|file size|payload too large|10\s?mb/.test(input)) {
    return 'Check request/body size limits at the proxy and application layers, then inspect upload buffering, streaming, and timeout settings.';
  }
  if (/401|403|unauthorized|forbidden|login|authentication|permission|token/.test(input)) {
    return 'Check token expiry and refresh handling, then verify the user identity, role, and authorization policy for the affected route. Never log raw credentials.';
  }
  if (/database|postgres|sql|deadlock|connection pool|too many connections|migration/.test(input)) {
    return 'Check database health and connection-pool saturation, inspect the failing query and migration state, then look for long-running transactions or lock contention.';
  }
  if (/cors|preflight|origin|access-control/.test(input)) {
    return 'Compare the browser origin with the server allowlist, then verify OPTIONS preflight handling, credentials policy, and allowed headers.';
  }
  if (/memory|heap|out of memory|oom|leak/.test(input)) {
    return 'Check memory and heap metrics over time, identify large retained objects or unbounded buffers, and compare the workload with configured resource limits.';
  }
  if (/flaky|intermittent|race condition|nondeterministic/.test(input)) {
    return 'Repeat the test with timing and worker count controlled, then inspect shared mutable state, test-order dependence, and asynchronous cleanup.';
  }
  if (/build|ci\/cd|pipeline|workflow|deployment|deploy/.test(input)) {
    return 'Open the first failed CI step, compare its runtime and environment with local development, then check dependency-lockfile, secrets configuration, and cached artifacts.';
  }
  if (/timeout|timed out|deadline exceeded/.test(input)) {
    return 'Compare client, proxy, and service timeouts; inspect the slowest dependency call and whether retries amplify the delay.';
  }
  if (/404|not found|route|endpoint/.test(input)) {
    return 'Verify the requested method and route, check router mounting and path parameters, and confirm the resource exists for the authenticated project.';
  }
  if (/500|exception|stack trace|internal server error/.test(input)) {
    return 'Start with the first application-owned stack frame, correlate it with the request ID, and inspect recent changes to that code path.';
  }
  return 'Reproduce the behavior with a minimal input, inspect the relevant server logs, and compare the failing path with a known-good request.';
}

export function createDemoAnalysis(kind: AnalysisKind, title: string | undefined, context: string) {
  const input = `${title ?? ''}\n${context}`.toLowerCase();
  const subject = title?.trim() || (
    kind === 'issue' ? 'Software issue' :
      kind === 'pull_request' ? 'Pull request' : 'Error log'
  );
  const focus = getInvestigation(input);

  if (kind === 'pull_request') {
    const missingTests = !/\b(test|spec|coverage|regression)\b/.test(input);
    return [
      `Demo-mode review: ${subject}`,
      '',
      `Summary: ${context.trim().slice(0, 500)}`,
      'Review focus: verify the changed behavior, error handling, and compatibility with existing callers.',
      `Test coverage: ${missingTests ? 'No test coverage is mentioned in the supplied text; confirm regression tests are included.' : 'The supplied text mentions tests; verify they cover both success and failure paths.'}`,
      `Risk to verify: ${focus}`,
      'This local demo assistant only analyzes the supplied text; it did not inspect a repository or execute tests.',
    ].join('\n');
  }

  if (kind === 'error') {
    return [
      `Demo-mode log explanation: ${subject}`,
      '',
      `Likely investigation: ${focus}`,
      'Next checks: capture the full error and request context, identify the first application frame, then verify the suspected dependency or input boundary.',
      'This local demo assistant only analyzes the supplied text; treat the diagnosis as a starting point, not a confirmed root cause.',
    ].join('\n');
  }

  return [
    `Demo-mode issue analysis: ${subject}`,
    '',
    `Likely investigation: ${focus}`,
    'Suggested steps:',
    '1. Reproduce the issue with a small, controlled input and record the exact response.',
    '2. Check application and proxy logs around the request; compare limits and timeouts.',
    '3. Add a regression test for the failing case and a nearby boundary case.',
    'This local demo assistant only analyzes the supplied text; it did not inspect files or execute code.',
  ].join('\n');
}
