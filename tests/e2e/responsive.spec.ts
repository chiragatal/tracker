import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile nav is visible at bottom on small screens", async ({
    page,
  }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);

    // The MobileNav is a fixed bottom nav visible on md:hidden (i.e., mobile)
    const mobileNav = page.locator("nav.md\\:hidden, nav:below(main)").first();
    await expect(mobileNav).toBeVisible({ timeout: 5000 });

    // Should have the expected nav items: Home, Discover, Add, Search
    await expect(mobileNav.locator("text=Home")).toBeVisible();
    await expect(mobileNav.locator("text=Discover")).toBeVisible();
    await expect(mobileNav.locator("text=Add")).toBeVisible();
    await expect(mobileNav.locator("text=Search")).toBeVisible();
  });

  test("sidebar is hidden on mobile", async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);

    // The sidebar has class "hidden md:flex" so it should not be visible on mobile
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeHidden();
  });

  test("dashboard is usable on mobile", async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);

    // Dashboard content should be visible
    await expect(page.locator("text=Dashboard").or(page.locator("text=Discover Trackers"))).toBeVisible({
      timeout: 10000,
    });

    // The page should be scrollable and not overflowing horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5); // small tolerance
  });

  test("mobile nav includes Tags link", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("nav").locator("text=Tags")).toBeVisible();
  });

  test("login page works on mobile", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Welcome back")).toBeVisible();

    // Form elements should be visible and usable
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Inputs should be properly sized (not overflowing)
    const emailBox = await emailInput.boundingBox();
    expect(emailBox).not.toBeNull();
    if (emailBox) {
      expect(emailBox.width).toBeLessThanOrEqual(375);
      expect(emailBox.width).toBeGreaterThan(200); // reasonable minimum width
    }
  });
});
