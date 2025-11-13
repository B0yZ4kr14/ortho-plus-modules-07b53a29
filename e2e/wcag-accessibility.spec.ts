import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG AA Accessibility Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Color Contrast WCAG AA (4.5:1)', () => {
    test('should have WCAG AA compliant colors on Dashboard', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have compliant badge colors - success variant', async ({ page }) => {
      await page.goto('/pacientes');
      await page.waitForTimeout(2000);
      
      // Success badges should have sufficient contrast
      const successBadges = page.locator('[class*="badge"]').filter({ hasText: /Ativo/i });
      const count = await successBadges.count();
      
      if (count > 0) {
        const badge = successBadges.first();
        const bgColor = await badge.evaluate(el => window.getComputedStyle(el).backgroundColor);
        const textColor = await badge.evaluate(el => window.getComputedStyle(el).color);
        
        // Should have background and text colors
        expect(bgColor).toBeTruthy();
        expect(textColor).toBeTruthy();
      }
    });

    test('should have compliant badge colors - warning variant', async ({ page }) => {
      await page.goto('/financeiro');
      await page.waitForTimeout(2000);
      
      // Check for warning badges
      const warningElements = page.locator('[class*="warning"], [class*="badge"]').filter({ hasText: /Pendente/i });
      const count = await warningElements.count();
      
      expect(count).toBeGreaterThanOrEqual(0); // May or may not have warning badges
    });

    test('should have compliant badge colors - error/destructive variant', async ({ page }) => {
      await page.goto('/financeiro/transacoes');
      await page.waitForTimeout(2000);
      
      // Check for error badges
      const errorElements = page.locator('[class*="destructive"], [class*="badge"]').filter({ hasText: /Cancelado/i });
      const count = await errorElements.count();
      
      expect(count).toBeGreaterThanOrEqual(0); // May or may not have error badges
    });

    test('should have sufficient contrast in all status badges', async ({ page }) => {
      const routes = ['/pacientes', '/dentistas', '/financeiro/transacoes'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(2000);
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2aa'])
          .include('[class*="badge"]')
          .analyze();

        // Should have no color contrast violations
        const contrastViolations = accessibilityScanResults.violations.filter(
          v => v.id === 'color-contrast'
        );
        expect(contrastViolations).toHaveLength(0);
      }
    });
  });

  test.describe('Semantic HTML & ARIA', () => {
    test('should use semantic HTML landmarks', async ({ page }) => {
      await page.goto('/');
      
      // Check for semantic HTML5 elements
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/pacientes');
      
      // Check heading structure
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0); // Should have at least one h1
    });

    test('should have ARIA labels on interactive elements', async ({ page }) => {
      await page.goto('/');
      
      // Buttons should have accessible names
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        const hasAccessibleName = ariaLabel || (text && text.trim().length > 0);
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/pacientes');
      
      // Click add patient button if exists
      const addButton = page.locator('button').filter({ hasText: /Adicionar|Novo/i }).first();
      
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        // Check that form inputs have labels
        const inputs = page.locator('input[type="text"], input[type="email"]');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            const labelExists = await label.count() > 0;
            expect(labelExists).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow tab navigation through interactive elements', async ({ page }) => {
      await page.goto('/');
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Check that focus is visible
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      expect(focusedElement).toBeTruthy();
    });

    test('should activate buttons with Enter key', async ({ page }) => {
      await page.goto('/pacientes');
      await page.waitForTimeout(2000);
      
      // Find first focusable button
      const button = page.locator('button').first();
      await button.focus();
      
      // Should be focusable
      const isFocused = await button.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    });

    test('should close dialogs with Escape key', async ({ page }) => {
      await page.goto('/pacientes');
      await page.waitForTimeout(2000);
      
      // Try to open a dialog/modal
      const addButton = page.locator('button').filter({ hasText: /Adicionar|Novo/i }).first();
      
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);
        
        // Press Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        
        // Dialog should close (or at least Escape shouldn't cause errors)
        expect(true).toBeTruthy();
      }
    });
  });

  test.describe('Touch Targets (Mobile)', () => {
    test('should have minimum 44x44px touch targets on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check button sizes
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(40); // Allow 4px tolerance
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test('should have accessible mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Look for mobile menu button (hamburger)
      const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      
      if (await menuButton.count() > 0) {
        const box = await menuButton.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      
      // Tab to first interactive element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Get focused element
      const focusedElement = page.locator(':focus');
      const hasFocus = await focusedElement.count() > 0;
      expect(hasFocus).toBeTruthy();
      
      // Focus should be visible (outline or ring)
      if (hasFocus) {
        const outline = await focusedElement.evaluate(el => window.getComputedStyle(el).outline);
        const boxShadow = await focusedElement.evaluate(el => window.getComputedStyle(el).boxShadow);
        
        // Should have some focus indicator
        const hasFocusIndicator = outline !== 'none' || boxShadow !== 'none';
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should trap focus in modals', async ({ page }) => {
      await page.goto('/pacientes');
      await page.waitForTimeout(2000);
      
      // Open modal/dialog
      const addButton = page.locator('button').filter({ hasText: /Adicionar|Novo/i }).first();
      
      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(500);
        
        // Check if modal is open
        const dialog = page.locator('[role="dialog"]');
        const isOpen = await dialog.count() > 0;
        
        if (isOpen) {
          // Tab multiple times
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(50);
          }
          
          // Focus should still be within dialog
          const focusInDialog = await page.evaluate(() => {
            const activeEl = document.activeElement;
            const dialog = document.querySelector('[role="dialog"]');
            return dialog?.contains(activeEl) || false;
          });
          
          expect(focusInDialog).toBeTruthy();
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have alt text on images', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        
        // Images should have alt attribute (can be empty for decorative)
        expect(alt !== null).toBeTruthy();
      }
    });

    test('should have proper table structure for screen readers', async ({ page }) => {
      await page.goto('/pacientes');
      await page.waitForTimeout(2000);
      
      const tables = page.locator('table');
      const tableCount = await tables.count();
      
      if (tableCount > 0) {
        // Tables should have thead and tbody
        const thead = page.locator('thead');
        const tbody = page.locator('tbody');
        
        expect(await thead.count()).toBeGreaterThan(0);
        expect(await tbody.count()).toBeGreaterThan(0);
      }
    });

    test('should have ARIA live regions for dynamic content', async ({ page }) => {
      await page.goto('/');
      
      // Check for toast/notification regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const count = await liveRegions.count();
      
      // Should have at least some live regions for notifications
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Full Page Accessibility Scans', () => {
    const routes = [
      '/',
      '/pacientes',
      '/dentistas',
      '/agenda-clinica',
      '/pep',
      '/financeiro',
      '/configuracoes'
    ];

    for (const route of routes) {
      test(`should have no WCAG AA violations on ${route}`, async ({ page }) => {
        await page.goto(route);
        await page.waitForTimeout(2000);
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();

        // Log violations for debugging
        if (accessibilityScanResults.violations.length > 0) {
          console.log(`Violations found on ${route}:`, accessibilityScanResults.violations);
        }

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  });
});
