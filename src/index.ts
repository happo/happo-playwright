/* eslint-disable no-empty-pattern */
import { test as base, ElementHandle, Locator } from '@playwright/test';
import Controller from 'happo-e2e/controller';

const pathToBrowserBuild = require.resolve('happo-e2e/browser.build.js');

const controller = new Controller();

// Define the type for the screenshot function
export type ScreenshotFunction = (
  handleOrLocator: ElementHandle | Locator | null,
  options: {
    component: string;
    variant: string;
    snapshotStrategy?: 'hoist' | 'clip';
    [key: string]: unknown;
  },
) => Promise<void>;

const BATCH_SIZE = 4;
let specCounter = 0;

// Extend Playwright's `test` object with the `screenshot` fixture
export const test = base.extend<
  {
    happoScreenshot: ScreenshotFunction;
    _happoForEachTest: void;
  },
  {
    _happoForEachWorker: void;
  }
>({
  // Runs once per worker, before any test starts
  _happoForEachWorker: [
    async ({}, use) => {
      await controller.init();
      await use();

      // It's possible that the call to `finish` is not needed, since it's
      // called in the `_happoSpecWrapper` function. In that case, the finish
      // call will be a no-op.
      await controller.finish();
    },
    { scope: 'worker', auto: true },
  ],

  _happoForEachTest: [
    async ({}, use) => {
      specCounter++;
      await use();
      if (specCounter % BATCH_SIZE === 0) {
        // Send batch of 4 screenshots to Happo
        await controller.finish();
        // Clear the controller to make it ready for the next batch
        await controller.init();
      }
    },
    { scope: 'test', auto: true },
  ],

  // Injects the Happo script before each test
  page: async ({ page }, use) => {
    await page.addInitScript({ path: pathToBrowserBuild });
    await use(page);
  },

  // Passes down the happoScreenshot function as a fixture
  happoScreenshot: async ({ page }, use) => {
    const happoScreenshot: ScreenshotFunction = async (
      handleOrLocator,
      { component, variant, snapshotStrategy = 'hoist', ...rest },
    ) => {
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
    };

    await use(happoScreenshot);
  },
});
