export interface ScaleOutcome { title: string; score: number; min: number; max: number; band: string | null; }

export interface ResultSnapshot {
  instrumentId: string;
  name: string;
  code: string;
  definitionVersion: string;
  appVersion: string;
  completedAt: number;
  results: ScaleOutcome[];
  disclaimer: string;
  attribution?: string;
  adaptationNotice?: string;
  sources: string[];
  safetyMessages: string[];
}

export const CURRENT_RESULT_KEY = "psychekit:ostatni-wynik";
