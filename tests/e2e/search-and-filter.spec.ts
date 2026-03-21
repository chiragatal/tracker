import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Search and Filter", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("search bar is visible on dashboard (topbar)", async ({ page }) => {
    // The SearchBar component is rendered in the Topbar, visible on md+ screens
    const searchBar = page.locator(
      'input[placeholder*="Search"], input[placeholder*="search"]'
    );
    await expect(searchBar.first()).toBeVisible({ timeout: 5000 });
  });

  test("can navigate to search page", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("text=Search")).toBeVisible();
    await expect(
      page.locator('input[placeholder*="Search your entries"]')
    ).toBeVisible();
  });

  test("search page has tracker filter and status filter dropdowns", async ({
    page,
  }) => {
    await page.goto("/search");
    await expect(page.locator("text=Search")).toBeVisible();

    // Tracker filter dropdown - should have "All trackers" as default
    const trackerFilter = page.locator(
      'button[role="combobox"]:has-text("All trackers")'
    );
    await expect(trackerFilter).toBeVisible({ timeout: 5000 });

    // Status filter dropdown - should have "All statuses" as default
    const statusFilter = page.locator(
      'button[role="combobox"]:has-text("All statuses")'
    );
    await expect(statusFilter).toBeVisible();

    // Open status filter and verify options
    await statusFilter.click();
    await expect(
      page.locator('[role="option"]:has-text("Done")')
    ).toBeVisible();
    await expect(
      page.locator('[role="option"]:has-text("Want to")')
    ).toBeVisible();
  });

  test("sort dropdown works on tracker entries page", async ({ page }) => {
    // Navigate to a tracker's entries page (use discover to find a subscribed tracker link)
    // First check the sidebar for a subscribed tracker
    const sidebar = page.locator("aside");
    const trackerLink = sidebar.locator('a[href^="/track/"]').first();

    if (await trackerLink.isVisible()) {
      await trackerLink.click();
      await page.waitForURL("**/track/**", { timeout: 10000 });

      // The sort dropdown should be present with "Newest first" as default
      const sortTrigger = page.locator(
        'button[role="combobox"]:has-text("Newest first")'
      );
      await expect(sortTrigger).toBeVisible({ timeout: 5000 });

      // Open and verify sort options
      await sortTrigger.click();
      await expect(
        page.locator('[role="option"]:has-text("Oldest first")')
      ).toBeVisible();
      await expect(
        page.locator('[role="option"]:has-text("Title A-Z")')
      ).toBeVisible();
      await expect(
        page.locator('[role="option"]:has-text("Title Z-A")')
      ).toBeVisible();
    }
  });

  test("tags page loads and shows tag section", async ({ page }) => {
    await page.goto("/tags");
    await expect(page.locator("text=Tags")).toBeVisible({ timeout: 5000 });
  });
});
