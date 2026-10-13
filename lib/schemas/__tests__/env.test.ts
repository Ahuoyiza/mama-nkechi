// TODO (Activity 3): remove the .skip once envSchema is built.
import { describe, expect, it } from "vitest";
import { envSchema } from "../env";

const base = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnop.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_xxxxxxxxxxxxxxxxxxxx",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_xxxxxxxxxxxxxxxxxxxxxxxxx",
  GOOGLE_GENERATIVE_AI_API_KEY: "AIza_xxxxxxxxxxxxxxxxxxxxxxxx",
  IP_HASH_SALT: "a".repeat(64),
};

describe.skip("envSchema", () => {
  it("applies defaults", () => {
    const env = envSchema.parse(base);
    expect(env.TURNSTILE_ENABLED).toBe(false);
    expect(env.SUBMISSIONS_PER_DAY).toBe(3);
  });

  it("reads 'false' as false (z.coerce.boolean would say true)", () => {
    expect(envSchema.parse({ ...base, TURNSTILE_ENABLED: "false" }).TURNSTILE_ENABLED).toBe(false);
    expect(envSchema.parse({ ...base, TURNSTILE_ENABLED: "true", TURNSTILE_SECRET_KEY: "x" }).TURNSTILE_ENABLED).toBe(true);
  });

  it("coerces SUBMISSIONS_PER_DAY to a number", () => {
    expect(envSchema.parse({ ...base, SUBMISSIONS_PER_DAY: "5" }).SUBMISSIONS_PER_DAY).toBe(5);
  });

  it("fails fast when a required key is missing", () => {
    const { SUPABASE_SERVICE_ROLE_KEY: _drop, ...missing } = base;
    expect(envSchema.safeParse(missing).success).toBe(false);
  });

  it("rejects a dashboard link pasted in place of the project URL", () => {
    expect(envSchema.safeParse({ ...base, NEXT_PUBLIC_SUPABASE_URL: "supabase.com/dashboard/project/abc" }).success).toBe(false);
  });

  it("needs a Turnstile secret only when Turnstile is on", () => {
    expect(envSchema.safeParse({ ...base, TURNSTILE_ENABLED: "true" }).success).toBe(false);
    expect(envSchema.safeParse({ ...base, TURNSTILE_ENABLED: "true", TURNSTILE_SECRET_KEY: "" }).success).toBe(false);
    expect(envSchema.safeParse({ ...base, TURNSTILE_ENABLED: "false", TURNSTILE_SECRET_KEY: "" }).success).toBe(true);
  });
});
