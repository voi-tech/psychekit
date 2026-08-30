import Dexie, { type Table } from "dexie";
import type { Gender } from "@/domain/instrument";
import type { ResultSnapshot } from "@/domain/result";

export interface SessionRecord { id: string; instrumentId: string; gender: Gender; responses: Record<string, string>; currentIndex: number; createdAt: number; updatedAt: number; }
export interface ResultRecord { id: string; instrumentId: string; completedAt: number; snapshot: ResultSnapshot; }

const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

class PsycheKitDatabase extends Dexie {
  sessions!: Table<SessionRecord, string>;
  results!: Table<ResultRecord, string>;
  constructor() { super("psychekit"); this.version(1).stores({ sessions: "id, instrumentId, updatedAt", results: "id, instrumentId, completedAt" }); }
}

export const db = new PsycheKitDatabase();

/** Preserves createdAt of an existing session so the field keeps its meaning. */
export async function saveSession(session: Omit<SessionRecord, "createdAt" | "updatedAt">, now = Date.now()): Promise<void> {
  const existing = await db.sessions.get(session.id);
  await db.sessions.put({ ...session, createdAt: existing?.createdAt ?? now, updatedAt: now });
}

export const loadSession = (id: string) => db.sessions.get(id);
export const deleteSession = (id: string) => db.sessions.delete(id);
export async function purgeExpiredSessions(now = Date.now()): Promise<void> { await db.sessions.where("updatedAt").below(now - SESSION_LIFETIME_MS).delete(); }
export const saveResult = (result: ResultRecord) => db.results.put(result);
export const listResults = () => db.results.orderBy("completedAt").reverse().toArray();
export const deleteResult = (id: string) => db.results.delete(id);
export const deleteAllResults = () => db.results.clear();
