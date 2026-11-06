import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app.js';
import { prisma } from '../src/server/db.js';

const emailPrefix = `auth-test-${crypto.randomUUID()}`;
const app = createApp({ database: prisma });

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
});

describe('authentication API', () => {
  it('rejects protected requests, registers a user, and restores the session from its cookie', async () => {
    const agent = request.agent(app);
    const unauthorized = await agent.get('/api/workspace');
    expect(unauthorized.status).toBe(401);

    const email = `${emailPrefix}@example.test`;
    const registration = await agent.post('/api/auth/register').send({
      name: 'Integration User',
      email,
      password: 'strong-test-password',
    });
    expect(registration.status).toBe(201);
    expect(registration.body.user.email).toBe(email);
    expect(registration.body.user).not.toHaveProperty('passwordHash');

    const session = await agent.get('/api/auth/me');
    expect(session.status).toBe(200);
    expect(session.body.user.id).toBe(registration.body.user.id);

    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });
});
