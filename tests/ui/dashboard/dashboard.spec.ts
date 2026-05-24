import { test, expect } from '../../../src/fixtures/fixtures';
import { UI_ROUTES } from '../../../src/config/constants';
import { env } from '../../../src/config/env';

/**
 * Dashboard navigation. Uses the pre-authenticated `authedPage` (auth fixture) so we exercise
 * the landing view directly without re-driving the login screen.
 */
test.describe('Dashboard @ui', () => {
  test('projects landing view loads', async ({ authedPage, dashboardPage }) => {
    await authedPage.goto(`${env.baseUrl}${UI_ROUTES.dashboard}`, { waitUntil: 'domcontentloaded' });
    expect(await dashboardPage.isLoaded()).toBe(true);
  });

  test('primary dashboard chrome and actions are available', async ({
    authedPage,
    dashboardPage,
    projectsPage,
  }) => {
    await authedPage.goto(`${env.baseUrl}${UI_ROUTES.dashboard}`, { waitUntil: 'domcontentloaded' });
    await dashboardPage.waitForReady();

    // Top-bar context and the primary create action are present in both empty and populated states.
    await expect(authedPage.getByText('Recent Tests').first()).toBeVisible();
    await expect(projectsPage.createButton).toBeVisible();
  });
});
