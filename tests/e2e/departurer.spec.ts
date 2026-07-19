import { test, expect } from "@playwright/test";

test.describe("Departurer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("rocket reach flow starts", async ({ page }) => {
    await page.goto("/games/departurer");
    await expect(page.getByRole("heading", { name: "Departurer" })).toBeVisible();
    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByText(/Fuel gauge/)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: "Launch" })).toBeVisible();
  });
});
