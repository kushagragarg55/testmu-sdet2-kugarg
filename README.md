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

## CI / GitHub Actions

Push to any branch or open a PR → GitHub Actions runs the full suite across 2 shards in
parallel. After both shards complete, Allure results are merged and published as a GitHub
Pages artifact.

Set these repository secrets in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `LT_USERNAME` | Your LambdaTest username |
| `LT_EMAIL` | Your LambdaTest email |
| `LT_PASSWORD` | Your LambdaTest password |
| `LT_ACCESS_KEY` | Your LambdaTest access key |

---

## License

MIT
