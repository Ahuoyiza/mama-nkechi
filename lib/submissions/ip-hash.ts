import { createHash } from "node:crypto";

/**
 * We never store a submitter's IP address. We store a salted SHA-256 hash,
 * which is enough to count "how many submissions from this connection today?"
 * but can't be turned back into the address. The secret salt stops anyone
 * from hashing every possible IP to reverse it.
 */
export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip.trim()}`).digest("hex");
}

/** First address in x-forwarded-for (the client), falling back to x-real-ip. */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
