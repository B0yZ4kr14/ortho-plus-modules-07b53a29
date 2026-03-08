import { test, expect } from './fixtures';

/**
 * Module Smoke Tests
 * Verifies that all uncovered module routes load correctly.
 * Each test navigates to a module's primary route and verifies the page renders.
 */

test.describe('Module Smoke Tests', () => {
  // ─── Clinical Modules ───────────────────────────────────────────────

  test('Dentistas — page loads', async ({ page }) => {
    await page.goto('/dentistas');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Funcionários — page loads', async ({ page }) => {
    await page.goto('/funcionarios');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Procedimentos — page loads', async ({ page }) => {
    await page.goto('/procedimentos');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('IA Radiografia — page loads', async ({ page }) => {
    await page.goto('/ia-radiografia');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('TISS — page loads', async ({ page }) => {
    await page.goto('/tiss');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Portal Paciente — page loads', async ({ page }) => {
    await page.goto('/portal-paciente');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  // ─── Financial Modules ─────────────────────────────────────────────

  test('Cobrança — page loads', async ({ page }) => {
    await page.goto('/cobranca');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Contratos — page loads', async ({ page }) => {
    await page.goto('/contratos');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Orçamentos — page loads', async ({ page }) => {
    await page.goto('/orcamentos');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Split Pagamento — page loads', async ({ page }) => {
    await page.goto('/split-pagamento');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Inadimplência — page loads', async ({ page }) => {
    await page.goto('/inadimplencia');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('PDV — page loads', async ({ page }) => {
    await page.goto('/pdv');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  // ─── Marketing & Business ──────────────────────────────────────────

  test('Marketing Automação — page loads', async ({ page }) => {
    await page.goto('/marketing-auto');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Fidelidade — page loads', async ({ page }) => {
    await page.goto('/fidelidade');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Programa Fidelidade — page loads', async ({ page }) => {
    await page.goto('/programa-fidelidade');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  // ─── Analytics & BI ────────────────────────────────────────────────

  test('BI — page loads', async ({ page }) => {
    await page.goto('/bi');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Business Intelligence — page loads', async ({ page }) => {
    await page.goto('/business-intelligence');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  // ─── Compliance & Security ─────────────────────────────────────────

  test('LGPD — page loads', async ({ page }) => {
    await page.goto('/lgpd');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  // ─── Admin Pages ───────────────────────────────────────────────────

  test('Admin Audit Trail — page loads', async ({ page }) => {
    await page.goto('/admin/audit-trail');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Admin Database — page loads', async ({ page }) => {
    await page.goto('/admin/database');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Admin Backups — page loads', async ({ page }) => {
    await page.goto('/admin/backups');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Admin Monitoring — page loads', async ({ page }) => {
    await page.goto('/admin/monitoring');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Admin Logs — page loads', async ({ page }) => {
    await page.goto('/admin/logs');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Admin API Docs — page loads', async ({ page }) => {
    await page.goto('/admin/api-docs');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Admin ADRs — page loads', async ({ page }) => {
    await page.goto('/admin/adrs');
    await expect(page.locator('h1, h2, [data-testid]').first()).toBeVisible({ timeout: 5000 });
  });
});
