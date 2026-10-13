import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env.client";
import type { Database } from "./database.types";

/**
 * Anonymous client with no cookies, for public reads (published recipes).
 * Because it doesn't touch cookies, its results can be cached with "use cache".
 * RLS only lets it see rows where published = true.
 */
export function createPublicClient() {
  return createClient<Database>(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
