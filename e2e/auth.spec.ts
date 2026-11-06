import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { prisma } from '../src/server/db.js';

const emailPrefix = `e2e-auth-${randomUUID()}`;
const email = `${emailPrefix}@example.test`;

test.afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: emailPrefix } } });
  await prisma.$disconnect();
});

test('rejects invalid credentials, creates an account, and restores the authenticated workspace', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Project not found or access denied.')).toHaveCount(0);
  await page.getByPlaceholder('user@devflow.io').fill(email);
  await page.getByPlaceholder('••••••••').fill('incorrect-password');
  await page.getByRole('button', { name: /ENTER WORKSPACE/ }).click();
  await expect(page.getByText('Email or password is incorrect.')).toBeVisible();

  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByPlaceholder('John Doe').fill('E2E Authentication User');
  await page.getByPlaceholder('john@devflow.io').fill(email);
  await page.getByPlaceholder('••••••••').fill('valid-test-password');
  await page.getByRole('button', { name: /REGISTER & ENTER/ }).click();
  await expect(page.getByText('Welcome back, E2E Authentication User')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Welcome back, E2E Authentication User')).toBeVisible();

  await page.getByRole('button', { name: 'Open AI Assistant' }).click();
  await expect(page.getByRole('heading', { name: 'AI developer assistance' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create New Project' })).toBeVisible();
  await page.getByPlaceholder('Paste issue details, a pull request description/diff, or an error log...').fill('Uploads fail when the file is larger than 10 MB.');
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page.getByRole('heading', { name: 'Local demo analysis' })).toBeVisible();
  await expect(page.getByText(/request\/body size limits/)).toBeVisible();

  await page.getByLabel('Load demo case').selectOption({ label: 'Database connection error' });
  await expect(page.getByPlaceholder('Paste issue details, a pull request description/diff, or an error log...'))
    .toHaveValue(/too many connections/);
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page.getByText(/connection-pool saturation/)).toBeVisible();

  await page.getByLabel('Load demo case').selectOption({ label: 'Review a pull request' });
  await expect(page.getByLabel('Analysis type')).toHaveValue('pull_request');
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page.getByText(/supplied text mentions tests/)).toBeVisible();
});
