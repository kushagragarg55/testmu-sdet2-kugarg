import { request, FullConfig } from '@playwright/test';
import { env } from './config/env';
import { API_ROUTES, TEST_PROJECT_PREFIX } from './config/constants';
import { Project } from './api/ProjectsApiClient';
import { createLogger } from './utils/logger';

const log = createLogger('global-teardown');

/**
 * Risk 2 mitigation: delete every project whose name carries the test prefix, sweeping up
 * any records left behind by interrupted runs (where per-test afterEach cleanup didn't run).
 */
export default async function globalTeardown(_config: FullConfig): Promise<void> {
  let ctx;
  try {
    ctx = await request.newContext();
  } catch (err) {
    log.warn('skipping teardown — could not create request context', String(err));
    return;
  }

  try {
    const res = await ctx.get(`${env.apiBaseUrl}${API_ROUTES.projects}`, {
      headers: { Authorization: env.basicAuthHeader, Accept: 'application/json' },
    });
    if (!res.ok()) {
      log.warn(`skipping teardown — list projects returned ${res.status()}`);
      return;
    }

    const projects = ((await res.json()).data ?? []) as Project[];
    const stale = projects.filter((p) => p.name?.startsWith(TEST_PROJECT_PREFIX));
    log.info(`found ${stale.length} stale test project(s) to clean up`);

    for (const p of stale) {
      const del = await ctx.delete(`${env.apiBaseUrl}${API_ROUTES.projectById(p.project_id)}`, {
        headers: { Authorization: env.basicAuthHeader },
      });
      log.info(`deleted "${p.name}" (${p.project_id}) -> ${del.status()}`);
    }
  } catch (err) {
    log.warn('teardown encountered an error (non-fatal)', String(err));
  } finally {
    await ctx.dispose();
  }
}
