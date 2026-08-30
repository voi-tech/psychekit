import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public pages have no accessibility violations", async ({ page }) => {
  for (const path of ["/", "/test/gad-7/", "/wynik/"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, path).toEqual([]);
  }
  await expect(page.getByRole("heading", { name: "Brak bieżącego wyniku" })).toBeVisible();
});

test("PHQ-9 completes, activates safety message, and declines history", async ({ page }) => {
  await page.goto("/test/phq-9");
  for (let index = 0; index < 8; index += 1) {
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Dalej" }).click();
  }
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Pokaż wynik" }).click();
  await expect(page.getByText("Wynik jest gotowy")).toBeVisible();
  await page.getByRole("button", { name: "Nie, pokaż wynik" }).click();
  await expect(page).toHaveURL(/\/wynik\/$/);
  await expect(page.getByText(/Twoja odpowiedź wskazuje/)).toBeVisible();
  await page.goto("/historia/");
  await expect(page.getByText(/nie zapisuje ukończonych wyników/)).toBeVisible();
});

test("IPIP-BFM-20 completes and exports aggregate results without item responses", async ({ page }) => {
  await page.goto("/test/ipip-bfm-20/");
  for (let index = 0; index < 20; index += 1) {
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: index === 19 ? "Pokaż wynik" : "Dalej" }).click();
  }
  await page.getByRole("button", { name: "Nie, pokaż wynik" }).click();
  await expect(page).toHaveURL(/\/wynik\/?$/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pobierz Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ipip-bfm-20-wynik.md");
  const stream = await download.createReadStream();
  let markdown = "";
  if (stream) for await (const chunk of stream) markdown += chunk.toString();
  expect(markdown).toContain("# IPIP-BFM-20");
  expect(markdown).not.toContain("responses");
  expect(markdown).not.toContain("item-level");
});

test("started session is restored after refresh", async ({ page }) => {
  await page.goto("/test/gad-7/");
  await page.getByRole("radio").nth(2).check();
  await page.waitForTimeout(100);
  await page.reload();
  await expect(page.getByRole("radio").nth(2)).toBeChecked();
});

test("opt-in result appears in history", async ({ page }) => {
  await page.goto("/test/gad-7/");
  for (let index = 0; index < 7; index += 1) {
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: index === 6 ? "Pokaż wynik" : "Dalej" }).click();
  }
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Zapisz i pokaż wynik" }).click();
  await expect(page).toHaveURL(/\/wynik\/?$/);
  await page.goto("/historia/");
  await expect(page.getByRole("heading", { name: "GAD-7" })).toBeVisible();
});

test("non-triggering PHQ-9 item 9 does not show safety message", async ({ page }) => {
  await page.goto("/test/phq-9/");
  for (let index = 0; index < 9; index += 1) {
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: index === 8 ? "Pokaż wynik" : "Dalej" }).click();
  }
  await page.getByRole("button", { name: "Nie, pokaż wynik" }).click();
  await expect(page.getByText(/myśli dotyczące śmierci/)).toHaveCount(0);
});

test("result and history pages are noindex", async ({ page }) => {
  for (const path of ["/wynik/", "/historia/"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  }
});

test("application remains usable offline after first load", async ({ page, context }) => {
  await page.goto("/test/gad-7/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "GAD-7" })).toBeVisible();
  await context.setOffline(false);
});

test("questionnaire session makes no requests to external origins", async ({ page }) => {
  const externalRequests: string[] = [];
  await page.goto("/");
  const appOrigin = new URL(page.url()).origin;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== appOrigin && url.protocol !== "data:") externalRequests.push(request.url());
  });
  await page.goto("/test/gad-7/");
  await expect(page.getByRole("heading", { name: "GAD-7" })).toBeVisible();
  expect(externalRequests).toEqual([]);
});
