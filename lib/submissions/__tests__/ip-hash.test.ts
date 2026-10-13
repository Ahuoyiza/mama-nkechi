import { describe, expect, it } from "vitest";
import { clientIpFrom, hashIp } from "../ip-hash";

describe("hashIp", () => {
  it("is stable for the same IP and salt", () => {
    expect(hashIp("102.89.1.1", "salt")).toBe(hashIp("102.89.1.1", "salt"));
  });

  it("changes with the salt, so the hash can't be looked up in a table", () => {
    expect(hashIp("102.89.1.1", "salt-a")).not.toBe(hashIp("102.89.1.1", "salt-b"));
  });

  it("never contains the IP itself", () => {
    const hash = hashIp("102.89.1.1", "salt");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain("102.89");
  });
});

describe("clientIpFrom", () => {
  it("takes the first x-forwarded-for address", () => {
    expect(clientIpFrom(new Headers({ "x-forwarded-for": "102.89.1.1, 10.0.0.1" }))).toBe("102.89.1.1");
  });
  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(clientIpFrom(new Headers({ "x-real-ip": "41.58.0.9" }))).toBe("41.58.0.9");
    expect(clientIpFrom(new Headers())).toBe("unknown");
  });
});
