/**
 * Shared test fixtures with pre-authenticated browser context.
 * Uses the token obtained by global-setup.ts via API call.
 */
import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, '.auth', 'token.json');

function getAuthToken(): string {
  try {
    const data = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    return data.token || '';
  } catch {
    return '';
  }
}

/**
 * Extended test fixture that injects the auth token into localStorage
 * before each test, bypassing the login form entirely.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const token = getAuthToken();
    if (token) {
      // Inject token into localStorage before any navigation
      await page.addInitScript((t: string) => {
        window.localStorage.setItem('access_token', t);
      }, token);
    }
    await use(page);
  },
});

export { expect };
