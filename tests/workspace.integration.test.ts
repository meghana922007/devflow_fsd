import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server/app.js';
import { prisma } from '../src/server/db.js';

const emailPrefix = `workspace-test-${crypto.randomUUID()}`;
const app = createApp({ database: prisma });

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
});

describe('workspace persistence API', () => {
  it('persists projects, tasks, and issue updates and enforces project access', async () => {
    const owner = request.agent(app);
    const email = `${emailPrefix}@example.test`;
    await owner.post('/api/auth/register').send({
      name: 'Workspace Owner',
      email,
      password: 'strong-test-password',
    }).expect(201);

    const projectResponse = await owner.post('/api/projects').send({
      name: 'Integration Project',
      key: 'ITP',
      description: 'Persistent project data',
      color: '#2563eb',
    }).expect(201);
    const projectId = projectResponse.body.project.id as string;
    const teammateEmail = `${emailPrefix}-teammate@example.test`;
    const teammate = request.agent(app);
    const teammateRegistration = await teammate.post('/api/auth/register').send({
      name: 'Workspace Teammate',
      email: teammateEmail,
      password: 'strong-test-password',
    }).expect(201);
    const teammateId = teammateRegistration.body.user.id as string;
    await owner.post(`/api/projects/${projectId}/members`).send({ email: teammateEmail }).expect(200);
    const teammateProjects = await teammate.get('/api/projects').expect(200);
    expect(teammateProjects.body.projects.map((project: { id: string }) => project.id)).toContain(projectId);
    await teammate.post(`/api/projects/${projectId}/members`).send({ email: `${emailPrefix}@example.test` }).expect(403);

    const taskResponse = await owner.post(`/api/projects/${projectId}/tasks`).send({
      title: 'Verify database persistence',
      description: 'Create and reload the task',
      stage: 'in_progress',
      priority: 'high',
      tags: ['integration'],
      subtasks: [],
    }).expect(201);
    const taskId = taskResponse.body.task.id as string;

    const issueResponse = await owner.post(`/api/projects/${projectId}/issues`).send({
      title: 'Example integration issue',
      description: 'Created during the test',
      severity: 'major',
      status: 'open',
      reproductionSteps: ['Open the project'],
    }).expect(201);
    const issueId = issueResponse.body.issue.id as string;

    await owner.patch(`/api/projects/${projectId}/issues/${issueId}`).send({ status: 'resolved' }).expect(200);
    const workspace = await owner.get('/api/workspace').expect(200);
    expect(workspace.body.projects.map((project: { id: string }) => project.id)).toContain(projectId);
    expect(workspace.body.tasks.find((task: { id: string }) => task.id === taskId)?.title)
      .toBe('Verify database persistence');
    expect(workspace.body.issues.find((issue: { id: string }) => issue.id === issueId)?.status)
      .toBe('resolved');
    expect(workspace.body.projects.find((project: { id: string; teamMembers: { email: string }[] }) => project.id === projectId)
      ?.teamMembers.some((member: { email: string }) => member.email === teammateEmail)).toBe(true);
    await owner.delete(`/api/projects/${projectId}/members/${teammateId}`).expect(204);
    const removedProjects = await teammate.get('/api/projects').expect(200);
    expect(removedProjects.body.projects).toHaveLength(0);

    const other = request.agent(app);
    await other.post('/api/auth/register').send({
      name: 'Different User',
      email: `${emailPrefix}-other@example.test`,
      password: 'strong-test-password',
    }).expect(201);
    await other.get(`/api/projects/${projectId}/tasks`).expect(404);
  });
});
