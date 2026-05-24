# Test Strategy — TestMu SDET Framework

## 1. Approach

This framework follows a **three-layer test pyramid**:

```
         ┌──────────────┐
         │  Integration  │  ← few, high-value end-to-end flows (API + UI combined)
         ├───────────────┤
         │   API Tests   │  ← wide coverage, fast, deterministic
         ├───────────────┤
         │   UI Tests    │  ← focused on critical user paths; brittle flows avoided
         └───────────────┘
```

- **UI tests** cover only paths a human would actively verify: login, dashboard navigation, and
  form interactions. We do not use UI tests to verify data persistence — that's the API layer's job.
- **API tests** provide the broadest functional coverage. They run in a single browser context
  (Chromium) because browser choice has no effect on HTTP request behaviour.
- **Integration tests** validate that UI and API layers are consistent with each other. Note the
  direction: we create through the **UI** and confirm via the **API**, not the reverse. This is a
  deliberate choice forced by the SUT — see Risk 3 (the access-key API and the UI resolve different
  principals/scopes, so a project created via the access-key API never appears in the UI).

---

## 2. Coverage — What We Test and Why

### UI

| Test file | What it covers | Why it matters |
|---|---|---|
| `login.spec.ts` | Valid login lands in app; invalid/empty/malformed credentials (data-driven) stay out | Login is the entry gate; any regression here blocks every other test |
| `dashboard.spec.ts` | Projects landing loads; primary chrome + create action present | Core landing — if the dashboard is broken, no workflow is reachable |
| `projects.spec.ts` | Open create drawer; create a project and see it in the list | Primary create flow; must work before the UI→API integration test |
| `cross-browser.spec.ts` | Authenticated dashboard on Chromium, Firefox, WebKit (`@smoke`) | Catches rendering/engine regressions; fast pre-deploy multi-browser check |

### API

| Test file | What it covers | Why it matters |
|---|---|---|
| `auth.spec.ts` | 200 with valid creds, 401 with wrong key, 401 with no header | Auth failures are silent data leaks; must be explicit |
| `projects-crud.spec.ts` | Full CRUD lifecycle + schema validation + response-time assertions | Validates the primary resource the app manages |
| `error-handling.spec.ts` | 404 on unknown ID, 422/400 on bad payloads (data-driven) | Clients need predictable error contracts; catch regressions early |

> **On 5xx:** the live API exposes no deterministic way to force a server error, so we don't assert
> a specific 5xx. Our `expectStatus` helper handles any status, and **fault-injection for 5xx** is
> listed under "What We'd Cover Next". Coverage here focuses on the 4xx the API actually returns.

### Integration

| Test file | What it covers | Why it matters |
|---|---|---|
| `api-to-ui.spec.ts` | Create project via UI → assert it shows in the UI list → confirm the same record via the Test Manager API → cleanup | Proves the UI and the API it uses read/write one data source |

---

## 3. What We'd Cover Next

1. **Edit & delete project UI flows** — currently only create is exercised in the UI (`row-actions`).
2. **5xx / fault injection** — proxy or route-intercept to force server errors and assert the
   client's handling, since the live API won't emit 5xx on demand.
3. **API schema contract tests** — validate responses against a published OpenAPI spec rather than
   the hand-written shape in `expectSchema`.
4. **Pagination & search** — projects list beyond page 1, and the `projects.list.search` filter.
5. **Accessibility smoke** — `@axe-core/playwright` scan on login + dashboard.
6. **Visual regression** — snapshot the dashboard per browser to catch rendering drift.

---

## 4. Key Risks

### Risk 1 — API endpoint instability
**Description**: The LambdaTest Test Manager API base URL and route structure are not fully
documented publicly. Routes discovered via network inspection may change between releases.
**Mitigation**: All API paths are centralised in `src/config/constants.ts` and
`src/api/ProjectsApiClient.ts`. A route change requires a one-file fix, not a test-by-test hunt.
**Residual risk**: No API versioning contract is visible; breaking changes could fail all API tests
without a deprecation warning.

### Risk 2 — Flakiness from shared state
**Description**: If test cleanup (DELETE after create) fails mid-run, subsequent runs find stale
test data, causing assertion failures unrelated to the code under test.
**Mitigation**: Each API test that creates data uses `afterEach` for cleanup, and project names
include a timestamp suffix to ensure uniqueness even if a prior cleanup failed.
**Mitigation (implemented)**: A `globalTeardown` script scans for and deletes all
`[TEST-*]`-prefixed projects left behind by interrupted runs, fully closing the orphaned-data gap.
