// Adds an existing Supabase Auth user to public.admins.
// Usage: npm run make-admin -- you@example.com
// Create the user first in Supabase > Authentication > Users.
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- you@example.com");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;

const user = data.users.find((u) => u.email?.toLowerCase() === email);
if (!user) {
  console.error(`No auth user with email ${email}. Create it in the Supabase dashboard first.`);
  process.exit(1);
}

const { error: insertError } = await supabase.from("admins").upsert({ user_id: user.id });
if (insertError) throw insertError;
console.log(`${email} is now an admin.`);
