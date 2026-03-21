import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Entry Workflow", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test('can create a "done" entry', async ({ page }) => {
    await page.goto("/new");
    await expect(page.locator("text=New Entry")).toBeVisible();

    // Select a tracker from the dropdown
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    // Pick the first available tracker
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Fill in the title
    const entryTitle = `Done Entry ${Date.now()}`;
    await page.fill('input[id="title"]', entryTitle);

    // Status should default to "done" -- verify
    await expect(page.locator('button[role="combobox"]:has-text("Done")')).toBeVisible();

    // Submit
    await page.click('button[type="submit"]:has-text("Create Entry")');

    // Should redirect to entry detail page
    await page.waitForURL("**/entry/**", { timeout: 15000 });
    await expect(page.locator(`text=${entryTitle}`)).toBeVisible();
  });

  test('can create a "want to" entry', async ({ page }) => {
    await page.goto("/new");
    await expect(page.locator("text=New Entry")).toBeVisible();

    // Select a tracker
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Fill in the title
    const entryTitle = `Want To Entry ${Date.now()}`;
    await page.fill('input[id="title"]', entryTitle);

    // Change status to "Want to"
    const statusTrigger = page
      .locator('button[role="combobox"]:has-text("Done")')
      .first();
    await statusTrigger.click();
    await page.locator('[role="option"]:has-text("Want to")').click();

    // Submit
    await page.click('button[type="submit"]:has-text("Create Entry")');

    // Should redirect to entry detail page
    await page.waitForURL("**/entry/**", { timeout: 15000 });
    await expect(page.locator(`text=${entryTitle}`)).toBeVisible();
  });

  test("can edit an entry", async ({ page }) => {
    // First create an entry
    await page.goto("/new");
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    const originalTitle = `Edit Test ${Date.now()}`;
    await page.fill('input[id="title"]', originalTitle);
    await page.click('button[type="submit"]:has-text("Create Entry")');
    await page.waitForURL("**/entry/**", { timeout: 15000 });

    // Click Edit button
    await page.click('a:has-text("Edit")');
    await page.waitForURL("**/edit", { timeout: 10000 });
    await expect(page.locator("text=Edit Entry")).toBeVisible();

    // Change the title
    const updatedTitle = `Updated ${originalTitle}`;
    await page.fill('input[id="title"]', updatedTitle);

    // Save
    await page.click('button[type="submit"]:has-text("Save Changes")');
    await page.waitForURL(/\/entry\/[^/]+$/, { timeout: 15000 });
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();
  });

  test('can convert "want to" to "done" via Mark as Done', async ({
    page,
  }) => {
    // Create a "want to" entry
    await page.goto("/new");
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    const entryTitle = `Convert Test ${Date.now()}`;
    await page.fill('input[id="title"]', entryTitle);

    // Set status to "Want to"
    const statusTrigger = page
      .locator('button[role="combobox"]:has-text("Done")')
      .first();
    await statusTrigger.click();
    await page.locator('[role="option"]:has-text("Want to")').click();

    await page.click('button[type="submit"]:has-text("Create Entry")');
    await page.waitForURL("**/entry/**", { timeout: 15000 });

    // The "Mark as Done" button should be visible for want_to entries
    const markDoneButton = page.locator('a:has-text("Mark as Done")');
    await expect(markDoneButton).toBeVisible();

    // Click Mark as Done
    await markDoneButton.click();
    await page.waitForURL("**/edit?markDone=true", { timeout: 10000 });
    await expect(page.locator("text=Mark as Done")).toBeVisible();

    // The status should be pre-set to "done" and the page title should reflect it
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Mark as Done")'
    );
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Should redirect back to entry detail
    await page.waitForURL(/\/entry\/[^/]+$/, { timeout: 15000 });
  });

  test("can delete an entry", async ({ page }) => {
    // Create an entry first
    await page.goto("/new");
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    const entryTitle = `Delete Test ${Date.now()}`;
    await page.fill('input[id="title"]', entryTitle);
    await page.click('button[type="submit"]:has-text("Create Entry")');
    await page.waitForURL("**/entry/**", { timeout: 15000 });

    // Handle the confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Click Delete button
    await page.click('button:has-text("Delete")');

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  test("entry detail page shows all action buttons", async ({ page }) => {
    // Create an entry to view its detail page
    await page.goto("/new");
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    const entryTitle = `Detail Test ${Date.now()}`;
    await page.fill('input[id="title"]', entryTitle);
    await page.click('button[type="submit"]:has-text("Create Entry")');
    await page.waitForURL("**/entry/**", { timeout: 15000 });

    // Verify all action buttons are present
    await expect(page.locator(`text=${entryTitle}`)).toBeVisible();
    await expect(page.locator('button:has-text("Share"), a:has-text("Share")')).toBeVisible();
    await expect(page.locator('a:has-text("Track Again")')).toBeVisible();
    await expect(page.locator('a:has-text("Edit")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
    await expect(page.locator("text=Back")).toBeVisible();
  });

  test("can duplicate an entry via Track Again", async ({ page }) => {
    // Create an entry first
    await page.goto("/new");
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    const entryTitle = `Duplicate Test ${Date.now()}`;
    await page.fill('input[id="title"]', entryTitle);
    await page.click('button[type="submit"]:has-text("Create Entry")');
    await page.waitForURL("**/entry/**", { timeout: 15000 });

    // Click Track Again
    await page.click('a:has-text("Track Again")');
    await page.waitForURL("**/new?**prefill=**", { timeout: 10000 });

    // The new entry form should be pre-filled with "Copy of <title>"
    const titleInput = page.locator('input[id="title"]');
    await expect(titleInput).toHaveValue(`Copy of ${entryTitle}`, {
      timeout: 10000,
    });
  });

  test("entry date field works with custom date", async ({ page }) => {
    await page.goto("/new");

    // Select a tracker
    const trackerSelect = page.locator("text=Select a tracker").first();
    await trackerSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // The date input should be present and default to today
    const dateInput = page.locator('input[id="entry-date"]');
    await expect(dateInput).toBeVisible();
    const today = new Date().toISOString().split("T")[0];
    await expect(dateInput).toHaveValue(today);

    // Set a custom date
    await dateInput.fill("2025-01-15");
    await expect(dateInput).toHaveValue("2025-01-15");
  });
});
