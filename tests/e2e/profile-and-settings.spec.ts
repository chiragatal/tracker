import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Profile and Settings", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("profile page shows email", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Profile")).toBeVisible();
    await expect(page.locator(`text=${TEST_EMAIL}`)).toBeVisible({
      timeout: 10000,
    });
  });

  test("profile page has change password form", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Change Password")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('input[id="new-password"]')).toBeVisible();
    await expect(page.locator('input[id="confirm-password"]')).toBeVisible();
    await expect(
      page.locator('button[type="submit"]:has-text("Update Password")')
    ).toBeVisible();
  });

  test("profile page shows stats (total entries, this month, trackers)", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Stats")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Total entries")).toBeVisible();
    await expect(page.locator("text=This month")).toBeVisible();
    await expect(page.locator("text=Trackers")).toBeVisible();
  });

  test("theme toggle switches between dark and light mode", async ({
    page,
  }) => {
    const html = page.locator("html");

    // Find the theme toggle button
    const themeButton = page
      .locator(
        '[aria-label="Toggle theme"], button:has(svg.lucide-sun), button:has(svg.lucide-moon)'
      )
      .first();

    if (await themeButton.isVisible()) {
      const hadDark = await html.evaluate((el) =>
        el.classList.contains("dark")
      );

      await themeButton.click();
      await page.waitForTimeout(500);

      const hasDarkNow = await html.evaluate((el) =>
        el.classList.contains("dark")
      );

      // The dark class should have toggled
      expect(hasDarkNow).not.toBe(hadDark);

      // Toggle back
      await themeButton.click();
      await page.waitForTimeout(500);

      const hasDarkAfter = await html.evaluate((el) =>
        el.classList.contains("dark")
      );
      expect(hasDarkAfter).toBe(hadDark);
    }
  });

  test("about page is accessible from dropdown menu", async ({ page }) => {
    // Open the user dropdown in the topbar
    const avatarTrigger = page.locator(
      'button[class*="rounded-full"], button:has([class*="avatar"])'
    );
    await expect(avatarTrigger.first()).toBeVisible({ timeout: 5000 });
    await avatarTrigger.first().click();

    // The dropdown should show "About" option
    const aboutOption = page.locator('[role="menuitem"]:has-text("About")');
    await expect(aboutOption).toBeVisible({ timeout: 3000 });
    await aboutOption.click();

    // Should navigate to about page
    await page.waitForURL("**/about", { timeout: 10000 });
    await expect(page.locator("text=About")).toBeVisible();
  });
});
