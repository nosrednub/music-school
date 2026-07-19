import { test, expect } from "@playwright/test";
import path from "path";

const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "artifacts",
  "screenshots",
  "rhythmic-parrot",
);

test.describe("Rhythmic Parrot", () => {
  test.use({
    viewport: { width: 390, height: 844 },
  });

  test("level 1 flow with screenshots (silent mode)", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/games/rhythmic-parrot");

    await expect(
      page.getByRole("heading", { name: "Rhythmic Parrot" }),
    ).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-ready-screen.png"),
      fullPage: true,
    });

    await expect(page.getByRole("button", { name: "Start Round" })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: "Start Round" }).click();

    await expect(page.getByText("3")).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-countdown.png"),
      fullPage: true,
    });

    await expect(page.getByRole("button", { name: "Tap rhythm" })).toBeVisible({
      timeout: 10000,
    });

    await page.waitForTimeout(2200);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-playing-fruit-in-flight.png"),
      fullPage: true,
    });

    const tapButton = page.getByRole("button", { name: "Tap rhythm" });
    for (let i = 0; i < 6; i += 1) {
      await tapButton.click();
      await page.waitForTimeout(650);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04-playing-after-taps.png"),
      fullPage: true,
    });

    await expect(page.getByText("Round complete")).toBeVisible({
      timeout: 20000,
    });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05-results.png"),
      fullPage: true,
    });
  });

  test("home links to playable parrot game", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Rhythmic Parrot: Tap when the fruit hits the beak$/ })
      .click();
    await expect(page.getByRole("button", { name: "Start Round" })).toBeVisible();
  });
});
