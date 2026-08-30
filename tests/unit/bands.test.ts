import { describe, expect, it } from "vitest";
import { findBand, validateBands } from "@/engine/bands";

describe("validateBands", () => {
  it("accepts contiguous bands that cover the full range", () => {
    expect(() => validateBands({ min: 0, max: 10 }, [
      { min: 0, max: 4, label: "A" },
      { min: 5, max: 10, label: "B" },
    ])).not.toThrow();
  });

  it("accepts a scale that deliberately declares no bands", () => {
    expect(() => validateBands({ min: 4, max: 20 }, [])).not.toThrow();
  });

  it("rejects gaps, overlap, and out-of-range bands", () => {
    expect(() => validateBands({ min: 0, max: 10 }, [{ min: 0, max: 3, label: "A" }, { min: 5, max: 10, label: "B" }])).toThrow("contiguous");
    expect(() => validateBands({ min: 0, max: 10 }, [{ min: 0, max: 5, label: "A" }, { min: 5, max: 10, label: "B" }])).toThrow("contiguous");
    expect(() => validateBands({ min: 0, max: 10 }, [{ min: -1, max: 10, label: "A" }])).toThrow("range");
  });

  it("rejects bands that stop short of the range", () => {
    expect(() => validateBands({ min: 0, max: 10 }, [{ min: 0, max: 8, label: "A" }])).toThrow("complete range");
  });
});

describe("findBand", () => {
  it("returns null when a scale reports a raw score", () => {
    expect(findBand(12, [])).toBeNull();
  });

  it("returns the band containing the score", () => {
    expect(findBand(7, [{ min: 0, max: 4, label: "A" }, { min: 5, max: 10, label: "B" }])?.label).toBe("B");
  });
});
