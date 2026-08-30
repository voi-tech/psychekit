import { describe, expect, it } from "vitest";
import { buildMarkdownReport } from "@/domain/report/markdown";

describe("buildMarkdownReport", () => {
  it("exports multi-scale results without item-level responses", () => {
    const markdown = buildMarkdownReport({
      title: "Test instrument",
      date: "2026-08-30",
      instrumentVersion: "1.0.0",
      appVersion: "26.8.0",
      results: [
        { title: "Total", score: 8, max: 10, band: "Mid" },
        { title: "Second", score: 3, max: 5, band: "Low" },
      ],
      disclaimer: "To nie jest diagnoza.",
      sources: ["https://example.test/source"],
      responses: { q1: "high" },
    });
    expect(markdown).toContain("# Test instrument");
    expect(markdown).toContain("- Total: 8 / 10");
    expect(markdown).toContain("- Second: 3 / 5");
    expect(markdown).not.toContain("q1");
    expect(markdown).toContain("https://example.test/source");
  });
});
