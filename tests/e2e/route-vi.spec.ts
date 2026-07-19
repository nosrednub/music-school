import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "public",
  "screenshots",
  "route-vi",
);

test.describe("Route VI", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Chapel Line routing flow with screenshots", async ({ page }) => {
    await page.goto("/games/route-vi");

    await expect(page.getByRole("heading", { name: "Route VI" })).toBeVisible();
    await expect(page.getByText(/Chapel Line/)).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-ready.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /Start Chapel Line/ }).click();

    await expect(page.getByText(/Junction 1/)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/Route to/)).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-junction.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /Switch to vi/ }).click();

    await expect(page.getByText(/Junction 2/)).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-after-switch.png"),
      fullPage: true,
    });
  });
});
