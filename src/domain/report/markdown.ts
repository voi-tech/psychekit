export interface ReportInput {
  title: string; date: string; instrumentVersion: string; appVersion: string;
  results: Array<{ title: string; score: number; max: number; band: string }>;
  disclaimer: string; sources: string[]; responses?: Record<string, string>;
}

export function buildMarkdownReport(input: ReportInput): string {
  return [
    `# ${input.title}`, "", `Date: ${input.date}`, `Instrument version: ${input.instrumentVersion}`, `PsycheKit version: ${input.appVersion}`, "",
    "## Results", "", ...input.results.flatMap((result) => [`- ${result.title}: ${result.score} / ${result.max}`, `  - Band: ${result.band}`]), "",
    "## Notice", "", input.disclaimer, "", "## Sources", "", ...input.sources.map((source) => `- ${source}`), "",
  ].join("\n");
}
