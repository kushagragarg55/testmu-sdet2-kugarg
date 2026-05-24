import { test, expect } from '../../../src/fixtures/fixtures';
import { UI_ROUTES } from '../../../src/config/constants';
import { env } from '../../../src/config/env';

/**
 * Cross-browser smoke (@smoke). Run via `npm run test:smoke`, which executes across the
 * chromium, firefox, and webkit projects — this is the suite's multi-browser coverage.
 * Validates that auth + the dashboard render on every engine.
 */
test.describe('Cross-browser smoke @smoke @ui', () => {
  test('authenticated dashboard renders', async ({ authedPage, dashboardPage }) => {
    await authedPage.goto(`${env.baseUrl}${UI_ROUTES.dashboard}`, { waitUntil: 'domcontentloaded' });
    expect(await dashboardPage.isLoaded()).toBe(true);
    await expect(authedPage).toHaveURL(/test-manager\.lambdatest\.com/);
  });
});
