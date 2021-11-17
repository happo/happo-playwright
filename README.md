# happo-playwright

This library can be used together with
[Playwright](https://playwright.dev/docs/intro) to get Happo screenshots
integrated with integration/end-to-end tests.

## Installation & setup

First, install the library along with the `happo.io` and `happo-e2e` libraries:

```sh
npm install --save-dev happo.io happo-e2e happo-playwright
```

Configure Happo in a `.happo.js` configuration file. The below config file is a
minimal example.

```js
// .happo.js
const { RemoteBrowserTarget } = require('happo.io');

module.exports = {
  targets: {
    chrome: new RemoteBrowserTarget('chrome', {
      viewport: '1024x768',
    }),
  },
};
```

## Spec file setup

Here's an example spec file. It takes a screenshot of a Hero image on an
imaginary page. To make the whole flow work, it's important that you call `init`
and `finish`. In this example, we're using a `beforeEach` hook for
initialization and an `afterEach` hook to finish the happo session.

```js
const happoPlaywright = require('happo-playwright');

test.beforeEach(async ({ page }) => {
  await happoPlaywright.init(page);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

test('start page', async ({ page }) => {
  await page.goto('http://localhost:7676');

  const heroImage = page.locator('.hero-image');

  await happoPlaywright.screenshot(page, heroImage, {
    component: 'Hero Image',
    variant: 'default',
  });
});
```

## Usage

When you run your tests, you need to wrap the command with the `happo-e2e`
script, like this:

```sh
npx happo-e2e -- npx playwright test
```

This will ensure that Happo combines all the screenshots taken into a single
job. When the process exits, you'll see a url logged at the end. Use this to
inspect your screenshots.
