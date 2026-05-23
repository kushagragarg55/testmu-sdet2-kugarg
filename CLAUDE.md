# CLAUDE.md

## What this is

TestMu AI **SDET-2 Quality Engineering challenge**. The task: build a test framework
a real team could rely on for [LambdaTest Test Manager](https://test-manager.lambdatest.com/projects),
covering UI, API, and integration layers, plus one DevOps/quality integration (CI or analytics).

The assessment grades **architectural judgment over suite size**. There's no single right
answer — design decisions must be owned and defensible. AI tool use is allowed but must be
logged in `ai-usage-log.md`.

## Stack

- **Playwright + TypeScript** — native cross-browser, built-in API request client, no extra runner.
- **Node.js ≥ 18**.
- **Allure** reporter for failure artifacts (screenshots, traces).
- Target system under test: LambdaTest Test Manager (web UI + REST API).

## Layout

```
src/
  config/    typed env config + shared constants (all URLs/routes centralised here)
  pages/     Page Object Model — BasePage + feature pages (no raw selectors in tests)
  api/       API client layer — BasicAuth, typed CRUD wrappers
  utils/     custom waits, retry logic, custom assertions, structured logger
tests/
  ui/        login, dashboard, projects, cross-browser smoke (@smoke tag)
  api/       auth, projects-crud, error-handling
  integration/  api-to-ui end-to-end flows
test-data/   externalised JSON fixtures (users, projects, bad payloads)
```

## Conventions (do not violate)

- **Selectors**: semantic locators only — `getByRole`, `getByLabel`, `getByTestId`. No brittle
  XPath, no CSS-class selectors. Selectors live in Page Objects, never in test files.
- **API routes/URLs**: centralised in `src/config/constants.ts` and the API client classes.
  A route change should be a one-file fix.
- **Auth**: API uses Basic Auth (`username:accessKey`). Password is for UI login only.
- **Test isolation**: API tests that create data clean up in `afterEach`. Project names get a
  timestamp suffix so a failed cleanup doesn't poison later runs.
- **Data-driven**: parameterise tests over externalised fixtures in `test-data/`, not inline literals.
- **Credentials**: never commit `.env`. Required vars are in `.env.example`
  (`LT_USERNAME`, `LT_EMAIL`, `LT_PASSWORD`, `LT_ACCESS_KEY`, plus base URLs).

## Test pyramid philosophy

- **UI tests** cover only paths a human would verify (login, navigation, form interaction).
  Do **not** use UI tests to verify data persistence — that's the API layer's job.
- **API tests** are the broadest coverage layer; run Chromium-only (browser is irrelevant to HTTP).
- **Integration tests** prove UI and API read from the same data source (create via API, assert in UI).

## Commands

```bash
npm ci                              # install deps
npx playwright install --with-deps  # install browsers
cp .env.example .env                # then fill in LambdaTest credentials

npm test            # all tests (chromium)
npm run test:smoke  # cross-browser smoke (@smoke)
npm run test:api    # API tests only
npm run test:ui     # UI tests only
npm run report      # open last Playwright/Allure HTML report
```

## CI (Task 3, Option A)

GitHub Actions in `.github/workflows/`: runs on push/PR across a 2-shard matrix, merges Allure
results, publishes the report as an artifact, notifies on failure. Repo secrets:
`LT_USERNAME`, `LT_EMAIL`, `LT_PASSWORD`, `LT_ACCESS_KEY`.

## Required deliverables (submission checklist)

- Framework with UI + API + integration tests, POM, utilities, externalised test data.
- Test reports with screenshots on failure (a passing run **and** a failing run with artifact).
- Task 3: pipeline config (or analytics dashboard) + sample output across >1 run, with a note
  explaining why that option was chosen.
- `README.md` — architecture, setup, how to run, design decisions, what's next.
- `test-strategy.md` — coverage rationale, risk analysis, improvement plan.
- `ai-usage-log.md` — every AI tool, the task it helped with, what it produced.

## Current state

Scaffold stage: docs (`README.md`, `test-strategy.md`, `ai-usage-log.md`) and folder structure
exist; source files and tests are not yet implemented (`.gitkeep` placeholders). No
`package.json` or `playwright.config.ts` yet.
