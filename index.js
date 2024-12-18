const Controller = require('happo-e2e/controller');
const pathToBrowserBuild = require.resolve('happo-e2e/browser.build.js');

const controller = new Controller();

async function lazyLoadBrowserBundle(page) {
  if (
    await page.evaluate(() => typeof window.happoTakeDOMSnapshot === 'undefined')
  ) {
    await page.addScriptTag({ path: pathToBrowserBuild });

    // Add timeout check for happoTakeDOMSnapshot
    try {
      await page.waitForFunction(
        () => typeof window.happoTakeDOMSnapshot !== 'undefined',
        { timeout: 10000 },
      );
    } catch (error) {
      throw new Error('Timed out waiting for happoTakeDOMSnapshot to be defined');
    }
  }
}

module.exports = {
  async init(pageOrContext) {
    if (pageOrContext) {
      console.warn(
        '[HAPPO] You no longer need to pass a page or context to happoPlaywright.init()',
      );
    }
    await controller.init();
  },

  async finish() {
    await controller.finish();
  },

  async screenshot(page, handleOrLocator, { component, variant, ...rest }) {
    if (!controller.isActive()) {
      return;
    }

    if (!component) {
      throw new Error('Missing `component`');
    }
    if (!variant) {
      throw new Error('Missing `variant`');
    }
    if (handleOrLocator instanceof Promise) {
      throw new Error(
        'handleOrLocator must be an element handle or a locator, received a promise. Please use `await` to resolve the handleOrLocator.',
      );
    }

    await lazyLoadBrowserBundle(page);

    const elementHandle = handleOrLocator.elementHandle
      ? await handleOrLocator.elementHandle()
      : handleOrLocator;
    const snapshot = await page.evaluate(
      (element) =>
        window.happoTakeDOMSnapshot({ doc: element.ownerDocument, element }),
      elementHandle,
    );
    await controller.registerSnapshot({
      ...snapshot,
      component,
      variant,
      ...rest,
    });
  },
};
