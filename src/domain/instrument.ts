export type Aggregation = "sum" | "mean";

/** Grammatical form the questionnaire is phrased in. */
export type Gender = "m" | "f";

/** Item wording: a single neutral phrasing, or one phrasing per grammatical form. */
export type LocalizedText = string | Record<Gender, string>;

export interface Option { id: string; score: number; label: string; shortLabel?: string; }
export interface OptionSet { id: string; prompt?: string; options: Option[]; }
export interface InstrumentItem { id: string; text: LocalizedText; optionSet: string; reversed?: boolean; }
export interface Range { min: number; max: number; }
export interface Band { min: number; max: number; label: string; }
export interface InstrumentScale { id: string; title: string; aggregation: Aggregation; items: string[]; range: Range; bands: Band[]; }
export interface SafetySignal { id: string; item: string; when: { scoreGte: number }; message?: string; }

export interface Instrument {
  id: string;
  /** Human-readable name shown to the user. */
  name: string;
  /** Technical designation of the instrument, e.g. PHQ-9. */
  code: string;
  subtitle: string;
  language: string;
  definitionVersion: string;
  estimatedMinutes: number;
  license: string;
  attribution?: string;
  adaptationNotice?: string;
  disclaimer: string;
  sources: string[];
  optionSets: Record<string, OptionSet>;
  items: InstrumentItem[];
  scales: InstrumentScale[];
  safetySignals: SafetySignal[];
}

export type Responses = Record<string, string>;
export interface ScoreResult { scaleId: string; title: string; score: number; band: Band | null; min: number; max: number; }

export function resolveText(text: LocalizedText, gender: Gender): string {
  return typeof text === "string" ? text : text[gender];
}
