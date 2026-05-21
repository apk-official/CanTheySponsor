import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator('[role="rowgroup"]')).toBeVisible({
    timeout: 30000,
  });
});
test("page loads and shows results", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(5000); // wait 5s flat
  await page.screenshot({ path: "debug.png" }); // check what rendered
  await expect(page.locator('[role="rowgroup"]')).toBeVisible();
});

test("company search filters results", async ({ page }) => {
  const initialCount = await page.locator('[role="row"]').count();
  await page.getByPlaceholder("Type a Company Name...").fill("Google");
  await page.waitForTimeout(500); // debounce
  const filteredCount = await page.locator('[role="row"]').count();
  expect(filteredCount).toBeLessThan(initialCount);
});

test("clearing search restores results", async ({ page }) => {
  const searchBox = page.getByPlaceholder("Type a Company Name...");
  await searchBox.fill("Google");
  await page.waitForTimeout(500);
  const filtered = await page.locator('[role="row"]').count();
  await searchBox.clear();
  await page.waitForTimeout(500);
  const restored = await page.locator('[role="row"]').count();
  expect(restored).toBeGreaterThan(filtered);
});

test("route filter narrows results", async ({ page }) => {
  const before = await page.locator('[role="row"]').count();
  await page.getByRole("combobox", { name: /route/i }).click();
  await page.getByRole("option", { name: "Skilled Worker" }).click();
  await page.waitForTimeout(300);
  const after = await page.locator('[role="row"]').count();
  expect(after).toBeLessThanOrEqual(before);
});

test("postcode search filters by location", async ({ page }) => {
  // Click the ChevronDown button inside the location filter
  await page
    .locator(".border-border")
    .filter({ hasText: "Location" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder(/postcode\/city/i).fill("NE1 7RU");
  await page.getByRole("button", { name: /^search$/i }).click();
  await expect(page.locator('[role="rowgroup"]')).toBeVisible({
    timeout: 15000,
  });
});
