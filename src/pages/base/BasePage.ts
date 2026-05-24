import { Page, Locator, expect } from '@playwright/test';
import { env } from '../../config/env';
import { TIMEOUTS } from '../../config/constants';
import { waitForNetworkIdle } from '../../utils/waits';
import { createLogger, Logger } from '../../utils/logger';

/**
 * BasePage — shared behaviour for every page object. Feature pages extend this and expose
 * intent-revealing methods; raw locators never leak into tests.
 */
export abstract class BasePage {
  protected readonly log: Logger;

  constructor(protected readonly page: Page) {
    this.log = createLogger(this.constructor.name);
  }

  /** Path relative to baseUrl this page lives at — used by goto(). */
  protected abstract get path(): string;

  /** The configured app base URL, for pages that need to build their own navigation targets. */
  protected get baseUrlValue(): string {
    return env.baseUrl;
  }

  async goto(): Promise<void> {
    const url = `${env.baseUrl}${this.path}`;
    this.log.info(`navigating to ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.navigation });
  }

  async waitForLoaded(): Promise<void> {
    await waitForNetworkIdle(this.page);
  }

  /** Assert a locator is visible with a readable message. */
  protected async expectVisible(locator: Locator, name: string): Promise<void> {
    await expect(locator, `${name} should be visible`).toBeVisible({ timeout: TIMEOUTS.action });
  }
}
