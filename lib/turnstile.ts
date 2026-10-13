import "server-only";
import { env } from "@/lib/env";

/** Checks a Cloudflare Turnstile token. Only called when TURNSTILE_ENABLED=true. */
export async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  if (!token || !env.TURNSTILE_SECRET_KEY) return false;

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip });
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
