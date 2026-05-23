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
- **Integration tests** validate that UI and API layers are consistent with each other
  (e.g., data created via API appears correctly in the UI).

---

## 2. Coverage — What We Test and Why

### UI

| Test file | What it covers | Why it matters |
|---|---|---|
| `login.spec.ts` | Valid login, invalid creds, empty fields, forgot-password link | Login is the entry gate; any regression here blocks every other test |
| `dashboard.spec.ts` | Projects list visibility, project click, nav links | Core navigation — if the dashboard is broken, no workflow is reachable |
| `projects.spec.ts` | Create project modal, validation, success toast | Primary create flow; must work before API-to-UI integration tests |
| `cross-browser.spec.ts` | Login + dashboard on Chromium, Firefox, WebKit | Catches rendering regressions; tagged `@smoke` for fast pre-deploy checks |

### API

| Test file | What it covers | Why it matters |
|---|---|---|
| `auth.spec.ts` | 200 with valid creds, 401 with wrong key, 401 with no header | Auth failures are silent data leaks; must be explicit |
| `projects-crud.spec.ts` | Full CRUD lifecycle + schema validation + response-time assertions | Validates the primary resource the app manages |
| `error-handling.spec.ts` | 404 on unknown ID, 422/400 on bad payloads | Clients need predictable error contracts; catch regressions early |

### Integration

| Test file | What it covers | Why it matters |
|---|---|---|
| `api-to-ui.spec.ts` | POST project via API → assert visible in UI → DELETE cleanup | Proves API and UI are reading from the same data source |

---

## 3. Key Risks

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
