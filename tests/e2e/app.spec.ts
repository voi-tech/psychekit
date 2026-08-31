import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Answers the grammatical-form screen and enters the questionnaire. */
async function start(page: Page, gender: "męska" | "żeńska" = "męska") {
  await page.getByRole("radio", { name: `Forma ${gender}` }).check();
  await page.getByRole("button", { name: "Rozpocznij" }).click();
}

/** Answers every item with the option at `optionIndex` and submits the questionnaire. */
async function answerAll(page: Page, count: number, optionIndex = 0) {
  for (let index = 0; index < count; index += 1) {
    await page.getByRole("radio").nth(optionIndex).check();
    await page.getByRole("button", { name: index === count - 1 ? "Pokaż wynik" : "Dalej" }).click();
  }
}

test("public pages have no accessibility violations in both themes", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const path of ["/", "/test/gad-7/", "/licencje/", "/historia/", "/wynik/"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `${path} (${scheme})`).toEqual([]);
    }
  }
  await expect(page.getByRole("heading", { name: "Nie ma wyniku do pokazania" })).toBeVisible();
});

test("the question view has no accessibility violations", async ({ page }) => {
  await page.goto("/test/gad-7/");
  await start(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("the theme icon cycles system, light and dark and survives a reload", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /^Wygląd:/ });
  const html = page.locator("html");

  await expect(html).not.toHaveAttribute("data-motyw", /.+/);
  await expect(page.locator(".ikona-system")).toBeVisible();
  await expect(page.locator(".ikona-jasny")).toBeHidden();

  await toggle.click();
  await expect(html).toHaveAttribute("data-motyw", "jasny");
  await expect(page.locator(".ikona-jasny")).toBeVisible();

  await toggle.click();
  await expect(html).toHaveAttribute("data-motyw", "ciemny");
  await expect(page.locator(".ikona-ciemny")).toBeVisible();

  await page.reload();
  await expect(html).toHaveAttribute("data-motyw", "ciemny");

  await toggle.click();
  await expect(html).not.toHaveAttribute("data-motyw", /.+/);
});

test("the interface uses the locally hosted Geist fonts", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Geist");
  const families = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].map((face) => face.family);
  });
  expect(families).toContain("Geist");
  expect(families).toContain("Geist Mono");
});

test("cards show the questionnaire name with the code underneath, and no footer note remains", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Kwestionariusz zdrowia pacjenta" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Skala lęku uogólnionego" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Krótki kwestionariusz do pomiaru Wielkiej Piątki" })).toBeVisible();
  await expect(page.locator(".kod", { hasText: "PHQ-9" })).toBeVisible();
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByText("Odpowiedzi są przetwarzane w Twojej przeglądarce")).toHaveCount(0);
});

test("question wording follows the chosen grammatical form", async ({ page }) => {
  await page.goto("/test/gad-7/");
  await start(page, "żeńska");
  await expect(page.getByText("Czułaś się zdenerwowana, niespokojna lub mocno spięta")).toBeVisible();
  await page.getByRole("button", { name: "Zmień formę" }).click();
  await start(page, "męska");
  await expect(page.getByText("Czułeś się zdenerwowany, niespokojny lub mocno spięty")).toBeVisible();
});

test("no question shows a doubled grammatical form", async ({ page }) => {
  for (const [id, count] of [["gad-7", 7], ["phq-9", 9], ["ipip-bfm-20", 20]] as const) {
    await page.goto(`/test/${id}/`);
    await start(page);
    for (let index = 0; index < count; index += 1) {
      await expect(page.locator("legend")).not.toHaveText(/\(a\)|\(i\)|\/a\b|\/i\b/);
      if (index === count - 1) break;
      await page.getByRole("radio").first().check();
      await page.getByRole("button", { name: "Dalej" }).click();
    }
  }
});

test("PHQ-9 completes, activates the safety message, and declines history", async ({ page }) => {
  await page.goto("/test/phq-9/");
  await start(page);
  for (let index = 0; index < 8; index += 1) {
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Dalej" }).click();
  }
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Pokaż wynik" }).click();
  await expect(page.getByRole("heading", { name: "Wynik jest gotowy" })).toBeVisible();
  await page.getByRole("button", { name: "Pokaż bez zapisywania" }).click();
  await expect(page).toHaveURL(/\/wynik\/$/);
  await expect(page.getByText(/myśli o śmierci/)).toBeVisible();
  await expect(page.getByRole("link", { name: "112" })).toBeVisible();
  await page.goto("/historia/");
  await expect(page.getByText(/Nie ma tu jeszcze żadnego wyniku/)).toBeVisible();
});

test("a non-triggering PHQ-9 item 9 shows no safety message", async ({ page }) => {
  await page.goto("/test/phq-9/");
  await start(page);
  await answerAll(page, 9);
  await page.getByRole("button", { name: "Pokaż bez zapisywania" }).click();
  await expect(page.getByText(/myśli o śmierci/)).toHaveCount(0);
});

test("IPIP-BFM-20 reports five scales without interpretive bands and exports aggregate results", async ({ page }) => {
  await page.goto("/test/ipip-bfm-20/");
  await start(page);
  await answerAll(page, 20);
  await page.getByRole("button", { name: "Pokaż bez zapisywania" }).click();
  await expect(page).toHaveURL(/\/wynik\/$/);
  for (const scale of ["Ekstrawersja", "Ugodowość", "Sumienność", "Stabilność emocjonalna", "Intelekt"]) {
    await expect(page.getByRole("heading", { name: scale })).toBeVisible();
  }
  await expect(page.getByText(/Przedział:/)).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pobierz raport" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ipip-bfm-20-wynik.md");
  const stream = await download.createReadStream();
  let markdown = "";
  if (stream) for await (const chunk of stream) markdown += chunk.toString();
  expect(markdown).toContain("# Krótki kwestionariusz do pomiaru Wielkiej Piątki (IPIP-BFM-20)");
  expect(markdown).toContain("## Wyniki");
  expect(markdown).toContain("www.ipip.edu.pl");
  expect(markdown).not.toContain("q1");
});

test("a started questionnaire is restored after a refresh", async ({ page }) => {
  await page.goto("/test/gad-7/");
  await start(page, "żeńska");
  await page.getByRole("radio").nth(2).check();
  await expect(page.getByText("Pytanie 1 z 7")).toBeVisible();
  await page.waitForTimeout(200);
  await page.reload();
  await start(page, "żeńska");
  await expect(page.getByRole("radio").nth(2)).toBeChecked();
});

test("an opted-in result appears in history and can be removed", async ({ page }) => {
  page.on("dialog", (dialog) => void dialog.accept());
  await page.goto("/test/gad-7/");
  await start(page);
  await answerAll(page, 7);
  await page.getByRole("checkbox", { name: "Zapisz wynik w historii" }).check();
  await page.getByRole("button", { name: "Przejdź do wyniku" }).click();
  await expect(page).toHaveURL(/\/wynik\/$/);
  await page.goto("/historia/");
  await expect(page.getByRole("heading", { name: "Skala lęku uogólnionego" })).toBeVisible();
  await page.getByRole("button", { name: "Usuń wszystkie wyniki" }).click();
  await expect(page.getByText(/Nie ma tu jeszcze żadnego wyniku/)).toBeVisible();
});

test("result and history pages are excluded from indexing", async ({ page }) => {
  for (const path of ["/wynik/", "/historia/"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  }
});

test("the application remains usable offline after the first load", async ({ page, context }) => {
  await page.goto("/test/gad-7/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Skala lęku uogólnionego" })).toBeVisible();
  await context.setOffline(false);
});

test("filling in a questionnaire makes no requests to external origins", async ({ page }) => {
  const externalRequests: string[] = [];
  await page.goto("/");
  const appOrigin = new URL(page.url()).origin;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== appOrigin && url.protocol !== "data:") externalRequests.push(request.url());
  });
  await page.goto("/test/gad-7/");
  await start(page);
  await answerAll(page, 7);
  expect(externalRequests).toEqual([]);
});
