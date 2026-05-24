import { BaseApiClient, TimedResponse } from './BaseApiClient';
import { API_ROUTES } from '../config/constants';

export interface ProjectInput {
  name: string;
  description?: string;
}

/** Shape of a project record as returned by GET /projects and GET /projects/{id}. */
export interface Project {
  project_id: string;
  name: string;
  description: string;
  test_case_count: number;
  test_plan_count: number;
  test_build_count: number;
  test_run_count: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

/** POST /projects response — note the created id is `id`, not `project_id`. */
export interface CreateProjectResponse {
  message: string;
  type: string;
  id: string;
}

/**
 * Typed CRUD wrapper for the Projects resource. Routes come from API_ROUTES so an endpoint
 * change is a one-line edit in constants.ts (Risk 1 mitigation).
 */
export class ProjectsApiClient extends BaseApiClient {
  list(): Promise<TimedResponse> {
    return this.timed('get', API_ROUTES.projects);
  }

  create(project: ProjectInput): Promise<TimedResponse> {
    return this.timed('post', API_ROUTES.projects, { data: project });
  }

  get(id: string | number): Promise<TimedResponse> {
    return this.timed('get', API_ROUTES.projectById(id));
  }

  /** Update is PUT on the collection with the project_id carried in the body. */
  update(id: string, project: Partial<ProjectInput>): Promise<TimedResponse> {
    return this.timed('put', API_ROUTES.projects, { data: { project_id: id, ...project } });
  }

  delete(id: string | number): Promise<TimedResponse> {
    return this.timed('delete', API_ROUTES.projectById(id));
  }

  /** Create with explicit headers/auth control — used by auth tests to send bad/no credentials. */
  createRaw(
    project: ProjectInput,
    opts: { headers?: Record<string, string>; auth?: boolean },
  ): Promise<TimedResponse> {
    return this.timed('post', API_ROUTES.projects, { data: project, ...opts });
  }

  /** Convenience: create a project and return its new id, asserting nothing (caller asserts status). */
  async createAndGetId(project: ProjectInput): Promise<{ id: string; elapsedMs: number }> {
    const { response, elapsedMs } = await this.create(project);
    const body = (await response.json()) as CreateProjectResponse;
    return { id: body.id, elapsedMs };
  }
}
