import { test, expect } from '../../../src/fixtures/fixtures';
import { testProjectName } from '../../../src/config/constants';
import { expectStatus, expectResponseTimeUnder, expectSchema } from '../../../src/utils/assertions';
import { Project } from '../../../src/api/ProjectsApiClient';
import { testData } from '../../../src/fixtures/testData';

const PROJECT_SCHEMA = {
  project_id: 'string',
  name: 'string',
  description: 'string',
  test_case_count: 'number',
  created_at: 'string',
  updated_at: 'string',
} as const;

/**
 * Full CRUD lifecycle for the Projects resource, plus schema + response-time guards.
 * Risk 2 mitigation: every created project is tracked and removed in afterEach, and names
 * carry a timestamp so a failed cleanup never collides with a later run.
 */
test.describe('Projects CRUD @api', () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ projectsApi }) => {
    while (createdIds.length) {
      const id = createdIds.pop()!;
      await projectsApi.delete(id).catch(() => {});
    }
  });

  test('creates a project and returns an id within SLA', async ({ projectsApi }) => {
    const { response, elapsedMs } = await projectsApi.create({
      name: testProjectName('crud-create'),
      description: 'created by CRUD test',
    });
    await expectStatus(response, 200);
    expectResponseTimeUnder(elapsedMs);

    const body = await response.json();
    expect(body.type).toBe('Success');
    expect(body.id, 'create response should include the new project id').toBeTruthy();
    createdIds.push(body.id);
  });

  test('reads a project back with the expected schema', async ({ projectsApi }) => {
    const { id } = await projectsApi.createAndGetId({ name: testProjectName('crud-read') });
    createdIds.push(id);

    const { response, elapsedMs } = await projectsApi.get(id);
    await expectStatus(response, 200);
    expectResponseTimeUnder(elapsedMs);

    const project = (await response.json()).data as Project;
    expectSchema(project, PROJECT_SCHEMA);
    expect(project.project_id).toBe(id);
  });

  test('lists projects and includes a newly created one', async ({ projectsApi }) => {
    const name = testProjectName('crud-list');
    const { id } = await projectsApi.createAndGetId({ name });
    createdIds.push(id);

    const { response, elapsedMs } = await projectsApi.list();
    await expectStatus(response, 200);
    expectResponseTimeUnder(elapsedMs);

    const projects = (await response.json()).data as Project[];
    expect(projects.some((p) => p.project_id === id)).toBe(true);
  });

  test('updates a project description', async ({ projectsApi }) => {
    const name = testProjectName('crud-update');
    const { id } = await projectsApi.createAndGetId({ name, description: 'before' });
    createdIds.push(id);

    const { response } = await projectsApi.update(id, { name, description: 'after' });
    await expectStatus(response, 200);

    const project = (await (await projectsApi.get(id)).response.json()).data as Project;
    expect(project.description).toBe('after');
  });

  test('deletes a project and a subsequent read returns 404', async ({ projectsApi }) => {
    const { id } = await projectsApi.createAndGetId({ name: testProjectName('crud-delete') });

    const del = await projectsApi.delete(id);
    await expectStatus(del.response, 200);

    const after = await projectsApi.get(id);
    await expectStatus(after.response, 404);
  });

  // Data-driven: create a project from each dataset in test-data/projects.json.
  for (const sample of testData.sampleProjects()) {
    test(`creates a project from dataset "${sample.name}"`, async ({ projectsApi }) => {
      const slug = sample.name.toLowerCase().replace(/\s+/g, '-');
      const { response, elapsedMs } = await projectsApi.create({
        name: testProjectName(slug),
        description: sample.description,
      });
      await expectStatus(response, 200);
      expectResponseTimeUnder(elapsedMs);
      const id = (await response.json()).id as string;
      createdIds.push(id);

      const created = (await (await projectsApi.get(id)).response.json()).data as Project;
      expectSchema(created, PROJECT_SCHEMA);
      expect(created.description).toBe(sample.description);
    });
  }
});
