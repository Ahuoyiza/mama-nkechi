import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env.client";
import type { Database } from "./database.types";

/** Browser client, used by the admin sign-in form. */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
