import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "public",
  "screenshots",
  "scale-studio",
);

test.describe("Scale Studio", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("sheet music drill flow with screenshots", async ({ page }) => {
    await page.goto("/practice/scale-studio");

    await expect(
      page.getByRole("heading", { name: "Scale Studio" }),
    ).toBeVisible();

    await expect(page.getByText(/follow the staff/)).toBeVisible();
    await expect(page.getByText(/scales · sheet music/)).toBeVisible();
    await expect(page.locator('[data-staff-ready="true"] svg')).toBeVisible({
      timeout: 15_000,
    });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-staff-view.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /Scale library/ }).click();
    await page.getByPlaceholder("Search scales…").fill("gospel");
    await page.getByRole("button", { name: /Major Pentatonic/ }).click();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-library-pentatonic.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /Thirds Ladder/ }).click();
    await expect(page.getByText(/Diatonic thirds/)).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-thirds-exercise.png"),
      fullPage: true,
    });
  });
});
