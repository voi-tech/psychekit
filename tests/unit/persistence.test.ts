import { describe, expect, it, beforeEach } from "vitest";
import { db, saveSession, loadSession, deleteSession, saveResult, listResults, deleteResult, deleteAllResults, purgeExpiredSessions } from "@/infrastructure/db/database";
import type { ResultSnapshot } from "@/domain/result";

const snapshot: ResultSnapshot = {
  instrumentId: "gad-7", title: "GAD-7", definitionVersion: "2.0.0", appVersion: "26.8.0", completedAt: 1,
  results: [{ title: "Wynik ogólny", score: 4, min: 0, max: 21, band: "Minimalne" }],
  disclaimer: "To nie jest diagnoza.", sources: [], safetyMessages: [],
};

describe("local persistence", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.results.clear();
  });

  it("saves and resumes an in-progress session together with the chosen grammatical form", async () => {
    await saveSession({ id: "s1", instrumentId: "ipip-bfm-20", gender: "f", responses: { q1: "a" }, currentIndex: 1 });
    await expect(loadSession("s1")).resolves.toMatchObject({ currentIndex: 1, gender: "f" });
  });

  it("keeps the original creation time when a session is updated", async () => {
    await saveSession({ id: "s1", instrumentId: "gad-7", gender: "m", responses: {}, currentIndex: 0 }, 1_000);
    await saveSession({ id: "s1", instrumentId: "gad-7", gender: "m", responses: { q1: "a" }, currentIndex: 1 }, 5_000);
    await expect(loadSession("s1")).resolves.toMatchObject({ createdAt: 1_000, updatedAt: 5_000 });
  });

  it("deletes a session on demand", async () => {
    await saveSession({ id: "s1", instrumentId: "gad-7", gender: "m", responses: {}, currentIndex: 0 });
    await deleteSession("s1");
    await expect(loadSession("s1")).resolves.toBeUndefined();
  });

  it("purges sessions older than seven days", async () => {
    const now = 10 * 24 * 60 * 60 * 1000;
    await saveSession({ id: "old", instrumentId: "x", gender: "m", responses: {}, currentIndex: 0 }, 1);
    await saveSession({ id: "new", instrumentId: "x", gender: "m", responses: {}, currentIndex: 0 }, now);
    await purgeExpiredSessions(now);
    await expect(loadSession("old")).resolves.toBeUndefined();
    await expect(loadSession("new")).resolves.toBeDefined();
  });

  it("only stores completed results when explicitly requested", async () => {
    await saveResult({ id: "r1", instrumentId: "gad-7", completedAt: 1, snapshot });
    expect(await listResults()).toHaveLength(1);
    await deleteResult("r1");
    expect(await listResults()).toHaveLength(0);
  });

  it("clears every stored result at once", async () => {
    await saveResult({ id: "r1", instrumentId: "gad-7", completedAt: 1, snapshot });
    await saveResult({ id: "r2", instrumentId: "phq-9", completedAt: 2, snapshot });
    await deleteAllResults();
    expect(await listResults()).toHaveLength(0);
  });
});
