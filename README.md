# TestMu SDET Framework — LambdaTest Test Manager

> Playwright + TypeScript test framework covering UI, API, and integration tests for
> [LambdaTest Test Manager](https://test-manager.lambdatest.com/projects).

---

## Architecture Overview

```
testmu-sdet2-kugarg/
├── .github/workflows/         # GitHub Actions CI (sharded, with artifact upload)
├── src/
│   ├── config/                # Typed env config (env.ts) + centralised routes/timeouts (constants.ts)
│   ├── pages/                 # Page Object Model (BasePage + Login/Dashboard/Projects)
│   ├── api/                   # API clients: ProjectsApiClient (Basic Auth) + TmsProjectsClient (UI bearer)
│   ├── fixtures/              # Custom test fixtures (auth, page objects, tms) + test-data loaders
│   ├── utils/                 # Custom waits, retry logic, custom assertions, structured logger
│   └── global-teardown.ts     # Sweeps leftover [TEST-*] projects from the Basic-Auth store
├── tests/
│   ├── ui/                    # Login, dashboard, projects, cross-browser smoke (@smoke)
│   ├── api/                   # Auth (200/401), CRUD lifecycle, error handling (4xx)
│   └── integration/           # UI→API end-to-end flow
├── test-data/                 # Externalised JSON fixtures (invalid logins, projects, bad payloads)
├── playwright.config.ts       # Browser projects, reporters, globalTeardown
├── test-strategy.md           # Coverage rationale, risks
└── ai-usage-log.md            # AI tool usage log (required by assessment)
```

### API architecture note (important)

The SUT exposes the projects resource through **two surfaces that resolve different principals**:

- **`/api/v1/projects`** — access key via **HTTP Basic Auth**. Full CRUD; this is what the **API
  tests** target. Stable and CI-friendly (no token expiry).
- **`/api/v1/tms/projects?filter[product]=…`** — what the **web UI** uses, via a short-lived
  **OAuth Bearer token** scoped to a "product".

A project created via the Basic-Auth API does **not** appear in the UI, and vice-versa. So the
**integration test creates via the UI and verifies via the UI's own API**, using a Bearer token
captured at runtime from the app's live traffic (the `tms` fixture). See test-strategy.md → Risk 3.

### Key design decisions

| Decision | Rationale |
|---|---|
| **Playwright + TypeScript** | Native cross-browser, built-in API client, first-class TypeScript, no extra test runner |
| **Page Object Model** | Encapsulates selectors + actions; tests stay readable; easy to update when UI changes |
| **Basic Auth (`username:accessKey`) for API tests** | Stable, documented credential; no token expiry; CI-friendly. Password is only for UI login |
| **Captured Bearer token for UI↔API integration** | The UI's API needs an in-memory OAuth token; capturing it from live traffic is the only way to assert UI state from the API layer (see Risk 3) |
| **Worker-scoped auth fixture** | Logs in once per worker and reuses storage state, so UI tests skip the login screen |
| **Allure reporter** | Richer failure artifacts (screenshots, traces) than plain HTML alone |
| **2-shard GitHub Actions matrix** | Halves wall-clock CI time with zero extra tooling |
| **`afterEach` + `globalTeardown` cleanup** | Test isolation; timestamped `[TEST-*]` names + a teardown sweep prevent leftover data |

---

## Prerequisites

- Node.js ≥ 18
- A LambdaTest account with Test Manager access

---

## Setup

```bash
git clone https://github.com/<your-user>/testmu-sdet2-kugarg.git
cd testmu-sdet2-kugarg

# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Copy and fill in credentials
cp .env.example .env
# Edit .env with your LT_USERNAME, LT_PASSWORD, LT_ACCESS_KEY, LT_EMAIL
```

---

## Running Tests

```bash
# All tests (chromium)
npm test

# Cross-browser smoke suite (@smoke tag)
npm run test:smoke

# API tests only
npm run test:api

# UI tests only
npm run test:ui

# Open last Playwright HTML report
npm run report
```

---

## CI / GitHub Actions (Task 3 — Option A)

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml). On every **push to `main`** and
every **PR**:

1. **Sharded run** — the suite runs across a **2-way shard matrix** (`--shard=1/2`, `2/2`) on two
   runners in parallel, each emitting a `blob` report (the bonus parallelisation).
2. **Merge & publish** — a `report` job (runs even if a shard failed) merges the shard blobs into a
   single **Playwright HTML report**, uploads it as the **`playwright-html-report` artifact**, and
   on `main` publishes it to **GitHub Pages** (hosted link).
3. **Notify on failure** — the workflow's red **commit/PR status check** is the primary signal
   (GitHub also emails the actor); a `notify` job additionally posts to **Slack** when a
   `SLACK_WEBHOOK_URL` secret is set, and writes a failure job-summary pointing at the report.

Required repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|---|---|
| `LT_USERNAME` | Your LambdaTest username |
| `LT_EMAIL` | Your LambdaTest email |
| `LT_PASSWORD` | Your LambdaTest password |
| `LT_ACCESS_KEY` | Your LambdaTest access key |
| `SLACK_WEBHOOK_URL` | *(optional)* Slack incoming webhook for failure pings |

To enable the hosted report: **Settings → Pages → Build and deployment → Deploy from a branch →
`gh-pages`**. The Pages step is `continue-on-error`, so CI stays green even before Pages is enabled.

### Why Option A (CI) over Option B (analytics dashboard)

Tests that don't run on every change rot. A pipeline gives the team the highest-leverage signal
first: every push/PR gets a pass/fail gate, a shareable report with failure screenshots/traces, and
a failure alert — the foundation a trends dashboard would later consume. An analytics view is
valuable but secondary; it needs a corpus of real runs to be meaningful, and CI is what produces
that corpus. So CI comes first.

---

## License

MIT
