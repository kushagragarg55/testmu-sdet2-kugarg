# AI Usage Log

Honest record of AI tool usage for this assessment, per the submission requirements.

**Tool:** Claude Code (Anthropic) — primarily Claude Opus 4.7, some Claude Sonnet 4.6.
**How it was used:** as a pair-programmer/agent. It explored the live system, wrote code and docs,
and ran tests; I (the candidate) chose the stack, supplied credentials, made the design calls
called out below, reviewed the diffs, and approved each step. This log was also drafted by Claude
Code and reviewed by me.

---

## 2026-05-23 → 2026-05-24

### 1. Planning & scaffold (Task 1)
**Produced:** folder structure, `README` skeleton, `test-strategy.md`, `playwright.config.ts`,
`tsconfig.json`, `package.json`, `.gitignore`, `.env.example`; a "planning-first" initial commit.
**I owned:** chose Playwright + TypeScript; required the first commit to show planning (docs +
scaffold, no tests); set commit style (no `Co-Authored-By` trailer).

### 2. Framework implementation (Task 2)
**Produced:** the full framework —
- Config: `src/config/env.ts` (typed, validated env), `src/config/constants.ts` (centralised
  routes/timeouts).
- Utilities: a **custom zero-dependency structured logger** (`logger.ts`), custom waits, retry
  with backoff, custom assertions (status / response-time SLA / lightweight schema).
- POM: `BasePage` + `LoginPage`/`DashboardPage`/`ProjectsPage` (semantic + `data-testid`
  locators, no raw selectors in tests).
- API: `ProjectsApiClient` (Basic Auth CRUD).
- Fixtures: worker-scoped auth fixture (login once, reuse storage state), page-object + data
  fixtures; externalised JSON test data with a typed loader.
- Tests: API (auth/CRUD/errors, data-driven), UI (login/dashboard/projects/cross-browser smoke),
  integration; `afterEach` + `globalTeardown` cleanup.
**I owned:** reviewed/approved the architecture; directed data-driven coverage and the form-
validation test; later directed removing then (per the brief) re-adding "What we'd cover next",
and removing the original "selector drift" risk.

### 3. Live-SUT investigation (read-only probing)
**Produced:** by driving the live site with Playwright + `curl`, Claude Code discovered: the real
login flow (`accounts.lambdatest.com`, `#email`/`#password`), the real `data-testid`s, the project
CRUD contract (incl. that update is `PUT /projects` with `project_id` in the body), and — the key
finding — **two disconnected project APIs**: `/projects` (access-key Basic Auth) vs the UI's
`/tms/projects` (in-memory OAuth bearer, product-scoped). It ran three read-only probe agents to
characterise this.
**I owned:** supplied real LambdaTest credentials; approved running the investigation in plan mode.

### 4. Integration design
**Produced:** given the principal split, designed the integration test as **create-via-UI →
verify-via-API**, capturing the UI's bearer token from live traffic (`TmsProjectsClient` + `tms`
fixture); documented it as Risk 3.
**I owned:** asked for the tradeoffs up front and approved the captured-token approach over faking
an API→UI flow that the SUT can't actually support.

### 5. Debugging (during implementation)
**Produced (fixes):** login flakiness (re-navigate after OAuth + retry the worker login),
strict-mode violation and empty-state duplicate `data-testid` (scope the name field to the drawer),
the redirect-following on single-project routes, and `globalTeardown` URL resolution.

### 6. CI pipeline (Task 3, Option A)
**Produced:** `.github/workflows/ci.yml` — 2-way sharded run, blob→HTML merge, report artifact +
GitHub Pages publish, failure notify (status check + optional Slack). Validated the shard/merge
flow locally; used the `gh` CLI to set repo secrets, push, enable Pages, and fix the Pages push
permission (`contents: write`). Confirmed two green runs and the live hosted report.
**I owned:** chose Option A (CI) over Option B (dashboard); asked for it to be wired and triggered
for real.

### 7. Documentation
**Produced:** `README.md`, `test-strategy.md`, this log, and `docs/sample-report/`.
**I owned:** the doc-structure decisions above; reviewed all prose for accuracy.

---

### Corrections vs. an earlier draft of this log
- The logger is **custom (no `winston`)** — an earlier draft wrongly named winston.
- The risk set changed: "selector drift" was removed; the live risks are **API endpoint
  instability**, **shared-state flakiness**, and the **two-API principal split** (Risk 3).
