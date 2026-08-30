import Dexie, { type Table } from "dexie";

export interface SessionRecord { id: string; instrumentId: string; responses: Record<string, string>; currentIndex: number; createdAt: number; updatedAt: number; }
export interface ResultRecord { id: string; instrumentId: string; completedAt: number; snapshot: unknown; }

class PsycheKitDatabase extends Dexie {
  sessions!: Table<SessionRecord, string>;
  results!: Table<ResultRecord, string>;
  constructor() { super("psychekit"); this.version(1).stores({ sessions: "id, instrumentId, updatedAt", results: "id, instrumentId, completedAt" }); }
}

export const db = new PsycheKitDatabase();
export const saveSession = (session: SessionRecord) => db.sessions.put(session);
export const loadSession = (id: string) => db.sessions.get(id);
export async function purgeExpiredSessions(now = Date.now()): Promise<void> { await db.sessions.where("updatedAt").below(now - 7 * 24 * 60 * 60 * 1000).delete(); }
export const saveResult = (result: ResultRecord) => db.results.put(result);
export const listResults = () => db.results.orderBy("completedAt").reverse().toArray();
export const deleteResult = (id: string) => db.results.delete(id);
