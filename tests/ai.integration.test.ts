import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app.js';
import { prisma } from '../src/server/db.js';

const emailPrefix = `ai-demo-${randomUUID()}`;
const app = createApp({ database: prisma, aiApiKey: null });

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
});

describe('local AI demo assistant', () => {
  it('requires authentication and returns useful local analysis without a provider key', async () => {
    const agent = request.agent(app);
    await agent.post('/api/ai/analyze').send({
      kind: 'issue',
      title: 'Large uploads fail',
      context: 'Uploads larger than 10 MB return HTTP 500.',
    }).expect(401);

    await agent.post('/api/auth/register').send({
      name: 'AI Demo User',
      email: `${emailPrefix}@example.test`,
      password: 'strong-test-password',
    }).expect(201);

    const response = await agent.post('/api/ai/analyze').send({
      kind: 'issue',
      title: 'Large uploads fail',
      context: 'Uploads larger than 10 MB return HTTP 500.',
    }).expect(200);
    expect(response.body.mode).toBe('demo');
    expect(response.body.model).toBe('devflow-local-demo');
    expect(response.body.analysis).toContain('request/body size limits');
    expect(response.body.analysis).toContain('did not inspect files or execute code');

    const authAnalysis = await agent.post('/api/ai/analyze').send({
      kind: 'issue',
      title: 'Token refresh returns 401',
      context: 'Users lose access after their authentication token expires.',
    }).expect(200);
    expect(authAnalysis.body.analysis).toContain('token expiry and refresh handling');

    const databaseAnalysis = await agent.post('/api/ai/analyze').send({
      kind: 'error',
      title: 'PostgreSQL connection pool exhausted',
      context: 'Error: too many connections during peak traffic.',
    }).expect(200);
    expect(databaseAnalysis.body.analysis).toContain('connection-pool saturation');

    const corsAnalysis = await agent.post('/api/ai/analyze').send({
      kind: 'error',
      title: 'CORS preflight failure',
      context: 'OPTIONS request fails with Access-Control-Allow-Origin error.',
    }).expect(200);
    expect(corsAnalysis.body.analysis).toContain('preflight handling');

    const pullRequestAnalysis = await agent.post('/api/ai/analyze').send({
      kind: 'pull_request',
      title: 'Add upload retries',
      context: 'Adds retry handling for upload timeouts and regression tests.',
    }).expect(200);
    expect(pullRequestAnalysis.body.analysis).toContain('Review focus');
    expect(pullRequestAnalysis.body.analysis).toContain('supplied text mentions tests');
  });
});
