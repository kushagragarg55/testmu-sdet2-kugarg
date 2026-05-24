/**
 * Centralised constants — Risk 1 mitigation (API endpoint instability).
 * All UI paths, API routes, and timing knobs live here so a route change is a one-file fix.
 */

/** Prefix applied to every project created by the suite, so teardown can find and delete them. */
export const TEST_PROJECT_PREFIX = '[TEST-';

/** Build the standard test project name with a timestamp suffix for uniqueness across runs. */
export function testProjectName(label = 'project'): string {
  return `${TEST_PROJECT_PREFIX}${label}-${Date.now()}]`;
}

/**
 * UI routes. Login is centralised on accounts.lambdatest.com; navigating to a protected
 * app route triggers the OAuth redirect to the login page and back.
 */
export const UI_ROUTES = {
  /** Protected app entry — hitting this unauthenticated redirects to the accounts login. */
  app: '/projects',
  dashboard: '/projects',
  projects: '/projects',
} as const;

/**
 * API routes (relative to LT_API_BASE_URL).
 * - `/projects` is the access-key (Basic Auth) surface used by API tests; full CRUD lives here,
 *   including DELETE /projects/{id} (which also serves the UI's session principal via Bearer).
 * - `/tms/projects` is the product-scoped surface the WEB UI reads (Bearer). The full list URL,
 *   including ?filter[product]=…, is captured at runtime in the `tms` fixture.
 */
export const API_ROUTES = {
  projects: '/projects',
  projectById: (id: string | number) => `/projects/${id}`,
  tmsProjects: '/tms/projects',
} as const;

/** Timing knobs (ms). Centralised so timeouts are tuned in one place, not scattered in tests. */
export const TIMEOUTS = {
  action: 10_000,
  navigation: 30_000,
  apiResponseSla: 2_000,
} as const;
