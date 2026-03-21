import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Sharing", () => {
  test("share toggle visible on entry detail page", async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);

    // Create an entry first so we have one to check
    await page.goto("/new");
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    const entryTitle = `Share Test ${Date.now()}`;
    await page.fill('input[id="title"]', entryTitle);
    await page.click('button[type="submit"]:has-text("Create Entry")');
    await page.waitForURL("**/entry/**", { timeout: 15000 });

    // The Share button should be visible
    const shareButton = page.locator('button:has-text("Share")');
    await expect(shareButton).toBeVisible();

    // Click share to make it public
    await shareButton.click();
    // After toggling, it should show "Public" and a "Copy Link" button
    await expect(page.locator('button:has-text("Public")')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('button:has-text("Copy Link")')).toBeVisible();
  });

  test("shared entry page at /share/[id] shows not found for non-public entries", async ({
    page,
  }) => {
    // Use a random UUID that won't match any entry
    await page.goto("/share/00000000-0000-0000-0000-000000000000");
    // Should show 404 / not found page
    await expect(
      page.locator("text=This page could not be found").or(
        page.locator("text=Not Found").or(page.locator("text=404"))
      )
    ).toBeVisible({ timeout: 5000 });
  });
});
