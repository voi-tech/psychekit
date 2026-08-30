import type { Band, Range } from "@/domain/instrument";

export function validateBands(range: Range, bands: Band[]): void {
  if (bands.length === 0) return;
  if (bands[0].min !== range.min || bands[bands.length - 1].max !== range.max) throw new Error("Bands must cover the complete range");
  for (const band of bands) {
    if (band.min < range.min || band.max > range.max || band.min > band.max) throw new Error("Band is outside the declared range");
  }
  for (let index = 1; index < bands.length; index += 1) {
    if (bands[index - 1].max + 1 !== bands[index].min) throw new Error("Bands must be contiguous without gaps or overlap");
  }
}

/** Returns null for scales that deliberately report a raw score without an interpretive band. */
export function findBand(score: number, bands: Band[]): Band | null {
  if (bands.length === 0) return null;
  const band = bands.find((candidate) => score >= candidate.min && score <= candidate.max);
  if (!band) throw new Error(`No band contains score ${score}`);
  return band;
}
