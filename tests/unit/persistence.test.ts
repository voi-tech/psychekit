import { describe, expect, it, beforeEach } from "vitest";
import { db, saveSession, loadSession, saveResult, listResults, deleteResult, purgeExpiredSessions } from "@/infrastructure/db/database";

describe("local persistence", () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.results.clear();
  });

  it("saves and resumes an in-progress session", async () => {
    await saveSession({ id: "s1", instrumentId: "ipip-bfm-20", responses: { q1: "a" }, currentIndex: 1, createdAt: 1, updatedAt: 2 });
    await expect(loadSession("s1")).resolves.toMatchObject({ currentIndex: 1 });
  });

  it("purges sessions older than seven days", async () => {
    const now = 10 * 24 * 60 * 60 * 1000;
    await saveSession({ id: "old", instrumentId: "x", responses: {}, currentIndex: 0, createdAt: 1, updatedAt: 1 });
    await saveSession({ id: "new", instrumentId: "x", responses: {}, currentIndex: 0, createdAt: now, updatedAt: now });
    await purgeExpiredSessions(now);
    await expect(loadSession("old")).resolves.toBeUndefined();
    await expect(loadSession("new")).resolves.toBeDefined();
  });

  it("only stores completed results when explicitly requested", async () => {
    await saveResult({ id: "r1", instrumentId: "x", completedAt: 1, snapshot: { score: 4 } });
    expect(await listResults()).toHaveLength(1);
    await deleteResult("r1");
    expect(await listResults()).toHaveLength(0);
  });
});
