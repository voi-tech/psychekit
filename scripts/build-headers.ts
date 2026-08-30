import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Astro emits inline hydration scripts whose contents change between builds.
 * Hand-maintained CSP hashes go stale silently, so they are recomputed here
 * from the built output and injected into dist/_headers.
 */
const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const PLACEHOLDER = "__HASHE_SKRYPTOW__";

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  }));
  return files.flat();
}

const hashes = new Set<string>();
for (const file of await htmlFiles(dist)) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    hashes.add(`'sha256-${createHash("sha256").update(match[1], "utf8").digest("base64")}'`);
  }
}

const headersPath = join(dist, "_headers");
const template = await readFile(headersPath, "utf8");
if (!template.includes(PLACEHOLDER)) throw new Error(`dist/_headers is missing the ${PLACEHOLDER} placeholder`);
await writeFile(headersPath, template.replace(PLACEHOLDER, [...hashes].sort().join(" ")));
console.log(`Wpisano ${hashes.size} skrótów skryptów osadzonych do dist/_headers.`);
