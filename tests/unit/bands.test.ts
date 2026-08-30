import { describe, expect, it } from "vitest";
import { validateBands } from "@/engine/bands";

describe("validateBands", () => {
  it("accepts contiguous bands that cover the full range", () => {
    expect(() => validateBands({ min: 0, max: 10 }, [
      { min: 0, max: 4, label: "A" },
      { min: 5, max: 10, label: "B" },
    ])).not.toThrow();
  });

  it("rejects gaps, overlap, and out-of-range bands", () => {
    expect(() => validateBands({ min: 0, max: 10 }, [{ min: 0, max: 3, label: "A" }, { min: 5, max: 10, label: "B" }])).toThrow("contiguous");
    expect(() => validateBands({ min: 0, max: 10 }, [{ min: 0, max: 5, label: "A" }, { min: 5, max: 10, label: "B" }])).toThrow("contiguous");
    expect(() => validateBands({ min: 0, max: 10 }, [{ min: -1, max: 10, label: "A" }])).toThrow("range");
  });
});
