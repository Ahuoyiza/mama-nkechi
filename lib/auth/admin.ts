import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns the signed-in admin, or null.
 *
 * The proxy only checks that someone is signed in. EVERY admin page, server
 * action and API route calls this as well, because the proxy can be bypassed
 * or misconfigured, and being signed in isn't the same as being an admin.
 */
export async function getAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return null;

  return { supabase, user };
}

/** For pages and server actions: send non-admins to the sign-in page. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
