import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app.js';
import { decryptSecret } from '../src/server/crypto.js';
import { prisma } from '../src/server/db.js';

const emailPrefix = `github-account-${randomUUID()}`;
const app = createApp({ database: prisma });

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
});

describe('GitHub account connection', () => {
  it('validates and encrypts a token before listing repositories without exposing the token', async () => {
    const token = `github_pat_${randomUUID().replaceAll('-', '').repeat(2)}`;
    const agent = request.agent(app);
    const email = `${emailPrefix}@example.test`;
    const registration = await agent.post('/api/auth/register').send({
      name: 'GitHub Account Test',
      email,
      password: 'strong-test-password',
    }).expect(201);

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: 'demo-github', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          id: 1,
          name: 'demo-project',
          full_name: 'demo-github/demo-project',
          html_url: 'https://github.com/demo-github/demo-project',
          description: 'Demo repository',
          default_branch: 'main',
          private: true,
          stargazers_count: 2,
          forks_count: 1,
          open_issues_count: 0,
          owner: { login: 'demo-github', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' },
        }],
      }));

    await agent.put('/api/github/token').send({ token: 'this-is-not-a-valid-token' }).expect(400);
    const connected = await agent.put('/api/github/token').send({ token }).expect(200);
    expect(connected.body).toEqual({ connected: true, username: 'demo-github' });
    expect(JSON.stringify(connected.body)).not.toContain(token);

    const savedUser = await prisma.user.findUniqueOrThrow({ where: { id: registration.body.user.id } });
    expect(savedUser.githubToken).not.toBe(token);
    expect(decryptSecret(savedUser.githubToken!)).toBe(token);
    await agent.get('/api/github/status').expect(200).expect(response => {
      expect(response.body).toEqual({ connected: true, username: 'demo-github' });
    });
    const repos = await agent.get('/api/github/repos').expect(200);
    expect(repos.body.repositories[0].html_url).toBe('https://github.com/demo-github/demo-project');
  });
});
