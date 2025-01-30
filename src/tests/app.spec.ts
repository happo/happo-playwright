import { test, expect } from '@playwright/test';
import * as happoPlaywright from '..';

function assertError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    throw new Error(
      `Expected an error, got ${typeof error}: ${JSON.stringify(error)}`,
    );
  }
}

test.beforeAll(async () => {
  await happoPlaywright.init();
});

test.afterAll(async () => {
  await happoPlaywright.finish();
});

test('basic test', async ({ page }) => {
  expect(process.env.HAPPO_API_KEY).toBeDefined();
  expect(process.env.HAPPO_API_SECRET).toBeDefined();

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

  const stretchToParent = page.locator('#stretch-to-parent');

  await happoPlaywright.screenshot(page, stretchToParent, {
    component: 'StretchToParent',
    variant: 'snapshotStrategy hoist',
    snapshotStrategy: 'hoist',
  });

  await happoPlaywright.screenshot(page, stretchToParent, {
    component: 'StretchToParent',
    variant: 'snapshotStrategy hoist',
    snapshotStrategy: 'clip',
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
      await happoPlaywright.screenshot(
        page,
        // @ts-expect-error Argument of type 'Promise<ElementHandleForTag<"h2"> | null>' is not assignable to parameter of type 'ElementHandle<Node> | Locator | null'.ts(2345)
        page.$('h2'),
        {
          component: 'Title',
          variant: 'goodbye without await',
        },
      );
    } catch (error) {
      assertError(error);
      caughtError = error;
    }

    if (!caughtError) {
      throw new Error('Expected an error');
    }

    expect(caughtError.message).toContain(
      'handleOrLocator must be an element handle or a locator, received a promise',
    );
  }

  {
    // We expect an error about missing component
    let caughtError;

    try {
      await happoPlaywright.screenshot(
        page,
        await page.$('h2'),
        // @ts-expect-error Property 'component' is missing in type '{ variant: string; }'
        {
          variant: 'goodbye without await',
        },
      );
    } catch (error) {
      assertError(error);
      caughtError = error;
    }

    if (!caughtError) {
      throw new Error('Expected an error');
    }

    expect(caughtError.message).toContain('Missing `component`');
  }

  {
    // We expect an error about missing variant
    let caughtError;
    try {
      await happoPlaywright.screenshot(
        page,
        await page.$('h2'),
        // @ts-expect-error Property 'variant' is missing in type '{ component: string; }'
        {
          component: 'Title',
        },
      );
    } catch (error) {
      assertError(error);
      caughtError = error;
    }

    if (!caughtError) {
      throw new Error('Expected an error');
    }

    expect(caughtError.message).toContain('Missing `variant`');
  }
});
