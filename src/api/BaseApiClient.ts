
import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { createLogger } from '../utils/logger';

const log = createLogger('api');

export interface TimedResponse {
  response: APIResponse;
  elapsedMs: number;
}

/**
 * Base API client. Owns auth, base URL, and timing instrumentation so feature clients
 * (e.g. ProjectsApiClient) only describe their routes — Risk 1 mitigation lives here.
 */
export class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string = env.apiBaseUrl,
  ) {}

  protected url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /** Default authenticated headers (Basic Auth: username:accessKey). */
  protected authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      Authorization: env.basicAuthHeader,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extra,
    };
  }

  /** Issue a request and measure wall-clock latency for response-time assertions. */
  protected async timed(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    options: { data?: unknown; headers?: Record<string, string>; auth?: boolean } = {},
  ): Promise<TimedResponse> {
    const { data, headers, auth = true } = options;
    const reqHeaders = auth ? this.authHeaders(headers) : headers;
    const start = Date.now();
    const response = await this.request[method](this.url(path), {
      data: data as any,
      headers: reqHeaders,
    });
    const elapsedMs = Date.now() - start;
    log.info(`${method.toUpperCase()} ${path} -> ${response.status()} (${elapsedMs}ms)`);
    return { response, elapsedMs };
  }
}
