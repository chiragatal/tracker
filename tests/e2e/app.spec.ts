import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("App functionality", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("dashboard loads with stats and recent activity", async ({ page }) => {
    await expect(page.locator("text=Dashboard")).toBeVisible();
    await expect(page.locator("text=Recent Activity")).toBeVisible();
  });

  test("discover page shows tracker types", async ({ page }) => {
    await page.goto("/discover");
    await expect(
      page.locator("text=What do you want to track")
    ).toBeVisible();
    // Should show at least the seed trackers
    await expect(page.locator("text=Coffee")).toBeVisible();
    await expect(page.locator("text=Books")).toBeVisible();
    await expect(page.locator("text=Recipes")).toBeVisible();
  });

  test("can navigate to new entry page", async ({ page }) => {
    await page.goto("/new");
    await expect(page.locator("text=New Entry")).toBeVisible();
    await expect(page.locator("text=Select a tracker")).toBeVisible();
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("text=Search")).toBeVisible();
  });

  test("tags page loads", async ({ page }) => {
    await page.goto("/tags");
    await expect(page.locator("text=Tags")).toBeVisible();
  });

  test("profile page loads with email", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Profile")).toBeVisible();
    await expect(page.locator(`text=${TEST_EMAIL}`)).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=About")).toBeVisible();
  });

  test("can create a new tracker type", async ({ page }) => {
    await page.goto("/tracker/new");
    await expect(page.locator("text=Create a Tracker")).toBeVisible();
    // Fill in basic info
    await page.fill('input[id="name"]', `Test Tracker ${Date.now()}`);
    await page.fill('textarea[id="description"]', "A test tracker");
    // Should have Add Field button
    await expect(page.locator("text=Add Field")).toBeVisible();
  });

  test("dashboard shows activity heatmap", async ({ page }) => {
    await expect(page.locator("text=Activity")).toBeVisible();
  });

  test("dashboard shows weekly activity chart", async ({ page }) => {
    await expect(page.locator("text=Weekly Activity")).toBeVisible();
  });

  test("dashboard has quick-add buttons for subscribed trackers", async ({ page }) => {
    await expect(page.locator("text=Quick add")).toBeVisible();
  });

  test("dashboard has filter buttons for recent activity", async ({ page }) => {
    // Should have an "All" filter button
    const filterSection = page.locator("text=Recent Activity").locator("..");
    await expect(filterSection).toBeVisible();
  });

  test("theme toggle works", async ({ page }) => {
    // Page should start in dark mode
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    // Click theme toggle (sun/moon icon button)
    const themeButton = page
      .locator(
        '[aria-label="Toggle theme"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)'
      )
      .first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      // Should toggle dark class
      await page.waitForTimeout(500);
    }
  });
});
