import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { prisma } from '../src/server/db.js';

const emailPrefix = `e2e-task-${randomUUID()}`;
const email = `${emailPrefix}@example.test`;
const projectName = `E2E Tasks ${randomUUID().slice(0, 6)}`;
const taskTitle = `Persisted task ${randomUUID().slice(0, 6)}`;

test.afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
  await prisma.$disconnect();
});

test('creates a project and task and verifies both remain after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByPlaceholder('John Doe').fill('E2E Task User');
  await page.getByPlaceholder('john@devflow.io').fill(email);
  await page.getByPlaceholder('••••••••').fill('valid-test-password');
  await page.getByRole('button', { name: /REGISTER & ENTER/ }).click();
  await expect(page.getByText('Welcome back, E2E Task User')).toBeVisible();

  await page.getByRole('button', { name: 'Create New Project' }).click();
  await page.getByPlaceholder('e.g. AI Workflow Engine').fill(projectName);
  await page.getByPlaceholder('AIW').fill('ETSK');
  await page.getByRole('button', { name: 'Initialize Project Workspace' }).click();
  await page.getByRole('button', { name: 'Board & Tasks' }).click();
  await page.getByRole('button', { name: 'New Task', exact: true }).click();
  await page.getByPlaceholder('e.g. Implement WebSocket state broad-caster').fill(taskTitle);
  await page.getByRole('button', { name: 'Create Task' }).click();
  await expect(page.getByText(taskTitle)).toBeVisible();

  await page.reload();
  await expect(page.getByText('Welcome back, E2E Task User')).toBeVisible();
  await page.getByRole('button', { name: 'Open Workspace' }).click();
  await page.getByRole('button', { name: 'Board & Tasks' }).click();
  await expect(page.getByText(taskTitle)).toBeVisible();
});
