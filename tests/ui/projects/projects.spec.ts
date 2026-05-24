import { test, expect } from '../../../src/fixtures/fixtures';
import { UI_ROUTES, testProjectName } from '../../../src/config/constants';
import { env } from '../../../src/config/env';

/**
 * Create-project UI flow. Projects created here live in the UI's (Bearer/product) store, which the
 * Basic-Auth globalTeardown cannot reach — so we clean them up via the `tms` client in afterEach.
 */
test.describe('Create project @ui', () => {
  const createdNames: string[] = [];

  test.beforeEach(async ({ authedPage, dashboardPage }) => {
    await authedPage.goto(`${env.baseUrl}${UI_ROUTES.projects}`, { waitUntil: 'domcontentloaded' });
    await dashboardPage.waitForReady();
  });

  test.afterEach(async ({ tms }) => {
    while (createdNames.length) {
      await tms.deleteByName(createdNames.pop()!);
    }
  });

  test('opens the create drawer with a name field', async ({ projectsPage }) => {
    await projectsPage.openCreateDrawer();
    expect(await projectsPage.drawerVisible()).toBe(true);
  });

  test('create form rejects an empty project name', async ({ projectsPage }) => {
    await projectsPage.openCreateDrawer();
    await projectsPage.fillName('');
    // Either the form gates submit (disabled) or it validates on submit — both must reject an
    // empty name. Only click when enabled so we don't hang on a disabled button.
    if (await projectsPage.submitEnabled()) {
      await projectsPage.clickSubmit();
    }
    expect(await projectsPage.drawerVisible(), 'empty name should not be accepted').toBe(true);
  });

  test('creates a project and it appears in the list', async ({ projectsPage, dashboardPage }) => {
    const name = testProjectName('ui-create');
    createdNames.push(name);
    await projectsPage.createProject(name);

    // Drawer should close and the new project should surface in the list.
    await expect.poll(() => dashboardPage.hasProject(name), { timeout: 15_000 }).toBe(true);
  });
});
