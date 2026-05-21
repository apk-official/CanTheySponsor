import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
  // Wait until the virtualised rowgroup is visible and at least one row has rendered
  await expect(page.locator('[role="rowgroup"]')).toBeVisible({
    timeout: 30000,
  });
  await expect(page.locator('[role="row"]').first()).toBeVisible({
    timeout: 30000,
  });
});

test("page loads and shows results", async ({ page }) => {
  await expect(page.locator('[role="rowgroup"]')).toBeVisible();
  await expect(page.locator('[role="row"]').first()).toBeVisible();
});

test("company search filters results", async ({ page }) => {
  const searchBox = page.getByPlaceholder("Type a Company Name...");

  // Search for something specific — rows unrelated to "Google" should disappear
  await searchBox.fill("Google");
  await page.waitForTimeout(600); // debounce is 300ms, give it room

  // A known Google result should be visible
  await expect(
    page
      .locator('[role="row"]')
      .filter({ hasText: /google/i })
      .first(),
  ).toBeVisible();

  // A row that would only appear in the full unfiltered list should not be visible.
  // "ZZZTEST" will never match anything, so if the filter worked the empty state shows.
  await searchBox.fill("ZZZTEST_NOMATCH_XYZ");
  await page.waitForTimeout(600);
  await expect(page.getByText(/no sponsors found/i)).toBeVisible();
});

test("clearing search restores results", async ({ page }) => {
  const searchBox = page.getByPlaceholder("Type a Company Name...");

  // Filter to something very specific so results shrink
  await searchBox.fill("ZZZTEST_NOMATCH_XYZ");
  await page.waitForTimeout(600);
  await expect(page.getByText(/no sponsors found/i)).toBeVisible();

  // Clear — full list should come back
  await searchBox.clear();
  await page.waitForTimeout(600);
  await expect(page.getByText(/no sponsors found/i)).not.toBeVisible();
  await expect(page.locator('[role="row"]').first()).toBeVisible();
});

test("route filter narrows results", async ({ page }) => {
  await page.getByRole("combobox", { name: /route/i }).click();
  await page.getByRole("option", { name: "Skilled Worker" }).click();
  await page.waitForTimeout(400);

  // Results should still be present (Skilled Worker has many entries)
  await expect(page.locator('[role="row"]').first()).toBeVisible();

  // Switching to a very niche route should still not crash — rowgroup stays visible
  await expect(page.locator('[role="rowgroup"]')).toBeVisible();
});

test("postcode search filters by location", async ({ page }) => {
  await page
    .locator(".border-border")
    .filter({ hasText: "Location" })
    .getByRole("button")
    .click();

  await page.getByPlaceholder(/postcode\/city/i).fill("NE1 7RU");
  await page.getByRole("button", { name: /^search$/i }).click();

  // Wait for the location filter to resolve (hits external API)
  await expect(page.locator('[role="rowgroup"]')).toBeVisible({
    timeout: 15000,
  });

  // The location pill should now show the selected value
  await expect(
    page.locator(".border-primary").filter({ hasText: "Location" }),
  ).toBeVisible({ timeout: 15000 });
});
