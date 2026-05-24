import { test, expect } from '../../../src/fixtures/fixtures';
import { DashboardPage } from '../../../src/pages/DashboardPage';
import { env } from '../../../src/config/env';
import { testData } from '../../../src/fixtures/testData';

/**
 * Login flow — the entry gate. A regression here blocks every other journey, so we cover the
 * happy path plus the invalid/empty cases (data-driven from test-data/invalid-logins.json).
 * Note: login uses the fresh `page` fixture, NOT the pre-authenticated `authedPage`.
 */
test.describe('Login @ui', () => {
  test('valid credentials land the user in the app', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.loginAndEnterApp(env.email, env.password);

    await expect(page).toHaveURL(/test-manager\.lambdatest\.com/);
    expect(await new DashboardPage(page).isLoaded()).toBe(true);
  });

  for (const c of testData.invalidLogins()) {
    test(`rejects login: ${c.description}`, async ({ page, loginPage }) => {
      await loginPage.open();
      await loginPage.fillCredentials(c.email, c.password);

      // The submit may be disabled (empty fields) or blocked by native validation
      // (malformed email); tolerate that rather than waiting on a dead button.
      if (await loginPage.submitEnabled()) {
        await loginPage.submit();
        await page.waitForLoadState('networkidle').catch(() => {});
      }

      // Whatever the failure mode, the user must not be let into the app.
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });
  }
});
