import { test, expect } from '../../../src/fixtures/fixtures';
import { expectStatus } from '../../../src/utils/assertions';
import { testData } from '../../../src/fixtures/testData';

/**
 * Error-contract coverage. Clients depend on predictable 4xx responses, so these assert the
 * API rejects bad input/unknown resources rather than failing open.
 */
test.describe('API error handling @api', () => {
  test('returns 404 for an unknown project id', async ({ projectsApi }) => {
    const { response } = await projectsApi.get('01KZZZZZZZZZZZZZZZZZZZZZZZZ');
    await expectStatus(response, 404);
  });

  // Data-driven: invalid create payloads sourced from test-data/invalid-payloads.json
  for (const { description, payload, expectedStatuses } of testData.invalidProjectPayloads()) {
    test(`rejects invalid create payload: ${description}`, async ({ projectsApi }) => {
      const { response } = await projectsApi.createRaw(payload as any, { auth: true });
      expect(
        expectedStatuses,
        `expected one of ${expectedStatuses.join('/')} but got ${response.status()}`,
      ).toContain(response.status());
    });
  }
});
