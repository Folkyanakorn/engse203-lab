import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
const U = (process.env.BASE_URL ?? 'http://localhost:3000') + '/#/';
const ok = (name, cond) => console.log(cond ? 'PASS' : 'FAIL', name);

await page.goto(`${U}`); await page.waitForSelector('[data-testid=request-list]');
ok('dashboard 3 cards', (await page.locator('.request-card').count()) === 3);
ok('no horizontal scroll @375', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

await page.goto(`${U}requests/new`); await page.click('button[type=submit]');
ok('invalid form shows errors', (await page.locator('small.error:not(:empty)').count()) === 4);
await page.fill('#requesterName', 'ญาณากร'); await page.selectOption('#requestType', 'แจ้งซ่อม');
await page.fill('#location', 'ห้อง 301'); await page.fill('#details', 'โปรเจกเตอร์เปิดไม่ติด');
await page.click('button[type=submit]');
await page.waitForSelector('[data-testid=page-request-detail] dl');
const newUrl = page.url();
ok('redirect to detail', /#\/requests\/REQ-/.test(newUrl));

await page.reload(); await page.waitForSelector('[data-testid=page-request-detail] dl');
ok('detail survives refresh (server DB)', (await page.textContent('dl')).includes('ญาณากร'));

await page.goto(`${U}`); await page.waitForSelector('.request-card');
ok('dashboard now 4', (await page.locator('.request-card').count()) === 4);
await page.locator('.request-card button').first().click();
await page.waitForFunction(() => document.querySelectorAll('.request-card').length === 3);
ok('delete -> 3', true);
await page.reload(); await page.waitForSelector('.request-card');
ok('delete persisted after refresh', (await page.locator('.request-card').count()) === 3);

await page.click('[data-testid=reset-button]'); await page.waitForTimeout(600);
ok('reset -> seed ids', (await page.locator('.request-id').allTextContents()).join().includes('REQ-001'));

await page.goto(`${U}requests/REQ-999`); await page.waitForSelector('text=ไม่พบคำร้องรหัส');
ok('unknown id -> not found card', (await page.textContent('.state-card')).includes('ไม่พบคำร้อง'));
await page.goto(`${U}?scenario=error`); await page.waitForSelector('[data-testid=error-state]');
ok('error scenario', true);
await page.goto(`${U}?scenario=empty`); await page.waitForSelector('[data-testid=empty-state]');
ok('empty scenario', true);
await page.goto(`${U}nowhere`); await page.waitForSelector('[data-testid=page-not-found]');
ok('404 route', true);
ok('no page errors', errors.length === 0);
await browser.close();
