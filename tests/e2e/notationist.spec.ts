import { test, expect } from "@playwright/test";

test.describe("Notationist", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("spell staff flow starts", async ({ page }) => {
    await page.goto("/games/notationist");
    await expect(page.getByRole("heading", { name: "Notationist" })).toBeVisible();
    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByText(/Target rune/)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: "Play C" })).toBeVisible();
  });
});
