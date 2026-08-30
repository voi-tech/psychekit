export type Aggregation = "sum" | "mean";

export interface Option { id: string; score: number; label: string; }
export interface OptionSet { id: string; options: Option[]; }
export interface InstrumentItem { id: string; text: string; optionSet: string; reversed?: boolean; }
export interface Range { min: number; max: number; }
export interface Band { min: number; max: number; label: string; }
export interface InstrumentScale { id: string; title: string; aggregation: Aggregation; items: string[]; range: Range; bands: Band[]; }
export type Responses = Record<string, string>;
export interface ScoreResult { scaleId: string; title: string; score: number; band: Band; max: number; }
