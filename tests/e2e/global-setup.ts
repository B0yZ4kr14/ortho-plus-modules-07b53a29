/**
 * Playwright Global Setup
 * Authenticates via API call (bypasses UI login form)
 * and saves the token for all tests to use.
 */
import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, '.auth', 'token.json');

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:8080';
  const backendURL = 'http://localhost:3005';

  try {
    // Call backend /auth/token directly
    const response = await fetch(`${backendURL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@orthomais.com',
        password: 'Admin123!',
      }),
    });

    if (!response.ok) {
      console.error(`[global-setup] Auth API returned ${response.status}, tests will use UI login`);
      // Write empty token so tests fall back to UI login
      fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
      fs.writeFileSync(AUTH_FILE, JSON.stringify({ token: '' }));
      return;
    }

    const data = await response.json();
    const token = data.access_token || data.token || '';

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ token }));
    console.error('[global-setup] Auth token saved successfully');
  } catch (error) {
    console.error('[global-setup] Could not authenticate via API:', error);
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ token: '' }));
  }
}

export default globalSetup;
