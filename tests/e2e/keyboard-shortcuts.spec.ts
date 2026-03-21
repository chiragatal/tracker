import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Keyboard shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("Cmd+N navigates to new entry page", async ({ page }) => {
    await page.keyboard.press("Meta+n");
    await page.waitForURL("**/new", { timeout: 5000 });
    expect(page.url()).toContain("/new");
  });

  test("Cmd+F navigates to search page", async ({ page }) => {
    await page.keyboard.press("Meta+f");
    await page.waitForURL("**/search", { timeout: 5000 });
    expect(page.url()).toContain("/search");
  });
});
