const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', response => {
    if (response.url().includes('/api/')) console.log('RES:', response.url(), response.status());
  });
  await page.goto('http://localhost/auth');
  console.log('Got to /auth, filling form...');
  await page.fill('input[type="email"]', 'admin@orthoplus.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  console.log('Clicked submit, waiting 5 seconds...');
  await page.waitForTimeout(5000);
  console.log('URL is now:', page.url());
  await page.screenshot({ path: 'after_login.png' });
  await browser.close();
})();
