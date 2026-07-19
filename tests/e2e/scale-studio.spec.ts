import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "artifacts",
  "screenshots",
  "scale-studio",
);

test.describe("Scale Studio", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("practice flow with screenshots", async ({ page }) => {
    await page.goto("/practice/scale-studio");

    await expect(
      page.getByRole("heading", { name: "Scale Studio" }),
    ).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-ready.png"),
      fullPage: true,
    });

    await expect(page.getByText(/Play C4/)).toBeVisible();

    const cKey = page.getByRole("button", { name: "C 4" });
    await cKey.click();

    await expect(page.getByText(/Play D4/)).toBeVisible({ timeout: 3000 });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-after-note.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "Gospel" }).click();
    await page.selectOption('select[aria-label="Scale type"]', "major-pentatonic");

    await expect(page.getByText(/Major Pentatonic in C/)).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-gospel-pentatonic.png"),
      fullPage: true,
    });
  });
});
