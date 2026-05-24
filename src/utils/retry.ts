import { createLogger } from './logger';

const log = createLogger('retry');

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  /** Exponential backoff factor applied to delayMs after each failure. */
  factor?: number;
  label?: string;
}

/**
 * Retry an async operation with exponential backoff.
 * Intended for genuinely flaky boundaries (network, eventual consistency), NOT for
 * masking real bugs — keep retry counts low and the label descriptive.
 */
export async function retry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 3, delayMs = 500, factor = 2, label = 'operation' } = opts;
  let lastError: unknown;
  let wait = delayMs;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      log.warn(`${label} failed (attempt ${attempt}/${retries}), retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
      wait *= factor;
    }
  }
  throw lastError;
}
