import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Service-role client. It BYPASSES Row Level Security, so only use it after
 * validating input on the server (public submissions) or confirming the
 * caller is an admin. Never import this from a client component.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
