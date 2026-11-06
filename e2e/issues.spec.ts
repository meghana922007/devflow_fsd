import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { prisma } from '../src/server/db.js';

const emailPrefix = `e2e-issue-${randomUUID()}`;
const email = `${emailPrefix}@example.test`;
const issueTitle = `Persisted issue ${randomUUID().slice(0, 6)}`;

test.afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
  await prisma.$disconnect();
});

test('reports an issue and verifies it after navigating away and reloading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByPlaceholder('John Doe').fill('E2E Issue User');
  await page.getByPlaceholder('john@devflow.io').fill(email);
  await page.getByPlaceholder('••••••••').fill('valid-test-password');
  await page.getByRole('button', { name: /REGISTER & ENTER/ }).click();
  await expect(page.getByText('Welcome back, E2E Issue User')).toBeVisible();

  await page.getByRole('button', { name: 'Create New Project' }).click();
  await page.getByPlaceholder('e.g. AI Workflow Engine').fill(`E2E Issues ${randomUUID().slice(0, 6)}`);
  await page.getByPlaceholder('AIW').fill('EISS');
  await page.getByRole('button', { name: 'Initialize Project Workspace' }).click();
  await page.getByRole('button', { name: 'Issue Tracker' }).click();
  await page.getByRole('button', { name: 'Report New Bug' }).click();
  await page.getByPlaceholder('e.g. Uncaught TypeError in Webhook payload validator').fill(issueTitle);
  await page.getByRole('button', { name: 'Report Bug' }).click();
  await expect(page.getByText(issueTitle)).toBeVisible();

  await page.reload();
  await expect(page.getByText('Welcome back, E2E Issue User')).toBeVisible();
  await page.getByRole('button', { name: 'Open Workspace' }).click();
  await page.getByRole('button', { name: 'Issue Tracker' }).click();
  await expect(page.getByText(issueTitle)).toBeVisible();
});
