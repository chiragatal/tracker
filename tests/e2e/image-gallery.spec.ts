import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Image gallery", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("image upload button is available on new entry form", async ({ page }) => {
    await page.goto("/new");
    // Select a tracker that has an image field
    const trackerSelect = page.locator("button", { hasText: "Select a tracker" });
    if (await trackerSelect.isVisible()) {
      await trackerSelect.click();
      await page.locator("text=Coffee").click();
      await page.waitForTimeout(500);
    }
    // Should see Upload Image button for the photo field
    await expect(page.locator("text=Upload Image").or(page.locator("text=Add Images"))).toBeVisible();
  });
});
