import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Export and Import", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("export button visible on tracker entries page", async ({ page }) => {
    // Navigate to a subscribed tracker's entries page via the sidebar
    const sidebar = page.locator("aside");
    const trackerLink = sidebar.locator('a[href^="/track/"]').first();

    if (await trackerLink.isVisible()) {
      await trackerLink.click();
      await page.waitForURL("**/track/**", { timeout: 10000 });

      // Export button should be visible in the page header actions
      const exportButton = page.locator('button:has-text("Export")');
      await expect(exportButton).toBeVisible({ timeout: 5000 });
    }
  });

  test("import page loads when navigated to", async ({ page }) => {
    await page.goto("/import");
    await expect(page.locator("text=Import Entries")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator("text=Import entries from a JSON file")
    ).toBeVisible();
  });

  test("import page has file upload and tracker selection", async ({
    page,
  }) => {
    await page.goto("/import");
    await expect(page.locator("text=Import Entries")).toBeVisible({
      timeout: 5000,
    });

    // Tracker selection dropdown
    const trackerSelect = page.locator("text=Select a tracker").first();
    await expect(trackerSelect).toBeVisible();

    // File upload input
    const fileInput = page.locator('input[type="file"][accept*=".json"]');
    await expect(fileInput).toBeVisible();
  });
});
