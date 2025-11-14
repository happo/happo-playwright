# happo-playwright

> **⚠️ Notice:** This package has been merged into the
> [`happo`](https://github.com/happo/happo) package. Please install `happo`
> instead:
>
> ```bash
> npm install --save-dev happo
> ```
>
> [Migration guide](https://docs.happo.io/docs/migrating-from-legacy-packages)

---

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

Below is an example Playwright spec file. It takes a screenshot of a Hero image
on an imaginary page.

```js
// tests/test.spec.js
import { test } from 'happo-playwright';

test('start page', async ({ page, happoScreenshot }) => {
  await page.goto('http://localhost:7676');

  const heroImage = page.locator('.hero-image');

  await happoScreenshot(heroImage, {
    component: 'Hero Image',
    variant: 'default',
  });
});
```

### With Playwright fixtures

If you're using
[Playwright fixtures](https://playwright.dev/docs/test-fixtures), you can mix
happo-playwright in with
[`mergeTests`](https://playwright.dev/docs/test-fixtures#combine-custom-fixtures-from-multiple-modules).

Here's an example of how to do this:

```js
// tests/test.js
import { test as happoTest } from 'happo-playwright';
import { test as base, mergeTests } from '@playwright/test';

const baseTest = base.extend({
  myFixture: async ({}, use) => {
    await use('my fixture value');
  },
});

export const test = mergeTests(baseTest, happoTest);
```

Then in your Playwright test file, you can use the `test` function as usual:

```js
// tests/test.spec.js
import { test } from './test';

test('start page', async ({ page, happoScreenshot }) => {
  await page.goto('http://localhost:7676');

  const heroImage = page.locator('.hero-image');

  await happoScreenshot(heroImage, {
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
