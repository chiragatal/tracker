import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_EMAIL || "test-e2e@example.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "TestPassword123!";

test.describe("Authentication", () => {
  test("can sign up with email and password", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    // Should redirect to discover page after signup
    await page.waitForURL("**/discover", { timeout: 10000 });
    expect(page.url()).toContain("/discover");
  });

  test("can sign in with email and password", async ({ page }) => {
    // This test requires the TEST_EMAIL account to exist
    test.skip(!process.env.TEST_EMAIL, "TEST_EMAIL not set");
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid login credentials")).toBeVisible({
      timeout: 5000,
    });
  });

  test("login page has forgot password link", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Forgot password")).toBeVisible();
  });
});
