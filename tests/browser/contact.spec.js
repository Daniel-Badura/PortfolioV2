import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const endpoint = 'https://formspree.io/f/moevqqvl';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

async function fillForm(page) {
  await page.getByLabel('Your name', { exact: true }).fill('Portfolio test');
  await page.getByLabel('Email address', { exact: true }).fill('test@example.com');
  await page.getByLabel('Message', { exact: true }).fill('An integration test intercepted locally, never sent.');
}

// No test may send data to the real Formspree service.
test.beforeEach(async ({ context }) => {
  await context.route('https://formspree.io/**', route => route.abort());
});

test('form submits once, announces success and offers a fresh form', async ({ page }) => {
  let requests = 0;
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route(endpoint, async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    requests++;
    expect(route.request().method()).toBe('POST');
    expect(route.request().postData()).toContain('test@example.com');
    expect(route.request().postData()).toContain('name="_gotcha"');
    await pending;
    await route.fulfill({ status: 200, headers: cors, json: { next: 'https://formspree.io/thanks' } });
  });
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('button', { name: 'Sending' })).toBeDisabled();
  await expect(page.getByLabel('Your name', { exact: true })).toBeDisabled();
  release();
  await expect(page.getByRole('status')).toContainText('Your message has been submitted successfully');
  await expect(page.getByRole('status')).toBeFocused();
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Write another message' }).click();
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
});

test('browser validation blocks empty and invalid fields', async ({ page }) => {
  let submissions = 0;
  await page.route(endpoint, route => { submissions++; return route.abort(); });
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
  await fillForm(page);
  await page.getByLabel('Email address', { exact: true }).fill('not-an-email');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByLabel('Email address', { exact: true })).toBeFocused();
  expect(submissions).toBe(0);
});

test('service field errors are associated with inputs and preserve the message', async ({ page }) => {
  await page.route(endpoint, route => route.request().method() === 'OPTIONS'
    ? route.fulfill({ status: 204, headers: cors })
    : route.fulfill({ status: 422, headers: cors, json: { errors: [{ field: 'email', code: 'TYPE_EMAIL', message: 'Please use a valid email address.' }] } }));
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('alert')).toContainText('check the highlighted fields');
  await expect(page.getByLabel('Email address', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#email-error')).toHaveText('Please use a valid email address.');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue(/integration test/);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
});

for (const failure of ['network', 'rate limit', 'server', 'unexpected response']) {
  test(failure + ' never shows false success or clears the message', async ({ page }) => {
    await page.route(endpoint, route => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      if (failure === 'network') return route.abort();
      if (failure === 'unexpected response') return route.fulfill({ status: 200, headers: cors, json: {} });
      return route.fulfill({ status: failure === 'rate limit' ? 429 : 500, headers: cors, json: { errors: [{ message: 'Temporarily unavailable' }] } });
    });
    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('alert')).toContainText('couldn’t confirm');
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(/integration test/);
    await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
    await expect(page.getByText('Your message has been submitted successfully')).toHaveCount(0);
  });
}

test('native form posts to the same endpoint without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route('https://formspree.io/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Submission intercepted locally</h1>' }));
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page).toHaveURL(endpoint);
  await expect(page.locator('h1')).toHaveText('Submission intercepted locally');
  await context.close();
});
