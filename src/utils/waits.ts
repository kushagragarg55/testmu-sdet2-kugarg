import { Page, Locator } from '@playwright/test';
import { TIMEOUTS } from '../config/constants';

/**
 * Custom waits layered on Playwright's auto-waiting for the cases auto-wait doesn't cover
 * (network idle, spinner disappearance). Tests should never use raw setTimeout sleeps.
 */

/** Wait until the network is idle — useful after an action that triggers async data loads. */
export async function waitForNetworkIdle(page: Page, timeout = TIMEOUTS.navigation): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/** Wait for a loading spinner (if present) to detach. No-op if the spinner never appears. */
export async function waitForSpinnerGone(
  spinner: Locator,
  timeout = TIMEOUTS.navigation,
): Promise<void> {
  if (await spinner.count()) {
    await spinner.waitFor({ state: 'hidden', timeout }).catch(() => {});
  }
}

/** Poll a predicate until it returns true or the timeout elapses. */
export async function waitUntil(
  predicate: () => Promise<boolean>,
  { timeout = TIMEOUTS.action, intervalMs = 250 } = {},
): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`waitUntil: condition not met within ${timeout}ms`);
}
