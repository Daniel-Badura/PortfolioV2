import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('current Badura Tech projects replace the historical archive', async ({ page }) => {
  for (const path of ['/', '/projects']) {
    await page.goto(path);
    const project = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Ogrodnictwo Badura', exact: true }) });
    await expect(project).toBeVisible();
    await expect(page.locator('article').first()).toContainText('Badura Tech');
    await expect(project.getByRole('link', { name: 'Visit online store — Ogrodnictwo Badura' })).toHaveAttribute('href', 'https://sklep.ogrodnictwo-badura.pl/');
    await expect(project.getByRole('link', { name: /Source code|Historical demo/i })).toHaveCount(0);
    await expect(project).toContainText('WooCommerce');
  }
  await expect(page.locator('article h3')).toHaveText(['Badura Tech', 'Music Info', 'Ogrodnictwo Badura', 'skle.pl', 'SHOT']);
  for (const [name, url] of [
    ['Visit website — Badura Tech', 'https://baduratech.com/en'],
    ['Visit website — Music Info', 'https://musicinfo.pl/'],
    ['View demo — skle.pl', 'https://skle.pl/shop/'],
    ['View on Steam — SHOT', 'https://store.steampowered.com/app/5381390/'],
  ]) {
    await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', url);
  }
  await page.getByRole('searchbox').fill('WooCommerce');
  await expect(page.locator('article h3')).toHaveText(['Ogrodnictwo Badura', 'skle.pl']);
});

for (const width of [320, 390, 768, 1440]) {
  for (const route of ['/', '/projects', '/contact']) {
    test(route + ' is accessible and fits ' + width + 'px', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(accessibility.violations).toEqual([]);
      expect(errors).toEqual([]);
      await page.screenshot({ path: 'test-results/' + (route.slice(1) || 'home') + '-' + width + '.png', fullPage: true });
    });
  }
}

test('mobile navigation, Escape, route focus and history', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' }).focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL('/projects');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  await page.goBack();
  await expect(page.locator('h1')).toHaveText('Daniel Badura.');
});

test('project search, empty state and reset', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('searchbox').fill('laravel');
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.locator('article')).toContainText('Badura Tech');
  await page.getByRole('searchbox').fill('not-a-project');
  await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('article')).toHaveCount(5);
});

test('API outage preserves the archive and explains fallback', async ({ page }) => {
  await page.route('**/api/projects', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/projects');
  await expect(page.locator('article')).toHaveCount(5);
  await expect(page.getByText('Showing the bundled archive.')).toBeVisible();
});

test('pre-rendered content, metadata, real 404 and no-JS navigation', async ({ browser, request }) => {
  const response = await request.get('/projects');
  const html = await response.text();
  for (const name of ['Badura Tech', 'Music Info', 'Ogrodnictwo Badura', 'skle.pl', 'SHOT']) {
    expect(html).toContain(name);
  }
  for (const name of ['Testowo', 'WebSklep', 'GitHub Lens', 'Widoczki', 'Portfolio v1']) {
    expect(html).not.toContain(name);
  }
  expect(html).toContain('application/ld+json');
  expect((await request.get('/missing')).status()).toBe(404);
  expect((await request.get('/images/missing.webp')).status()).toBe(404);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore my work' }).click();
  await expect(page.locator('article')).toHaveCount(5);
  await context.close();
});

test('production serves compressed assets with immutable caching', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const asset = html.match(/src="([^"]+\.js)"/)[1];
  const response = await request.get(asset, { headers: { 'Accept-Encoding': 'br' } });
  expect(response.headers()['content-encoding']).toBe('br');
  expect(response.headers()['cache-control']).toContain('immutable');
  expect(response.headers()['vary']).toContain('Accept-Encoding');
});

test('keyboard skip link and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  expect(await page.locator('.button').first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
});
