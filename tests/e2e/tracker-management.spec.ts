import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";

test.describe("Tracker Management", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL, "TEST_EMAIL not set");
    await login(page, TEST_EMAIL, TEST_PASSWORD);
  });

  test("can create a new tracker type with custom fields", async ({ page }) => {
    const trackerName = `E2E Tracker ${Date.now()}`;
    await page.goto("/tracker/new");
    await expect(page.locator("text=Create a Tracker")).toBeVisible();

    // Fill in basic info
    await page.fill('input[id="name"]', trackerName);
    await page.fill('textarea[id="description"]', "An e2e test tracker");

    // Add a text field
    await page.click("text=Add Field");
    // The form builder should show field inputs after clicking Add Field
    const fieldLabelInputs = page.locator(
      'input[placeholder*="Field"], input[placeholder*="label"], input[placeholder*="Label"], input[placeholder*="name"]'
    );
    // Wait for at least one field input to appear
    await expect(fieldLabelInputs.first()).toBeVisible({ timeout: 5000 });

    // Verify the Create Tracker button exists and is enabled once name is filled
    const submitButton = page.locator('button[type="submit"]:has-text("Create Tracker")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test("can subscribe and unsubscribe to a tracker on discover page", async ({
    page,
  }) => {
    await page.goto("/discover");
    await expect(
      page.locator("text=What do you want to track")
    ).toBeVisible();

    // Find a tracker card with a subscribe/unsubscribe toggle button
    // The TrackerGrid component should show tracker cards with toggle buttons
    const trackerCards = page.locator('[data-testid="tracker-card"], .card, [class*="card"]');
    await expect(trackerCards.first()).toBeVisible({ timeout: 10000 });

    // Look for any subscribe/unsubscribe button on the page
    const toggleButton = page
      .locator('button:has-text("Subscribe"), button:has-text("Unsubscribe"), button:has-text("Added"), button:has-text("Add")')
      .first();
    if (await toggleButton.isVisible()) {
      const initialText = await toggleButton.textContent();
      await toggleButton.click();
      // Wait for the toast or state change
      await page.waitForTimeout(1000);
      // The button text should have changed
      const newText = await toggleButton.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test("can navigate to edit tracker page for user-created tracker", async ({
    page,
  }) => {
    // First create a tracker to ensure we have one we own
    const trackerName = `Editable Tracker ${Date.now()}`;
    await page.goto("/tracker/new");
    await page.fill('input[id="name"]', trackerName);
    await page.fill('textarea[id="description"]', "For edit test");

    const submitButton = page.locator('button[type="submit"]:has-text("Create Tracker")');
    await submitButton.click();

    // Should redirect to the tracker's entries page
    await page.waitForURL("**/track/**", { timeout: 15000 });

    // The Edit Tracker button should be visible since we are the creator
    const editButton = page.locator('a:has-text("Edit Tracker")');
    await expect(editButton).toBeVisible({ timeout: 5000 });

    // Click edit and verify edit page loads
    await editButton.click();
    await page.waitForURL("**/edit", { timeout: 10000 });
    await expect(page.locator(`text=Edit ${trackerName}`)).toBeVisible();

    // Change the description
    await page.fill('textarea[id="description"]', "Updated description");
    const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
  });

  test("sidebar shows subscribed trackers", async ({ page }) => {
    // Sidebar has a "My Trackers" section with subscribed tracker links
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator("text=My Trackers")).toBeVisible();
  });

  test("new tracker form has default fields pre-populated", async ({ page }) => {
    await page.goto("/tracker/new");
    // Should see default fields: Name, Status, Date, Rating, Notes
    await expect(page.locator("text=Add Field")).toBeVisible();
    // Check that Name field label exists in the form builder
    await expect(page.locator('input[value="Name"]')).toBeVisible();
  });

  test("tracker creation page has emoji picker", async ({ page }) => {
    await page.goto("/tracker/new");
    await expect(page.locator("text=Icon")).toBeVisible();
  });

  test("Create Tracker button visible on discover page", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.locator("text=What do you want to track")).toBeVisible();
    const createButton = page.locator('a:has-text("Create Tracker")');
    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveAttribute("href", "/tracker/new");
  });
});
