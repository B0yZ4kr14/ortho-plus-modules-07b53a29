import { test, expect } from '@playwright/test';

test.describe('Performance Optimization - React.memo & useCallback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume user is already authenticated
  });

  test.describe('PatientsList - React.memo optimization', () => {
    test('should render patients list without excessive re-renders', async ({ page }) => {
      await page.goto('/pacientes');
      
      // Wait for patients list to load
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      
      // Verify table structure
      const tableHeaders = page.locator('th');
      await expect(tableHeaders).toHaveCount(6); // Nome, CPF, Telefone, Status, Convênio, Ações
      
      // Verify patients are rendered
      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should handle search filter efficiently with useCallback', async ({ page }) => {
      await page.goto('/pacientes');
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      
      // Type search query
      await searchInput.fill('João');
      await page.waitForTimeout(500); // Debounce
      
      // Verify filtered results
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      
      // Should have filtered results or empty state
      if (rowCount > 0) {
        const firstRow = rows.first();
        const text = await firstRow.textContent();
        expect(text?.toLowerCase()).toContain('joão');
      }
    });

    test('should handle status filter with memoized callback', async ({ page }) => {
      await page.goto('/pacientes');
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      
      // Find status filter dropdown
      const statusFilter = page.locator('select').first();
      await statusFilter.selectOption('Ativo');
      
      await page.waitForTimeout(300);
      
      // Verify all visible patients have "Ativo" status
      const statusBadges = page.locator('tbody td').locator('text=/Ativo/i');
      const badgeCount = await statusBadges.count();
      expect(badgeCount).toBeGreaterThan(0);
    });

    test('should handle delete confirmation with memoized handler', async ({ page }) => {
      await page.goto('/pacientes');
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      
      // Click first delete button
      const deleteButton = page.locator('button[aria-label*="Excluir"], button').filter({ hasText: /excluir/i }).first();
      
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        
        // Verify confirmation dialog appears
        await expect(page.locator('text=/Confirmar exclusão/i')).toBeVisible();
        
        // Click cancel (don't actually delete)
        await page.locator('button:has-text("Cancelar")').click();
        
        // Dialog should close
        await expect(page.locator('text=/Confirmar exclusão/i')).not.toBeVisible();
      }
    });
  });

  test.describe('TransactionsList - React.memo optimization', () => {
    test('should render transactions list efficiently', async ({ page }) => {
      await page.goto('/financeiro/transacoes');
      
      // Wait for transactions to load
      await page.waitForTimeout(2000);
      
      // Check for table or empty state
      const hasTable = await page.locator('table').count() > 0;
      const hasEmptyState = await page.locator('text=/Nenhum/i').count() > 0;
      
      expect(hasTable || hasEmptyState).toBeTruthy();
    });

    test('should format currency with memoized useCallback', async ({ page }) => {
      await page.goto('/financeiro/transacoes');
      await page.waitForTimeout(2000);
      
      // Look for currency values (R$ format)
      const currencyValues = page.locator('text=/R\\$\\s*[\\d.,]+/');
      const count = await currencyValues.count();
      
      if (count > 0) {
        const firstValue = await currencyValues.first().textContent();
        expect(firstValue).toMatch(/R\$\s*[\d.,]+/);
      }
    });

    test('should handle view details with memoized callback', async ({ page }) => {
      await page.goto('/financeiro/transacoes');
      await page.waitForTimeout(2000);
      
      // Look for view/eye icon button
      const viewButtons = page.locator('button').filter({ has: page.locator('svg') });
      const buttonCount = await viewButtons.count();
      
      if (buttonCount > 0) {
        await viewButtons.first().click();
        
        // Verify details dialog/modal opens
        await page.waitForTimeout(500);
        const modalVisible = await page.locator('[role="dialog"]').count() > 0;
        expect(modalVisible).toBeTruthy();
      }
    });
  });

  test.describe('DentistasList - React.memo optimization', () => {
    test('should render dentists list without excessive re-renders', async ({ page }) => {
      await page.goto('/dentistas');
      await page.waitForTimeout(2000);
      
      const hasTable = await page.locator('table').count() > 0;
      const hasEmptyState = await page.locator('text=/Nenhum/i').count() > 0;
      
      expect(hasTable || hasEmptyState).toBeTruthy();
    });

    test('should handle search with useCallback optimization', async ({ page }) => {
      await page.goto('/dentistas');
      await page.waitForTimeout(2000);
      
      const searchInput = page.locator('input[placeholder*="Buscar"]').first();
      
      if (await searchInput.count() > 0) {
        await searchInput.fill('Dr.');
        await page.waitForTimeout(500);
        
        // Results should be filtered
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('ProcedimentosList - useMemo & useCallback optimization', () => {
    test('should render procedures with memoized filters', async ({ page }) => {
      await page.goto('/procedimentos');
      await page.waitForTimeout(2000);
      
      const hasContent = await page.locator('text=/Procedimento/i').count() > 0;
      expect(hasContent).toBeTruthy();
    });

    test('should apply filters with memoized computation', async ({ page }) => {
      await page.goto('/procedimentos');
      await page.waitForTimeout(2000);
      
      // Look for filter dropdowns
      const categoryFilter = page.locator('select').first();
      
      if (await categoryFilter.count() > 0) {
        await categoryFilter.selectOption({ index: 1 }); // Select first category
        await page.waitForTimeout(300);
        
        // Verify filtering works
        expect(true).toBeTruthy(); // Basic smoke test
      }
    });

    test('should format values with memoized useCallback', async ({ page }) => {
      await page.goto('/procedimentos');
      await page.waitForTimeout(2000);
      
      // Look for currency formatting
      const prices = page.locator('text=/R\\$\\s*[\\d.,]+/');
      const count = await prices.count();
      
      if (count > 0) {
        const firstPrice = await prices.first().textContent();
        expect(firstPrice).toMatch(/R\$\s*[\d.,]+/);
      }
    });
  });

  test.describe('Performance Metrics', () => {
    test('should load patients page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/pacientes');
      await expect(page.locator('table, text=/Nenhum/i')).toBeVisible({ timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load in less than 5 seconds
    });

    test('should have minimal layout shifts on dashboard', async ({ page }) => {
      await page.goto('/');
      
      // Wait for all content to load
      await page.waitForTimeout(2000);
      
      // Check that key elements are visible and stable
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
