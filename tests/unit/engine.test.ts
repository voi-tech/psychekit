import { describe, expect, it } from "vitest";
import { scoreScale } from "@/engine/scoring";
import { resolveText } from "@/domain/instrument";
import type { InstrumentItem, InstrumentScale, OptionSet } from "@/domain/instrument";

const optionSets: Record<string, OptionSet> = {
  range: {
    id: "range",
    options: [
      { id: "low", score: 2, label: "Low" },
      { id: "mid", score: 4, label: "Mid" },
      { id: "high", score: 8, label: "High" },
    ],
  },
};

const items: InstrumentItem[] = [
  { id: "q1", text: "One", optionSet: "range" },
  { id: "q2", text: { m: "Two, masculine", f: "Two, feminine" }, optionSet: "range", reversed: true },
];

const scale: InstrumentScale = {
  id: "total",
  title: "Total",
  aggregation: "sum",
  items: ["q1", "q2"],
  range: { min: 4, max: 16 },
  bands: [
    { min: 4, max: 7, label: "Low" },
    { min: 8, max: 12, label: "Mid" },
    { min: 13, max: 16, label: "High" },
  ],
};

describe("scoreScale", () => {
  it("sums option scores and reverses from the actual option range", () => {
    const result = scoreScale(scale, items, optionSets, { q1: "high", q2: "mid" });
    expect(result.score).toBe(14);
    expect(result.band?.label).toBe("High");
    expect(result.min).toBe(4);
  });

  it("calculates a mean without rounding away precision", () => {
    const meanScale = { ...scale, aggregation: "mean" as const, range: { min: 2, max: 8 }, bands: [{ min: 2, max: 5, label: "Low" }, { min: 6, max: 8, label: "High" }] };
    const result = scoreScale(meanScale, items, optionSets, { q1: "low", q2: "low" });
    expect(result.score).toBe(5);
  });

  it("reports a raw score when the scale declares no bands", () => {
    const result = scoreScale({ ...scale, bands: [] }, items, optionSets, { q1: "high", q2: "mid" });
    expect(result.band).toBeNull();
    expect(result.score).toBe(14);
  });

  it("rejects missing responses", () => {
    expect(() => scoreScale(scale, items, optionSets, { q1: "low" })).toThrow("Missing response for q2");
  });

  it("rejects an unknown option set", () => {
    const brokenItems: InstrumentItem[] = [{ id: "q1", text: "One", optionSet: "missing" }];
    const brokenScale: InstrumentScale = { ...scale, items: ["q1"], range: { min: 2, max: 8 }, bands: [] };
    expect(() => scoreScale(brokenScale, brokenItems, optionSets, { q1: "low" })).toThrow("Unknown option set missing");
  });
});

describe("resolveText", () => {
  it("returns neutral wording unchanged", () => {
    expect(resolveText("One", "f")).toBe("One");
  });

  it("picks the wording matching the chosen grammatical form", () => {
    expect(resolveText({ m: "Two, masculine", f: "Two, feminine" }, "f")).toBe("Two, feminine");
    expect(resolveText({ m: "Two, masculine", f: "Two, feminine" }, "m")).toBe("Two, masculine");
  });
});
