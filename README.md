# TestMu SDET Framework — LambdaTest Test Manager

> Playwright + TypeScript test framework covering UI, API, and integration tests for
> [LambdaTest Test Manager](https://test-manager.lambdatest.com/projects).

---

## Architecture Overview

```
testmu-sdet2-kugarg/
├── .github/workflows/         # GitHub Actions CI (sharded, with artifact upload)
├── src/
│   ├── config/                # Typed env config + shared constants
│   ├── pages/                 # Page Object Model (BasePage + feature pages)
│   ├── api/                   # API client layer (BasicAuth, typed CRUD wrappers)
│   └── utils/                 # Retry logic, custom assertions, structured logger
├── tests/
│   ├── ui/                    # Login, dashboard, projects, cross-browser smoke
│   ├── api/                   # Auth, CRUD lifecycle, error handling
│   └── integration/           # API-to-UI end-to-end flows
├── test-data/                 # Externalised JSON fixtures (users, projects, bad payloads)
├── playwright.config.ts       # Browser projects, reporters, global setup
├── test-strategy.md           # Coverage rationale, risks, improvement plan
└── ai-usage-log.md            # AI tool usage log (required by assessment)
```

### Key design decisions

| Decision | Rationale |
|---|---|
| **Playwright + TypeScript** | Native cross-browser, built-in API client, first-class TypeScript, no extra test runner |
| **Page Object Model** | Encapsulates selectors + actions; tests stay readable; easy to update when UI changes |
| **Basic Auth via `username:accessKey`** | LambdaTest API auth standard; password is only for UI login |
| **Allure reporter** | Richer failure artifacts (screenshots, traces) than plain HTML alone |
| **2-shard GitHub Actions matrix** | Halves wall-clock CI time with zero extra tooling |
| **`afterEach` cleanup in API tests** | Keeps test isolation; no leftover data between runs |

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
