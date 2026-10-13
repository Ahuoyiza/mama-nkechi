// TODO (Activity 4): remove the .skip once aiLogEntry() logs safely.
import { describe, expect, it } from "vitest";
import { aiLogEntry } from "../log";

const base = { route: "/api/admin/ai-review", adminId: "user-123", salt: "s".repeat(32), model: "gemini", ok: true, durationMs: 812.4 };

describe.skip("aiLogEntry", () => {
  it("logs only route, hashed admin, model, outcome, tokens and duration", () => {
    expect(Object.keys(aiLogEntry({ ...base, totalTokens: 420 })).sort()).toEqual(
      ["admin", "durationMs", "event", "model", "ok", "route", "totalTokens"].sort(),
    );
  });

  it("never contains the raw admin id", () => {
    const entry = aiLogEntry(base);
    expect(entry.admin).toMatch(/^[a-f0-9]{12}$/);
    expect(JSON.stringify(entry)).not.toContain("user-123");
  });

  it("gives the same hash for the same admin, so you can still spot patterns", () => {
    expect(aiLogEntry(base).admin).toBe(aiLogEntry(base).admin);
    expect(aiLogEntry({ ...base, adminId: "user-456" }).admin).not.toBe(aiLogEntry(base).admin);
  });
});
