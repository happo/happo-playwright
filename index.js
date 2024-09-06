const Controller = require('happo-e2e/controller');
const pathToBrowserBuild = require.resolve('happo-e2e/browser.build.js');

const controller = new Controller();

module.exports = {
  async init(contextOrPage) {
    await contextOrPage.addInitScript({ path: pathToBrowserBuild });
    await contextOrPage.addInitScript(`
      window.addEventListener('load', () => {
        window.happoTakeDOMSnapshot.init(window);
      });
    `);
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
