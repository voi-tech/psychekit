import type { Gender } from "@/domain/instrument";

/** The appearance preference is handled by public/motyw.js so it can apply before first paint. */
const GENDER_KEY = "psychekit:gender";

export function readGender(): Gender | null {
  try {
    const stored = localStorage.getItem(GENDER_KEY);
    return stored === "m" || stored === "f" ? stored : null;
  } catch {
    return null;
  }
}

export function writeGender(value: Gender): void {
  try { localStorage.setItem(GENDER_KEY, value); } catch { /* zapis niedostępny, wybór działa do końca sesji */ }
}
