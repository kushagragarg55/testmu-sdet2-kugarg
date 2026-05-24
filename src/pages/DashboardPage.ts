import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { UI_ROUTES, TIMEOUTS } from '../config/constants';

/**
 * DashboardPage — the projects landing view. Uses the app's data-testid hooks for stable
 * selectors and exposes project lookup for integration assertions.
 */
export class DashboardPage extends BasePage {
  private readonly container: Locator;
  private readonly emptyState: Locator;
  private readonly userMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('projects.list.container');
    this.emptyState = page.getByTestId('projects.list.empty-state');
    this.userMenu = page.getByRole('button', { name: /account|profile/i });
  }

  protected get path(): string {
    return UI_ROUTES.dashboard;
  }

  /** Wait for the projects list to be ready (container or empty-state visible). */
  async waitForReady(): Promise<void> {
    await this.container
      .or(this.emptyState)
      .first()
      .waitFor({ state: 'visible', timeout: TIMEOUTS.navigation });
  }

  async isLoaded(): Promise<boolean> {
    await this.waitForReady();
    return (await this.container.isVisible()) || (await this.emptyState.isVisible());
  }

  projectByName(name: string): Locator {
    return this.container.getByText(name, { exact: false });
  }

  async hasProject(name: string): Promise<boolean> {
    await this.waitForReady();
    return (await this.projectByName(name).count()) > 0;
  }

  async openProject(name: string): Promise<void> {
    this.log.info(`opening project "${name}"`);
    await this.projectByName(name).first().click();
  }
}
