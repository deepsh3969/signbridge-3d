import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5174';
const OUT = path.resolve('screenshots');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROUTES = [
  ['/', 'landing'],
  ['/learn', 'learn'],
  ['/signs', 'signs'],
  ['/sign/hello', 'sign-hello'],
  ['/sign/thank-you', 'sign-thank-you'],
  ['/practice', 'practice'],
  ['/quiz', 'quiz'],
  ['/progress', 'progress'],
  ['/communicate', 'communicate'],
  ['/settings', 'settings'],
  ['/login', 'login'],
  ['/register', 'register'],
  ['/does-not-exist', 'notfound'],
];

const errors = [];

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(() => {
    localStorage.setItem(
      'signbridge.settings',
      JSON.stringify({
        state: { onboarded: true, guest: true, darkMode: false },
        version: 2,
      }),
    );
  });
  await page.reload({ waitUntil: 'load', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 800));
  // dismiss onboarding if it is still presented (first-run experience)
  try {
    const btn = await page.$$('button');
    for (const b of btn) {
      const txt = await b.evaluate((el) => el.textContent || '');
      if (txt.includes('Skip — explore as guest')) {
        await b.click();
        break;
      }
    }
  } catch {
    /* ignore */
  }
  await new Promise((r) => setTimeout(r, 500));

  for (const [route, name] of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 90000 });
    await new Promise((r) => setTimeout(r, 1400));
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
    console.log(`✓ ${route}`);
  }

  // mobile pass
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  for (const [route, name] of ROUTES.slice(0, 8)) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 90000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUT, `mobile-${name}.png`), fullPage: false });
  }
  console.log('✓ mobile pass');

  await browser.close();

  if (errors.length) {
    console.log('\n--- ERRORS ---');
    [...new Set(errors)].forEach((e) => console.log(e));
    process.exitCode = 1;
  } else {
    console.log('\nNo console or page errors detected.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
