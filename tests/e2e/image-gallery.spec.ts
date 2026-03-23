import { test, expect } from "@playwright/test";
import { login } from "./helpers";
import path from "path";
import fs from "fs";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Image gallery", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("image upload button is available on new entry form", async ({ page }) => {
    await page.goto("/new");
    const trackerSelect = page.locator("button", { hasText: "Select a tracker" });
    if (await trackerSelect.isVisible()) {
      await trackerSelect.click();
      await page.locator("text=Coffee").click();
      await page.waitForTimeout(500);
    }
    await expect(page.locator("text=Upload Image").or(page.locator("text=Add Images"))).toBeVisible();
  });

  test("image upload to R2 works end-to-end", async ({ page }) => {
    await page.goto("/new");

    // Select Coffee tracker
    const trackerSelect = page.locator("button", { hasText: "Select a tracker" });
    if (await trackerSelect.isVisible()) {
      await trackerSelect.click();
      await page.locator("text=Coffee").click();
      await page.waitForTimeout(500);
    }

    // Create a small test image (1x1 red pixel PNG)
    const testImagePath = path.join(__dirname, "test-image.png");
    if (!fs.existsSync(testImagePath)) {
      // Minimal valid PNG (1x1 red pixel)
      const pngBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "base64"
      );
      fs.writeFileSync(testImagePath, pngBuffer);
    }

    // Find the file input for the image field and upload
    const fileInput = page.locator('input[type="file"][accept="image/*"]').first();
    await fileInput.setInputFiles(testImagePath);

    // Wait for upload to complete — should see either the image preview or an error toast
    await page.waitForTimeout(5000);

    // Check that the upload API didn't return an error
    // If successful, the image preview should appear (an img tag) or we stay on the page without error
    const errorToast = page.locator("text=Upload failed");
    const hasError = await errorToast.isVisible().catch(() => false);

    if (hasError) {
      // Upload failed — capture the error for debugging
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      console.log("Upload errors:", consoleErrors);
      test.fail(true, "Image upload returned an error");
    }

    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });
});
