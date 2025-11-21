import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should load the app and display initial elements', async ({ page }) => {
    // Check if the app title is visible
    await expect(page.locator('h1')).toContainText('Vite + React');

    // Check if UserForm is present
    await expect(page.locator('h2')).toContainText('Add User');

    // Check if UserList is present
    await expect(page.locator('h2')).toContainText('Users');
  });

  test('should create a new user successfully', async ({ page }) => {
    // Fill in the form
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('div')).toContainText('User created successfully!');

    // Check if the user appears in the list
    await expect(page.locator('ul li')).toContainText('John Doe - john@example.com');
  });

  test('should display users in the list', async ({ page }) => {
    // Assuming there might be users from previous tests, but to be safe, create one
    await page.fill('#name', 'Jane Smith');
    await page.fill('#email', 'jane@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('div')).toContainText('User created successfully!');

    // Check the list
    await expect(page.locator('ul li')).toHaveCount(1);
    await expect(page.locator('ul li').first()).toContainText('Jane Smith - jane@example.com');
  });

  test('should handle invalid email', async ({ page }) => {
    await page.fill('#name', 'Invalid User');
    await page.fill('#email', 'invalid-email');
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('div')).toContainText('Error: Invalid email');
  });

  test('should handle duplicate email', async ({ page }) => {
    // Create first user
    await page.fill('#name', 'First User');
    await page.fill('#email', 'duplicate@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('div')).toContainText('User created successfully!');

    // Try to create another with same email
    await page.fill('#name', 'Second User');
    await page.fill('#email', 'duplicate@example.com');
    await page.click('button[type="submit"]');

    // Check for duplicate error
    await expect(page.locator('div')).toContainText('Error: Email already exists');
  });

  test('should handle empty name', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.click('button[type="submit"]');

    // Since name is required, browser might prevent submit, but check error
    // Assuming server validation
    await expect(page.locator('div')).toContainText('Error: Invalid name');
  });

  test('should handle empty email', async ({ page }) => {
    await page.fill('#name', 'Test User');
    await page.click('button[type="submit"]');

    // Email is required
    await expect(page.locator('div')).toContainText('Error: Invalid email');
  });

  test('visual regression for user form', async ({ page }) => {
    // Take screenshot of the form
    await expect(page.locator('form')).toHaveScreenshot('user-form.png');
  });

  test('visual regression for user list', async ({ page }) => {
    // Create a user first
    await page.fill('#name', 'Visual Test');
    await page.fill('#email', 'visual@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('div')).toContainText('User created successfully!');

    // Take screenshot of the list
    await expect(page.locator('div').filter({ hasText: 'Users' })).toHaveScreenshot('user-list.png');
  });
});