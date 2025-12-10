import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page).toHaveTitle(/Login.*TechDengue/i);

    // Check login form elements
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Click submit without filling form
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Should show validation errors
    await expect(page.getByText(/e-?mail.*obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha.*obrigat/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid email
    await page.getByLabel(/e-?mail/i).fill('invalid-email');
    await page.getByLabel(/senha/i).fill('password123');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Should show email format error
    await expect(page.getByText(/e-?mail.*inválido/i)).toBeVisible();
  });

  test('should have link to password recovery', async ({ page }) => {
    await page.goto('/login');

    // Check for password recovery link
    const recoveryLink = page.getByRole('link', { name: /esquec|recuperar/i });
    await expect(recoveryLink).toBeVisible();

    // Click and navigate
    await recoveryLink.click();
    await expect(page).toHaveURL(/recuperar-senha/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('password recovery page should be accessible', async ({ page }) => {
    await page.goto('/recuperar-senha');

    // Check page elements
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar|recuperar/i })).toBeVisible();

    // Check back to login link
    await expect(page.getByRole('link', { name: /voltar.*login/i })).toBeVisible();
  });

  test('should show validation on password recovery form', async ({ page }) => {
    await page.goto('/recuperar-senha');

    // Submit empty form
    await page.getByRole('button', { name: /enviar|recuperar/i }).click();

    // Should show validation error
    await expect(page.getByText(/e-?mail.*obrigatório/i)).toBeVisible();
  });
});

test.describe('Login Form Interaction', () => {
  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByLabel(/senha/i);
    await passwordInput.fill('mypassword');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button (if exists)
    const toggleButton = page.getByRole('button', { name: /mostrar|show|eye/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should have remember me checkbox', async ({ page }) => {
    await page.goto('/login');

    // Check for remember me (if implemented)
    const rememberMe = page.getByLabel(/lembrar|remember/i);
    if (await rememberMe.isVisible()) {
      await expect(rememberMe).not.toBeChecked();
      await rememberMe.check();
      await expect(rememberMe).toBeChecked();
    }
  });

  test('should fill form with keyboard navigation', async ({ page }) => {
    await page.goto('/login');

    // Tab through form
    await page.keyboard.press('Tab');
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('password123');

    // Verify values
    await expect(page.getByLabel(/e-?mail/i)).toHaveValue('test@example.com');
    await expect(page.getByLabel(/senha/i)).toHaveValue('password123');
  });
});

test.describe('Password Reset Flow', () => {
  test('should navigate through password reset flow', async ({ page }) => {
    // Start at login
    await page.goto('/login');

    // Go to recovery
    await page.getByRole('link', { name: /esquec|recuperar/i }).click();
    await expect(page).toHaveURL(/recuperar-senha/);

    // Fill and submit
    await page.getByLabel(/e-?mail/i).fill('test@example.com');
    await page.getByRole('button', { name: /enviar|recuperar/i }).click();

    // Should show success state or loading
    // (depending on API mock behavior)
  });

  test('redefinir-senha page should validate token', async ({ page }) => {
    // Access without token
    await page.goto('/redefinir-senha');

    // Should show error or redirect
    await expect(
      page.getByText(/inválido|expirado|token/i).or(page.locator('[href="/recuperar-senha"]'))
    ).toBeVisible();
  });

  test('redefinir-senha with token should show password form', async ({ page }) => {
    // Access with mock token
    await page.goto('/redefinir-senha?token=mock-token&email=test@example.com');

    // Should show password fields
    await expect(page.getByLabel(/nova senha/i).first()).toBeVisible();
    await expect(page.getByLabel(/confirmar/i)).toBeVisible();
  });
});
