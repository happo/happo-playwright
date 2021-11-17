const Controller = require('happo-e2e/controller');

const controller = new Controller();

module.exports = {
  async init(page) {
    await page.addInitScript({
      path: './node_modules/happo-e2e/browser.build.js',
    });
    await page.evaluate(() => {
      window.addEventListener('load', () => {
        window.happoTakeDOMSnapshot.init(window);
      });
    });
    await controller.init();
  },

  async finish() {
    await controller.finish();
  },

  async screenshot(page, handleOrLocator, { component, variant }) {
    if (!component) {
      throw new Error('Missing `component`');
    }
    if (!variant) {
      throw new Error('Missing `variant`');
    }
    const elementHandle = handleOrLocator.elementHandle
      ? await handleOrLocator.elementHandle()
      : handleOrLocator;
    const snapshot = await page.evaluate(
      element =>
        window.happoTakeDOMSnapshot({ doc: element.ownerDocument, element }),
      elementHandle,
    );
    await controller.registerSnapshot({ ...snapshot, component, variant });
  },
};
