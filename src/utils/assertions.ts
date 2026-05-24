import { expect, APIResponse } from '@playwright/test';
import { TIMEOUTS } from '../config/constants';

/**
 * Custom, reusable assertions for the API layer. Keeping these here (rather than inline in
 * tests) means a schema or SLA change is updated once and every test inherits it.
 */

type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export type Schema = Record<string, FieldType | { type: FieldType; optional?: boolean }>;

/** Assert an HTTP response returned the expected status, with a readable failure message. */
export async function expectStatus(response: APIResponse, expected: number): Promise<void> {
  const actual = response.status();
  expect(
    actual,
    `Expected status ${expected} but got ${actual} for ${response.url()}\nBody: ${await safeBody(response)}`,
  ).toBe(expected);
}

/** Assert the request completed within the SLA (default from constants). */
export function expectResponseTimeUnder(
  elapsedMs: number,
  sla = TIMEOUTS.apiResponseSla,
): void {
  expect(elapsedMs, `Response took ${elapsedMs}ms, SLA is ${sla}ms`).toBeLessThanOrEqual(sla);
}

/** Lightweight structural schema validation — no external dependency. */
export function expectSchema(payload: unknown, schema: Schema): void {
  expect(payload, 'Expected a non-null object payload').toMatchObject({});
  const obj = payload as Record<string, unknown>;

  for (const [key, spec] of Object.entries(schema)) {
    const { type, optional } =
      typeof spec === 'string' ? { type: spec, optional: false } : spec;
    const value = obj[key];

    if (value === undefined || value === null) {
      if (!optional) {
        expect(value, `Missing required field "${key}"`).not.toBeUndefined();
      }
      continue;
    }
    expect(actualType(value), `Field "${key}" should be ${type}`).toBe(type);
  }
}

function actualType(value: unknown): FieldType {
  if (Array.isArray(value)) return 'array';
  return typeof value as FieldType;
}

async function safeBody(response: APIResponse): Promise<string> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return '<unreadable body>';
  }
}
