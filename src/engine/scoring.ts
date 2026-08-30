import type { InstrumentItem, InstrumentScale, OptionSet, Responses, ScoreResult } from "@/domain/instrument";
import { findBand, validateBands } from "@/engine/bands";

function optionSetFor(item: InstrumentItem, options: OptionSet | Record<string, OptionSet>): OptionSet {
  return Array.isArray((options as OptionSet).options) ? options as OptionSet : (options as Record<string, OptionSet>)[item.optionSet];
}

export function scoreScale(scale: InstrumentScale, items: InstrumentItem[], options: OptionSet | Record<string, OptionSet>, responses: Responses): ScoreResult {
  validateBands(scale.range, scale.bands);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const scores: number[] = [];
  for (const itemId of scale.items) {
    const item = itemById.get(itemId);
    if (!item) throw new Error(`Unknown item ${itemId}`);
    const response = responses[itemId];
    if (response === undefined) throw new Error(`Missing response for ${itemId}`);
    const set = optionSetFor(item, options);
    if (!set) throw new Error(`Unknown option set ${item.optionSet}`);
    const selected = set.options.find((option) => option.id === response);
    if (!selected) throw new Error(`Unknown option ${response} for ${itemId}`);
    const rawScores = set.options.map((option) => option.score);
    scores.push(item.reversed ? Math.min(...rawScores) + Math.max(...rawScores) - selected.score : selected.score);
  }
  const score = scale.aggregation === "mean" ? scores.reduce((sum, value) => sum + value, 0) / scores.length : scores.reduce((sum, value) => sum + value, 0);
  return { scaleId: scale.id, title: scale.title, score, band: findBand(score, scale.bands), max: scale.range.max };
}
