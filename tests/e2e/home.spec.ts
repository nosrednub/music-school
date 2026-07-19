import { test, expect } from "@playwright/test";

test.describe("Music School", () => {
  test("home page loads on mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Music School" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Playable now" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Biomes" })).toBeVisible();
  });

  test("game catalog links resolve", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Intervalis: Draw the semitone bridge/ })
      .click();
    await expect(page.getByRole("heading", { name: "Intervalis" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  });

  test("playable now links include Scale Studio", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", {
        name: /Scale Studio: Sheet music scale drills with full library/,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "Scale Studio" }),
    ).toBeVisible();
    await expect(page.getByText(/follow the staff/)).toBeVisible();
  });
});
