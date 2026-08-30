import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse } from "yaml";

const root = resolve(import.meta.dirname, "..");
const instrumentsDir = join(root, "src/content/instrumenty");
const licensesDir = join(root, "src/content/licencje");

function frontmatter(source: string): Record<string, any> {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("Instrument is missing YAML frontmatter");
  return parse(match[1]);
}

/** The app version lives in src/version.ts; package.json stays the single source of truth. */
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const versionSource = await readFile(join(root, "src/version.ts"), "utf8");
const declaredVersion = versionSource.match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1];
if (declaredVersion !== pkg.version) throw new Error(`src/version.ts declares ${declaredVersion}, package.json declares ${pkg.version}`);

const yamlFiles = (await readdir(licensesDir)).filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));
const markdownFiles = (await readdir(instrumentsDir)).filter((file) => file.endsWith(".md"));

const licenses = new Map<string, any>();
for (const file of yamlFiles) {
  const license = parse(await readFile(join(licensesDir, file), "utf8"));
  if (licenses.has(license.id)) throw new Error(`Duplicate license id ${license.id}`);
  if (license.class === "attribution" && !license.attribution) throw new Error(`${license.id}: attribution licenses must carry a credit line`);
  licenses.set(license.id, license);
}

const instruments = await Promise.all(markdownFiles.map(async (file) => frontmatter(await readFile(join(instrumentsDir, file), "utf8"))));
const instrumentIds = new Set<string>();

for (const instrument of instruments) {
  if (instrumentIds.has(instrument.id)) throw new Error(`Duplicate instrument id ${instrument.id}`);
  instrumentIds.add(instrument.id);

  // The interface is Polish only, so shipping a foreign-language instrument would leak untranslated text into the UI.
  if (instrument.language !== "pl") throw new Error(`${instrument.id}: production instruments must be Polish`);

  const license = licenses.get(instrument.license);
  if (!license) throw new Error(`${instrument.id}: unknown license ${instrument.license}`);
  if (license.status !== "verified" || license.class === "proprietary") throw new Error(`${instrument.id}: production license is not verified`);
  if (license.class === "attribution" && !instrument.attribution) throw new Error(`${instrument.id}: license requires a visible credit line`);
  if (license.translation?.type === "adaptation" && !instrument.adaptationNotice) throw new Error(`${instrument.id}: adapted wording must be disclosed to the user`);

  const items = instrument.items ?? [];
  const itemIds = new Set<string>();
  for (const item of items) {
    if (itemIds.has(item.id)) throw new Error(`${instrument.id}: duplicate item ${item.id}`);
    itemIds.add(item.id);
    if (!instrument.optionSets[item.optionSet]) throw new Error(`${instrument.id}: unknown option set ${item.optionSet}`);
    if (typeof item.text === "string") {
      if (item.text.trim() === "") throw new Error(`${instrument.id}: empty text for ${item.id}`);
      if (/\(a\)|\(i\)|\/a\b|\/i\b/.test(item.text)) throw new Error(`${instrument.id}: ${item.id} still contains a doubled grammatical form`);
    } else {
      if (!item.text?.m?.trim() || !item.text?.f?.trim()) throw new Error(`${instrument.id}: ${item.id} needs both a masculine and a feminine wording`);
      if (item.text.m === item.text.f) throw new Error(`${instrument.id}: ${item.id} has identical wordings, use a single string instead`);
    }
  }

  const scaleIds = new Set<string>();
  const usedItems = new Set<string>();
  for (const scale of instrument.scales ?? []) {
    if (scaleIds.has(scale.id)) throw new Error(`${instrument.id}: duplicate scale ${scale.id}`);
    scaleIds.add(scale.id);
    for (const itemId of scale.items) {
      if (!itemIds.has(itemId)) throw new Error(`${instrument.id}: unknown item ${itemId} in ${scale.id}`);
      usedItems.add(itemId);
    }

    const { min, max } = scale.range;
    if (scale.aggregation === "sum" && (!Number.isInteger(min) || !Number.isInteger(max))) throw new Error(`${instrument.id}: sum range must be integer`);

    const bands = scale.bands ?? [];
    if (bands.length > 0) {
      if (bands[0].min !== min || bands.at(-1).max !== max) throw new Error(`${instrument.id}: bands do not cover range`);
      for (let index = 0; index < bands.length; index += 1) {
        const band = bands[index];
        if (band.min < min || band.max > max || band.min > band.max) throw new Error(`${instrument.id}: band outside range`);
        if (index > 0 && bands[index - 1].max + 1 !== band.min) throw new Error(`${instrument.id}: bands are not contiguous`);
      }
    }
  }
  for (const itemId of itemIds) if (!usedItems.has(itemId)) throw new Error(`${instrument.id}: item ${itemId} is not scored by any scale`);

  for (const signal of instrument.safetySignals ?? []) if (!itemIds.has(signal.item)) throw new Error(`${instrument.id}: unknown safety item ${signal.item}`);
}

const notices = [
  "# Third-party instrument notices", "",
  "This file is generated from `src/content/licencje/`. Psychological instrument content is not covered by the MIT license of the application source code.", "",
  ...[...licenses.values()].map((license) => [
    `## ${license.id}`, "", `- Class: ${license.class}`, `- Status: ${license.status}`, `- Rights holder: ${license.holder}`,
    `- Source: ${license.source}`, `- Verified: ${license.verifiedAt}`, `- Translation: ${license.translation.type} (${license.translation.language})`,
    license.attribution ? `- Required credit: ${license.attribution}` : "",
    license.notes ? `- Notes: ${license.notes}` : "", "",
  ].filter(Boolean).join("\n")),
].join("\n");
await writeFile(join(root, "THIRD_PARTY_NOTICES.md"), notices);
console.log(`Validated ${instruments.length} production instruments and ${licenses.size} license records.`);
