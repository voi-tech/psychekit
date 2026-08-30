import type { ResultSnapshot } from "@/domain/result";

export function buildMarkdownReport(snapshot: ResultSnapshot): string {
  const data = new Date(snapshot.completedAt).toLocaleDateString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" });
  const wiersze = [
    `# ${snapshot.title}`, "",
    `Data wypełnienia: ${data}`,
    `Wersja kwestionariusza: ${snapshot.definitionVersion}`,
    `Wersja PsycheKit: ${snapshot.appVersion}`, "",
    "## Wyniki", "",
    ...snapshot.results.flatMap((wynik) => [
      `- ${wynik.title}: ${wynik.score} na ${wynik.max} punktów (zakres od ${wynik.min} do ${wynik.max})`,
      ...(wynik.band ? [`  - Przedział: ${wynik.band}`] : []),
    ]), "",
  ];
  if (snapshot.safetyMessages.length > 0) {
    wiersze.push("## Ważna informacja", "", ...snapshot.safetyMessages.flatMap((tresc) => [tresc, ""]));
  }
  wiersze.push("## Zastrzeżenie", "", snapshot.disclaimer, "");
  if (snapshot.adaptationNotice) wiersze.push(snapshot.adaptationNotice, "");
  if (snapshot.attribution) wiersze.push("## Autorstwo", "", snapshot.attribution, "");
  wiersze.push("## Źródła", "", ...snapshot.sources.map((zrodlo) => `- ${zrodlo}`), "");
  return wiersze.join("\n");
}
