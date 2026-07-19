import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "artifacts",
  "screenshots",
  "intervalis",
);

test.describe("Intervalis", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("bridge game flow with screenshots", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/games/intervalis");

    await expect(page.getByRole("heading", { name: "Intervalis" })).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-ready.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "Start" }).click();

    await expect(page.getByText("Drag from the left crystal")).toBeVisible({
      timeout: 8000,
    });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-playing.png"),
      fullPage: true,
    });

    const canvas = page.locator("canvas").first();
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      await page.mouse.move(box.x + 80, box.y + 200);
      await page.mouse.down();
      await page.mouse.move(box.x + 160, box.y + 200);
      await page.mouse.up();
    }

    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-after-bridge.png"),
      fullPage: true,
    });

    await expect(
      page.getByText(/Bridge holds|Bridge shatters/),
    ).toBeVisible({ timeout: 5000 });
  });
});
