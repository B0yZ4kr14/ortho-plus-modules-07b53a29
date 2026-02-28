const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost/auth');
  await page.fill('input[type="email"]', 'admin@orthoplus.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000); // 2 seconds, before Toast disappears!
  await page.screenshot({ path: 'auth_toast.png' });
  const token = await page.evaluate(() => localStorage.getItem('supabase.auth.token'));
  console.log('LOCAL STORAGE TOKEN:', token);
  await page.waitForTimeout(3000);
  console.log('FINAL URL:', page.url());
  await browser.close();
})();
