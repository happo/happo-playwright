import { test } from './fixture';
import * as happoPlaywright from '..';

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:7676');

  const body = page.locator('body');

  await happoPlaywright.screenshot(page, body, {
    component: 'Body',
    variant: 'inside app2',
  });
});
