const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure()?.errorText));
  page.on('response', response => console.log('RES:', response.url(), response.status()));
  await page.goto('http://localhost/auth');
  await page.waitForTimeout(1000);
  console.log('Filling...');
  await page.getByLabel(/email/i).fill('admin@orthoplus.com');
  await page.getByLabel(/senha/i).fill('Admin123!');
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForTimeout(3000);
  await browser.close();
})();
