# Sample Test Report

Demonstrates the framework's reporting: a **passing run** and a **failing run with the failure
artifact attached**. Full HTML/Allure reports are generated on every run (see "Regenerate" below);
they're git-ignored, so this folder holds committed evidence. The CI pipeline (Task 3) publishes
the live hosted report.

Reporters configured in `playwright.config.ts`: `list` (console) + `html` (Playwright HTML) +
`allure-playwright`. On failure we capture `screenshot: only-on-failure`, `video:
retain-on-failure`, and `trace: on-first-retry`. Per-test stdout (our structured logger) is
attached to both reports.

## Passing run

```
$ npm test                 # playwright test --project=chromium

  ✓ tests/api/auth/auth.spec.ts ............................ 3 passed
  ✓ tests/api/projects/projects-crud.spec.ts ............... 8 passed   (incl. 3 data-driven from projects.json)
  ✓ tests/api/errors/error-handling.spec.ts ............... 4 passed   (incl. 3 data-driven bad payloads)
  ✓ tests/ui/auth/login.spec.ts ........................... 5 passed   (1 valid + 4 data-driven invalid)
  ✓ tests/ui/dashboard/dashboard.spec.ts .................. 2 passed
  ✓ tests/ui/projects/projects.spec.ts .................... 3 passed   (incl. empty-name validation)
  ✓ tests/integration/api-to-ui.spec.ts ................... 1 passed
  ✓ tests/ui/smoke/cross-browser.spec.ts .................. 1 passed

  27 passed (≈23s)

$ npm run test:smoke       # @smoke across chromium, firefox, webkit
  ✓ [chromium] Cross-browser smoke › authenticated dashboard renders
  ✓ [firefox]  Cross-browser smoke › authenticated dashboard renders
  ✓ [webkit]   Cross-browser smoke › authenticated dashboard renders
  3 passed
```

## Failing run (with failure artifact)

A deliberately-injected assertion (asserting a non-existent project is visible) demonstrates how
failures surface, with the artifact auto-captured:

```
✘ Dashboard › sample failing test
    Error: expect(received).toBe(expected)
    Expected: true
    Received: false
      at tests/_sample_failure.spec.ts
    attachment #1: screenshot (image/png) ── test-failed-1.png
    attachment #2: screenshot (image/png) ── test-failed-2.png
  1 failed
```

- **`failing-test-screenshot.png`** — the screenshot captured at the moment of failure (the live
  Test Manager dashboard), attached automatically to the HTML/Allure report.
- **`failing-test-error-context.md`** — the Playwright error context (DOM snapshot + locator) saved
  alongside the failure.

(The injected test was removed after capture; the committed suite is all-green.)

## Regenerate the full reports locally

```bash
npm test                 # runs the suite; writes playwright-report/ + allure-results/
npm run report           # open the Playwright HTML report
npm run allure:generate && npm run allure:open   # Allure report (needs allure CLI)
```
