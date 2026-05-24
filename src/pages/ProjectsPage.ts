import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { UI_ROUTES, TIMEOUTS } from '../config/constants';

/**
 * ProjectsPage — the create-project flow via the side drawer. Selectors come from the app's
 * data-testid hooks (projects.list.create-drawer.*).
 */
export class ProjectsPage extends BasePage {
  private readonly createProjectButton: Locator;
  private readonly drawer: Locator;
  private readonly nameInput: Locator;
  private readonly closeDrawer: Locator;
  private readonly submitButton: Locator;
  private readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    // Populated list exposes projects.list.create; the empty/onboarding state shows a
    // "Create Project" button instead — accept either.
    this.createProjectButton = page
      .getByTestId('projects.list.create')
      .or(page.getByRole('button', { name: /^create project$/i }));
    this.drawer = page.getByTestId('projects.list.create-drawer');
    // Scope to the drawer: in the empty/onboarding state an inline form under
    // projects.list.empty-state exposes the same testid, which would break strict mode.
    this.nameInput = this.drawer.getByTestId('projects.list.create-drawer.name');
    this.closeDrawer = this.drawer.getByTestId('projects.list.create-drawer.close');
    // Submit is the only real <button> in the drawer (close is a div) — scope to avoid the
    // page-level "Create Project" button.
    this.submitButton = this.drawer.locator('button', { hasText: /create/i });
    this.toast = page
      .getByRole('status')
      .or(page.locator('[class*="toast"], [class*="Toast"], [class*="notification"]'));
  }

  protected get path(): string {
    return UI_ROUTES.projects;
  }

  /** The primary create-project affordance (present in both empty and populated states). */
  get createButton(): Locator {
    return this.createProjectButton;
  }

  async openCreateDrawer(): Promise<void> {
    await this.createProjectButton.click();
    await this.nameInput.waitFor({ state: 'visible', timeout: TIMEOUTS.action });
  }

  async fillAndSubmit(name: string): Promise<void> {
    this.log.info(`creating project "${name}" via UI`);
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }

  /** Type into the name field without submitting — used by form-validation tests. */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async createProject(name: string): Promise<void> {
    await this.openCreateDrawer();
    await this.fillAndSubmit(name);
  }

  /** Try to submit with an empty name to exercise client-side validation. */
  async submitEmpty(): Promise<void> {
    await this.openCreateDrawer();
    await this.nameInput.fill('');
    await this.submitButton.click();
  }

  /** Whether the create submit is enabled — many forms disable it until the name is valid. */
  async submitEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled();
  }

  async drawerVisible(): Promise<boolean> {
    return this.drawer.isVisible();
  }

  async toastVisible(): Promise<boolean> {
    return this.toast.first().isVisible().catch(() => false);
  }
}
