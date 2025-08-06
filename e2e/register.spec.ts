import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/register.page';

/**
 * Test data for registration tests
 */
const testUsers = {
  valid: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  },
  invalid: {
    name: '',
    email: 'invalid-email',
    password: '123'
  },
  existing: {
    name: 'Existing User',
    email: 'existing@example.com',
    password: 'password123'
  }
};

test.describe('User Registration E2E', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    
    // Mock API responses for consistent testing
    await page.route('**/api/v1/users/register', async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');
      
      // Simulate different scenarios based on email
      if (postData.email === testUsers.existing.email) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            statusCode: 409,
            message: 'Email already in use'
          })
        });
      } else if (postData.email === testUsers.invalid.email) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            statusCode: 400,
            message: 'Invalid email format'
          })
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'User registered successfully',
            data: {
              user: {
                id: 'mock-user-id',
                name: postData.name,
                email: postData.email
              },
              token: 'mock-jwt-token'
            }
          })
        });
      }
    });
  });

  test('should display registration form correctly', async ({ page }) => {
    await registerPage.goto();
    await registerPage.assertOnRegisterPage();
    await registerPage.assertInitialState();
  });

  test('should successfully register a new user', async ({ page }) => {
    await registerPage.goto();
    await registerPage.register(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password
    );
    await registerPage.assertRegistrationSuccess();
  });

  test('should show error for existing email', async ({ page }) => {
    await registerPage.goto();
    await registerPage.register(
      testUsers.existing.name,
      testUsers.existing.email,
      testUsers.existing.password
    );
    await registerPage.assertRegistrationError('Email already in use');
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await registerPage.goto();
    await registerPage.fillForm(
      testUsers.invalid.name,
      testUsers.invalid.email,
      testUsers.invalid.password
    );
    await registerPage.submitForm();
    
    // Check for validation errors
    await registerPage.assertFieldError('name');
    await registerPage.assertFieldError('email');
    await registerPage.assertFieldError('password');
  });

  test('should show error for invalid email format', async ({ page }) => {
    await registerPage.goto();
    await registerPage.register(
      testUsers.valid.name,
      testUsers.invalid.email,
      testUsers.valid.password
    );
    await registerPage.assertRegistrationError('Invalid email format');
  });

  test('should handle password mismatch', async ({ page }) => {
    await registerPage.goto();
    await registerPage.fillForm(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password,
      'different-password'
    );
    await registerPage.submitForm();
    await registerPage.assertFieldError('confirmPassword');
  });

  test('should clear form after successful registration', async ({ page }) => {
    await registerPage.goto();
    await registerPage.register(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password
    );
    await registerPage.assertRegistrationSuccess();
    
    // Verify form is cleared
    await expect(registerPage.nameInput).toHaveValue('');
    await expect(registerPage.emailInput).toHaveValue('');
    await expect(registerPage.passwordInput).toHaveValue('');
    await expect(registerPage.confirmPasswordInput).toHaveValue('');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/v1/users/register', async (route) => {
      await route.abort('failed');
    });

    await registerPage.goto();
    await registerPage.register(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password
    );
    await registerPage.assertRegistrationError('Network error');
  });

  test('should show loading state during submission', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/users/register', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'User registered successfully'
        })
      });
    });

    await registerPage.goto();
    await registerPage.fillForm(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password
    );
    await registerPage.registerButton.click();
    
    // Check loading state
    await registerPage.assertLoadingState();
    
    // Wait for completion
    await registerPage.assertRegistrationSuccess();
  });

  test('should validate required fields', async ({ page }) => {
    await registerPage.goto();
    
    // Try to submit empty form
    await registerPage.submitForm();
    
    // Check for required field errors
    await registerPage.assertFieldError('name');
    await registerPage.assertFieldError('email');
    await registerPage.assertFieldError('password');
  });

  test('should handle special characters in name field', async ({ page }) => {
    await registerPage.goto();
    await registerPage.register(
      'José María O\'Connor-Smith',
      'jose.maria@example.com',
      testUsers.valid.password
    );
    await registerPage.assertRegistrationSuccess();
  });

  test('should handle long email addresses', async ({ page }) => {
    await registerPage.goto();
    await registerPage.register(
      testUsers.valid.name,
      'very.long.email.address.that.exceeds.normal.length@very.long.domain.example.com',
      testUsers.valid.password
    );
    await registerPage.assertRegistrationSuccess();
  });
});