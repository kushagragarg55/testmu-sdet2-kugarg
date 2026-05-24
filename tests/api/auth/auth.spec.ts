import { test, expect } from '../../../src/fixtures/fixtures';
import { env } from '../../../src/config/env';
import { API_ROUTES } from '../../../src/config/constants';
import { expectStatus } from '../../../src/utils/assertions';

/**
 * API authentication contract. Auth failures must be explicit (401), never a silent 200,
 * so these guard the Basic Auth boundary on the projects endpoint.
 */
test.describe('API authentication @api', () => {
  test('returns 200 with valid Basic Auth credentials', async ({ request }) => {
    const res = await request.get(`${env.apiBaseUrl}${API_ROUTES.projects}`, {
      headers: { Authorization: env.basicAuthHeader, Accept: 'application/json' },
    });
    await expectStatus(res, 200);
  });

  test('returns 401 with an invalid access key', async ({ request }) => {
    const badToken = Buffer.from(`${env.username}:wrong-access-key`).toString('base64');
    const res = await request.get(`${env.apiBaseUrl}${API_ROUTES.projects}`, {
      headers: { Authorization: `Basic ${badToken}`, Accept: 'application/json' },
    });
    await expectStatus(res, 401);
  });

  test('returns 401 when the Authorization header is missing', async ({ request }) => {
    const res = await request.get(`${env.apiBaseUrl}${API_ROUTES.projects}`, {
      headers: { Accept: 'application/json' },
    });
    await expectStatus(res, 401);
  });
});
