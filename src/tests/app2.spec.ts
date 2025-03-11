import { test, expect } from './fixture';

test('basic test', async ({ page, happoScreenshot, double }) => {
  await page.goto('http://localhost:7676');

  const body = page.locator('body');
  const four = double(2);
  expect(four).toBe(4);

  await happoScreenshot(body, {
    component: 'Body',
    variant: 'inside app2',
  });
});
