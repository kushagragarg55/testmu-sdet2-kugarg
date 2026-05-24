import { test as base, Page, APIRequestContext, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../config/env';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectsApiClient } from '../api/ProjectsApiClient';
import { TmsProjectsClient } from '../api/TmsProjectsClient';
import { UI_ROUTES } from '../config/constants';
import { retry } from '../utils/retry';
import { createLogger } from '../utils/logger';

const log = createLogger('fixtures');

interface WorkerFixtures {
  /** Path to a storageState file produced by logging in once per worker (auth fixture). */
  authStatePath: string;
}

interface TestFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  projectsPage: ProjectsPage;
  projectsApi: ProjectsApiClient;
  /** A page that is already authenticated — UI tests use this to skip the login screen. */
  authedPage: Page;
  /**
   * Client for the UI's Test Manager API, authenticated with a Bearer token captured from the
   * app's own live traffic. Used to verify/cleanup UI-created projects (the Basic-Auth API and
   * the UI are different principals, so this is the only way to see UI state from the API layer).
   */
  tms: TmsProjectsClient;
}

/**
 * Custom test fixtures.
 * - Page objects are injected so tests never instantiate locators directly.
 * - `authStatePath` logs in ONCE per worker and reuses the session (improvement: auth fixture).
 * - `projectsApi` wraps the authenticated API client.
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  authStatePath: [
    async ({ browser }, use, workerInfo) => {
      const file = path.join(
        workerInfo.project.outputDir,
        `.auth-worker-${workerInfo.workerIndex}.json`,
      );
      if (!fs.existsSync(file)) {
        log.info(`worker ${workerInfo.workerIndex}: logging in to seed storage state`);
        // The OAuth login is occasionally flaky (intermittently lands on the accounts dashboard),
        // so retry the whole seeding with a fresh context each attempt.
        await retry(
          async () => {
            const context = await browser.newContext();
            try {
              const page = await context.newPage();
              const loginPage = new LoginPage(page);
              await loginPage.open();
              await loginPage.loginAndEnterApp(env.email, env.password);
              await new DashboardPage(page).waitForReady();
              await context.storageState({ path: file });
            } finally {
              await context.close();
            }
          },
          { retries: 3, delayMs: 1000, label: `worker ${workerInfo.workerIndex} login` },
        );
      }
      await use(file);
    },
    // Worker-scoped login does the full OAuth dance once; give it room beyond the 30s default.
    { scope: 'worker', timeout: 120_000 },
  ],

  authedPage: async ({ browser, authStatePath }, use) => {
    const context: BrowserContext = await browser.newContext({ storageState: authStatePath });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ authedPage }, use) => {
    await use(new DashboardPage(authedPage));
  },
  projectsPage: async ({ authedPage }, use) => {
    await use(new ProjectsPage(authedPage));
  },
  projectsApi: async ({ playwright }, use) => {
    const ctx: APIRequestContext = await playwright.request.newContext();
    await use(new ProjectsApiClient(ctx));
    await ctx.dispose();
  },

  tms: async ({ authedPage }, use) => {
    // Capture the Bearer token + exact list URL (with ?filter[product]=…) from the app's own
    // first /tms/projects request as we enter the app. page.request then reuses the session.
    const [req] = await Promise.all([
      authedPage.waitForRequest((r) => r.url().includes('/tms/projects'), { timeout: 30_000 }),
      authedPage.goto(`${env.baseUrl}${UI_ROUTES.app}`, { waitUntil: 'domcontentloaded' }),
    ]);
    const token = req.headers()['authorization'];
    const listUrl = req.url();
    log.info(`captured TMS bearer (len ${token?.length}) and list url`);
    await use(new TmsProjectsClient(authedPage.request, token, listUrl));
  },
});

export { expect } from '@playwright/test';
