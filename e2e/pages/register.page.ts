import { Page, Locator, expect } from '@playwright/test';

/**
 * Register Page Object Model
 * 
 * Encapsulates the registration page elements and actions.
 * Provides a clean interface for E2E tests to interact with the registration form.
 */
export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Form elements
    this.form = page.locator('form[data-testid="register-form"]');
    this.nameInput = page.getByLabel('Name', { exact: true });
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm Password', { exact: true });
    this.registerButton = page.getByRole('button', { name: /register/i });
    
    // Feedback elements
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  /**
   * Navigate to the registration page
   */
  async goto() {
    await this.page.goto('/register');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.form).toBeVisible();
  }

  /**
   * Fill the registration form with user data
   * @param name - User's name
   * @param email - User's email
   * @param password - User's password
   * @param confirmPassword - Password confirmation
   */
  async fillForm(name: string, email: string, password: string, confirmPassword?: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (confirmPassword) {
      await this.confirmPasswordInput.fill(confirmPassword);
    } else {
      await this.confirmPasswordInput.fill(password);
    }
  }

  /**
   * Submit the registration form
   */
  async submitForm() {
    await this.registerButton.click();
    await this.waitForSubmission();
  }

  /**
   * Wait for form submission to complete
   */
  async waitForSubmission() {
    // Wait for either success or error message
    await Promise.race([
      this.successMessage.waitFor({ state: 'visible', timeout: 5000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 })
    ]);
  }

  /**
   * Complete the full registration process
   * @param name - User's name
   * @param email - User's email
   * @param password - User's password
   */
  async register(name: string, email: string, password: string) {
    await this.fillForm(name, email, password);
    await this.submitForm();
  }

  /**
   * Check if registration was successful
   */
  async assertRegistrationSuccess() {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText('successfully');
  }

  /**
   * Check if registration failed with specific error
   * @param errorText - Expected error message
   */
  async assertRegistrationError(errorText: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(errorText);
  }

  /**
   * Check if form validation error is displayed
   * @param fieldName - Name of the field with error
   */
  async assertFieldError(fieldName: string) {
    const fieldError = this.page.locator(`[data-testid="${fieldName}-error"]`);
    await expect(fieldError).toBeVisible();
  }

  /**
   * Check if loading spinner is visible during submission
   */
  async assertLoadingState() {
    await expect(this.loadingSpinner).toBeVisible();
  }

  /**
   * Check if form is in initial state (no errors, no success)
   */
  async assertInitialState() {
    await expect(this.successMessage).not.toBeVisible();
    await expect(this.errorMessage).not.toBeVisible();
    await expect(this.loadingSpinner).not.toBeVisible();
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.nameInput.clear();
    await this.emailInput.clear();
    await this.passwordInput.clear();
    await this.confirmPasswordInput.clear();
  }

  /**
   * Get the current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if we're on the registration page
   */
  async assertOnRegisterPage() {
    await expect(this.page).toHaveURL(/.*\/register/);
    await expect(this.form).toBeVisible();
  }
}