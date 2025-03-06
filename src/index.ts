import Controller from 'happo-e2e/controller';
import type { Page, ElementHandle, Locator } from '@playwright/test';
import fs from 'fs/promises';
const pathToBrowserBuild = require.resolve('happo-e2e/browser.build.js');

const controller = new Controller();

async function lazyLoadBrowserBundle(page: Page, cspNonce?: string) {
  if (
    await page.evaluate(() => typeof window.happoTakeDOMSnapshot === 'undefined')
  ) {
    if (cspNonce) {
      // We need to inject the browser bundle content into the page with the
      // given nonce. Since `page.addScriptTag` doesn't support nonces, we need
      // to do it manually.
      const browserBundleContent = await fs.readFile(pathToBrowserBuild, 'utf8');
      console.log('browserBundleContent', browserBundleContent.length);
      await page.evaluate(
        ({ content, nonce }: { content: string; nonce: string }) => {
          const script = document.createElement('script');
          script.textContent = content;
          console.log('nonce', nonce);
          console.log('content', content.length);
          script.nonce = nonce;
          document.head.appendChild(script);
        },
        { content: browserBundleContent, nonce: cspNonce },
      );
    } else {
      // If there is no nonce, we can just use `page.addScriptTag` as usual.
      await page.addScriptTag({ path: pathToBrowserBuild });
    }

    // Add timeout check for happoTakeDOMSnapshot
    try {
      await page.waitForFunction(
        () => typeof window.happoTakeDOMSnapshot !== 'undefined',
        { timeout: 10000 },
      );
    } catch {
      throw new Error('Timed out waiting for happoTakeDOMSnapshot to be defined');
    }
  }
}

export async function init(pageOrContext?: never) {
  if (pageOrContext) {
    console.warn(
      '[HAPPO] You no longer need to pass a page or context to happoPlaywright.init()',
    );
  }

  await controller.init();
}

export async function finish() {
  await controller.finish();
}

export async function screenshot(
  page: Page,
  handleOrLocator: ElementHandle | Locator | null,
  {
    component,
    variant,
    cspNonce,
    snapshotStrategy = 'hoist',
    ...rest
  }: {
    component: string;
    variant: string;
    cspNonce?: string;
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

  await lazyLoadBrowserBundle(page, cspNonce);

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
