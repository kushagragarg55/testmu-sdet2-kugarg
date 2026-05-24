import { test, expect } from '../../src/fixtures/fixtures';
import { UI_ROUTES, testProjectName } from '../../src/config/constants';
import { env } from '../../src/config/env';

/**
 * End-to-end flow combining the UI and API layers.
 *
 * Design note: LambdaTest's access-key Basic-Auth API and the web UI resolve different
 * principals/scopes — a project created via the Basic-Auth API never appears in the UI. So the
 * honest cross-layer assertion is the reverse of the brief's example: create through the UI, then
 * confirm the SAME record is retrievable through the API the UI actually uses (the product-scoped
 * /tms endpoint, via a Bearer token captured from live traffic). This proves both layers operate
 * on one data source. See test-strategy.md for the full rationale.
 */
test.describe('Integration: UI -> Test Manager API @integration', () => {
  let createdName: string | undefined;

  test.afterEach(async ({ tms }) => {
    if (createdName) {
      await tms.deleteByName(createdName);
      createdName = undefined;
    }
  });

  test('a project created in the UI is retrievable via the Test Manager API', async ({
    authedPage,
    dashboardPage,
    projectsPage,
    tms,
  }) => {
    const name = testProjectName('ui-to-api');
    createdName = name;

    // 1. Create through the UI
    await authedPage.goto(`${env.baseUrl}${UI_ROUTES.projects}`, { waitUntil: 'domcontentloaded' });
    await dashboardPage.waitForReady();
    await projectsPage.createProject(name);

    // 2. UI layer: it shows up in the list
    await expect.poll(() => dashboardPage.hasProject(name), { timeout: 15_000 }).toBe(true);

    // 3. API layer: the same record is retrievable via the Test Manager API
    await expect
      .poll(async () => (await tms.findByName(name)) !== null, { timeout: 15_000 })
      .toBe(true);

    const fromApi = await tms.findByName(name);
    expect(fromApi?.name).toBe(name);
  });
});
