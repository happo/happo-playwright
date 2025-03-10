import Controller from 'happo-e2e/controller';
import type { Page, ElementHandle, Locator } from '@playwright/test';
import { test } from '@playwright/test';

const pathToBrowserBuild = require.resolve('happo-e2e/browser.build.js');

const controller = new Controller();

test.beforeAll(async () => {
  await controller.init();
});

test.afterAll(async () => {
  await controller.finish();
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: pathToBrowserBuild });
});

export async function screenshot(
  page: Page,
  handleOrLocator: ElementHandle | Locator | null,
  {
    component,
    variant,
    snapshotStrategy = 'hoist',
    ...rest
  }: {
    component: string;
    variant: string;
    snapshotStrategy?: 'hoist' | 'clip';
    [key: string]: unknown;
  },
) {
  if (!controller.isActive()) {
    return;
  }

  if (!handleOrLocator) {
    throw new Error(
      'handleOrLocator must be an element handle or a locator, received null.',
    );
  }
  if (handleOrLocator instanceof Promise) {
    throw new Error(
      'handleOrLocator must be an element handle or a locator, received a promise. Please use `await` to resolve the handleOrLocator.',
    );
  }
  if (!component) {
    throw new Error('Missing `component`');
  }
  if (!variant) {
    throw new Error('Missing `variant`');
  }

  const elementHandle =
    'elementHandle' in handleOrLocator
      ? await handleOrLocator.elementHandle()
      : handleOrLocator;

  const snapshot = await page.evaluate(
    ({ element, strategy }) =>
      window.happoTakeDOMSnapshot({
        doc: element?.ownerDocument,
        element,
        strategy,
      }),
    {
      element: elementHandle,
      strategy: snapshotStrategy,
    },
  );

  await controller.registerSnapshot({
    ...snapshot,
    component,
    variant,
    ...rest,
  });
}
