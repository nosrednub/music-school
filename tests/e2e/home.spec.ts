import { test, expect } from "@playwright/test";

test.describe("Music School", () => {
  test("home page loads on mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Music School" })).toBeVisible();
    await expect(page.getByText("Phase 1 Games")).toBeVisible();
  });

  test("game catalog links resolve", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Intervalis/ }).click();
    await expect(page.getByRole("heading", { name: "Intervalis" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  });
});
