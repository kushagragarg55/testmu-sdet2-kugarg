import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { UI_ROUTES, TIMEOUTS } from '../config/constants';

/**
 * LoginPage — LambdaTest auth lives on accounts.lambdatest.com. Navigating to a protected
 * app route redirects here; after submitting, the OAuth flow returns to the app.
 */
export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: /^login$/i });
    this.errorMessage = page
      .getByRole('alert')
      .or(page.locator('[class*="error"], [class*="Error"]'));
  }

  /** Hitting the protected app route redirects to the accounts login form. */
  protected get path(): string {
    return UI_ROUTES.app;
  }

  async open(): Promise<void> {
    await this.goto();
    await this.emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.navigation });
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fill + submit. Does not assert the outcome — callers decide what success/failure means. */
  async login(email: string, password: string): Promise<void> {
    this.log.info(`logging in as ${email}`);
    await this.fillCredentials(email, password);
    await this.submit();
  }

  /**
   * Complete a successful login and land in the app. After submit the session is established;
   * re-navigating to the app lets the OAuth flow resolve silently and reliably (avoids the
   * intermittent landing on the accounts dashboard).
   */
  async loginAndEnterApp(email: string, password: string): Promise<void> {
    await this.login(email, password);
    // Wait until auth has processed and we've left the login screen (networkidle is unreliable
    // on this analytics-heavy app), then re-enter the app so the OAuth flow resolves silently.
    await this.page
      .waitForURL((url) => !url.toString().includes('/login'), { timeout: TIMEOUTS.navigation })
      .catch(() => {});
    await this.page.goto(`${this.baseUrlValue}${UI_ROUTES.app}`, { waitUntil: 'domcontentloaded' });
  }

  async getErrorText(): Promise<string> {
    await this.errorMessage.first().waitFor({ state: 'visible', timeout: TIMEOUTS.action });
    return (await this.errorMessage.first().textContent())?.trim() ?? '';
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('accounts.lambdatest.com');
  }

  async submitEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled();
  }
}
