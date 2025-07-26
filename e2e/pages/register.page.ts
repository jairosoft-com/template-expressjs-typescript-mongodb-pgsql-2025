import { Page } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register');
  }

  async fillName(name: string) {
    await this.page.getByPlaceholder('Name').fill(name);
  }

  async fillEmail(email: string) {
    await this.page.getByPlaceholder('Email').fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByPlaceholder('Password').fill(password);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Register' }).click();
  }

  async getSuccessMessage() {
    return this.page.locator('#success-message').textContent();
  }
}