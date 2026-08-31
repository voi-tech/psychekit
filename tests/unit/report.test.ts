import { describe, expect, it } from "vitest";
import { buildMarkdownReport } from "@/domain/report/markdown";
import type { ResultSnapshot } from "@/domain/result";

const snapshot: ResultSnapshot = {
  instrumentId: "test",
  name: "Kwestionariusz testowy",
  code: "TEST-1",
  definitionVersion: "1.0.0",
  appVersion: "26.8.0",
  completedAt: Date.UTC(2026, 7, 30, 12, 0, 0),
  results: [
    { title: "Wynik ogólny", score: 8, min: 0, max: 10, band: "Umiarkowane" },
    { title: "Ekstrawersja", score: 13, min: 4, max: 20, band: null },
  ],
  disclaimer: "To nie jest diagnoza.",
  attribution: "Autorstwo testowe",
  adaptationNotice: "Brzmienie dostosowano gramatycznie.",
  sources: ["https://example.test/source"],
  safetyMessages: ["Ta odpowiedź wymaga uwagi."],
};

describe("buildMarkdownReport", () => {
  it("writes the report in Polish without item-level responses", () => {
    const markdown = buildMarkdownReport(snapshot);
    expect(markdown).toContain("# Kwestionariusz testowy (TEST-1)");
    expect(markdown).toContain("Wersja PsycheKit: 26.8.0");
    expect(markdown).toContain("- Wynik ogólny: 8 na 10 punktów (zakres od 0 do 10)");
    expect(markdown).toContain("  - Przedział: Umiarkowane");
    expect(markdown).toContain("https://example.test/source");
    expect(markdown).not.toContain("q1");
  });

  it("omits the band line for scales that report a raw score", () => {
    const markdown = buildMarkdownReport(snapshot);
    expect(markdown).toContain("- Ekstrawersja: 13 na 20 punktów (zakres od 4 do 20)");
    expect(markdown.split("\n").filter((line) => line.startsWith("  - Przedział:"))).toHaveLength(1);
  });

  it("carries the safety message, the adaptation notice, and the required credit", () => {
    const markdown = buildMarkdownReport(snapshot);
    expect(markdown).toContain("## Ważna informacja");
    expect(markdown).toContain("Ta odpowiedź wymaga uwagi.");
    expect(markdown).toContain("Brzmienie dostosowano gramatycznie.");
    expect(markdown).toContain("## Autorstwo");
    expect(markdown).toContain("Autorstwo testowe");
  });

  it("skips optional sections when they are absent", () => {
    const markdown = buildMarkdownReport({ ...snapshot, attribution: undefined, adaptationNotice: undefined, safetyMessages: [] });
    expect(markdown).not.toContain("## Autorstwo");
    expect(markdown).not.toContain("## Ważna informacja");
  });
});
