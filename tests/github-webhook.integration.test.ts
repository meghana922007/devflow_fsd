import { createHmac, randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '../src/server/config.js';
import { createApp } from '../src/server/app.js';
import { prisma } from '../src/server/db.js';
import { decryptSecret, encryptSecret } from '../src/server/crypto.js';

const email = `webhook-test-${randomUUID()}@example.test`;
const webhookSecret = randomUUID().replaceAll('-', '').repeat(2);
const deliveryId = randomUUID();
const queue = new Queue(`github-webhooks-test-${randomUUID()}`, {
  connection: new Redis(config.REDIS_URL, { maxRetriesPerRequest: null }),
});
const app = createApp({ database: prisma, queue });

afterAll(async () => {
  await queue.getJob(deliveryId).then(job => job?.remove());
  await prisma.user.deleteMany({ where: { email } });
  await queue.close();
});

describe('GitHub webhook API', () => {
  it('rejects an invalid signature and accepts a signed delivery into the queue', async () => {
    const agent = request.agent(app);
    const registration = await agent.post('/api/auth/register').send({
      name: 'Webhook Owner',
      email,
      password: 'strong-test-password',
    }).expect(201);
    const userId = registration.body.user.id as string;
    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        name: 'Webhook Project',
        key: `WH${randomUUID().slice(0, 4)}`,
        members: { create: { userId, role: 'owner' } },
      },
    });
    await prisma.gitHubIntegration.create({
      data: {
        projectId: project.id,
        repoUrl: 'https://github.com/example/project',
        owner: 'example',
        repoName: 'project',
        webhookSecret: encryptSecret(webhookSecret),
      },
    });

    const rawBody = JSON.stringify({ ref: 'refs/heads/main', commits: [] });
    await request(app)
      .post(`/api/webhooks/github/${project.id}`)
      .set('x-github-event', 'push')
      .set('x-github-delivery', deliveryId)
      .set('x-hub-signature-256', 'sha256=invalid')
      .set('Content-Type', 'application/json')
      .send(rawBody)
      .expect(401);

    const storedIntegration = await prisma.gitHubIntegration.findUniqueOrThrow({ where: { projectId: project.id } });
    expect(decryptSecret(storedIntegration.webhookSecret)).toBe(webhookSecret);
    const signature = `sha256=${createHmac('sha256', webhookSecret).update(rawBody).digest('hex')}`;
    const response = await request(app)
      .post(`/api/webhooks/github/${project.id}`)
      .set('x-github-event', 'push')
      .set('x-github-delivery', deliveryId)
      .set('x-hub-signature-256', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody);
    expect(response.status, response.text).toBe(202);
    expect(response.body.accepted).toBe(true);
    expect(await queue.getJob(deliveryId)).not.toBeNull();
  });
});
