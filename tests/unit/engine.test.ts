import { describe, expect, it } from "vitest";
import { scoreScale } from "@/engine/scoring";
import type { InstrumentItem, InstrumentScale, OptionSet } from "@/domain/instrument";

const options: OptionSet = {
  id: "range",
  options: [
    { id: "low", score: 2, label: "Low" },
    { id: "mid", score: 4, label: "Mid" },
    { id: "high", score: 8, label: "High" },
  ],
};

const items: InstrumentItem[] = [
  { id: "q1", text: "One", optionSet: "range" },
  { id: "q2", text: "Two", optionSet: "range", reversed: true },
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
    const result = scoreScale(scale, items, options, { q1: "high", q2: "mid" });
    expect(result.score).toBe(14);
    expect(result.band.label).toBe("High");
  });

  it("calculates a mean without rounding away precision", () => {
    const meanScale = { ...scale, aggregation: "mean" as const, range: { min: 2, max: 8 }, bands: [{ min: 2, max: 5, label: "Low" }, { min: 6, max: 8, label: "High" }] };
    const result = scoreScale(meanScale, items, options, { q1: "low", q2: "low" });
    expect(result.score).toBe(5);
  });

  it("rejects missing responses", () => {
    expect(() => scoreScale(scale, items, options, { q1: "low" })).toThrow("Missing response for q2");
  });
});
