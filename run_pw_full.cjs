const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', response => {
    if (response.url().includes('/api/')) console.log('RES:', response.url(), response.status());
  });
  await page.goto('http://localhost/auth');
  console.log('Got to /auth, waiting for network...');
  await page.waitForLoadState('networkidle');
  console.log('Filling form...');
  await page.fill('input[type="email"]', 'admin@orthoplus.com');
  await page.fill('input[type="password"]', 'Admin123!');
  console.log('Clicking submit...');
  await page.click('button[type="submit"]');
  console.log('Waiting 5 seconds...');
  await page.waitForTimeout(5000);
  console.log('Final URL:', page.url());
  const bodyText = await page.innerText('body');
  console.log('BODY TEXT PREVIEW:', bodyText.substring(0, 150));
  await browser.close();
})();
