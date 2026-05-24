import { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import { API_ROUTES } from '../config/constants';
import { Project } from './ProjectsApiClient';
import { createLogger } from '../utils/logger';

const log = createLogger('tms-api');

/**
 * Client for the Test Manager API the WEB UI uses (/tms/projects, product-scoped, Bearer auth).
 *
 * Why this exists: the access-key Basic-Auth API (ProjectsApiClient) and the UI resolve DIFFERENT
 * principals/scopes, so projects created via Basic Auth are invisible to the UI and vice-versa.
 * To assert UI state from the API layer (integration test) we must speak to the same endpoint the
 * UI does, using a Bearer token captured from the app's live traffic.
 *
 * The Bearer token and the exact list URL (which carries ?filter[product]=…) are captured at
 * runtime in the `tms` fixture — they are session/product specific and must not be hard-coded.
 */
export class TmsProjectsClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly bearer: string,
    private readonly listUrl: string,
  ) {}

  private headers(): Record<string, string> {
    return { Authorization: this.bearer, Accept: 'application/json' };
  }

  /** List projects in the UI's product scope. Bumps per_page so recent creates aren't paged out. */
  async list(): Promise<Project[]> {
    const url = this.listUrl.replace(/per_page=\d+/, 'per_page=100');
    const res = await this.request.get(url, { headers: this.headers() });
    log.info(`GET tms/projects -> ${res.status()}`);
    if (!res.ok()) return [];
    return ((await res.json()).data ?? []) as Project[];
  }

  async findByName(name: string): Promise<Project | null> {
    return (await this.list()).find((p) => p.name === name) ?? null;
  }

  /** Delete by id. The session principal deletes via /projects/{id} with the Bearer token. */
  async delete(id: string): Promise<number> {
    const res = await this.request.delete(`${env.apiBaseUrl}${API_ROUTES.projectById(id)}`, {
      headers: this.headers(),
    });
    log.info(`DELETE projects/${id} -> ${res.status()}`);
    return res.status();
  }

  /** Best-effort cleanup used by afterEach hooks; never throws. */
  async deleteByName(name: string): Promise<void> {
    const found = await this.findByName(name).catch(() => null);
    if (found) await this.delete(found.project_id).catch(() => {});
  }
}
