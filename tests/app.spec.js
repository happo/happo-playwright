const { test, expect } = require('@playwright/test');
const happoPlaywright = require('../');

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:7676');

  const title = page.locator('h1');

  await happoPlaywright.screenshot(page, title, {
    component: 'Title',
    variant: 'default',
    targets: [
      'chrome',
      { name: 'firefox-small', browser: 'firefox', viewport: '400x800' },
    ],
  });

  await page.click('text=goodbye');

  await expect(page.locator('text=Sad to see you go').first()).toBeVisible();

  await happoPlaywright.screenshot(page, await page.$('h2'), {
    component: 'Title',
    variant: 'goodbye',
  });

  {
    // We expect an error about using a promise as handleOrLocator
    let caughtError;
    try {
      await happoPlaywright.screenshot(page, page.$('h2'), {
        component: 'Title',
        variant: 'goodbye without await',
      });
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeDefined();
    expect(caughtError.message).toContain(
      'handleOrLocator must be an element handle or a locator, received a promise',
    );
  }

  {
    // We expect an error about missing component
    let caughtError;
    try {
      await happoPlaywright.screenshot(page, await page.$('h2'), {
        variant: 'goodbye without await',
      });
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeDefined();
    expect(caughtError.message).toContain('Missing `component`');
  }

  {
    // We expect an error about missing variant
    let caughtError;
    try {
      await happoPlaywright.screenshot(page, await page.$('h2'), {
        component: 'Title',
      });
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeDefined();
    expect(caughtError.message).toContain('Missing `variant`');
  }
});
