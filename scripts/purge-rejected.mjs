// Deletes rejected submissions 30 days after the decision, with their photos.
// Usage: npm run purge:rejected   (run it daily or weekly; see the README)
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Deletes the rows and returns their ids and photo paths (see supabase/migrations/).
const { data: rows, error } = await supabase.rpc("purge_rejected_submissions");
if (error) throw error;

const files = rows.flatMap((row) => [row.image_path, `painted/${row.id}.png`]);
if (files.length > 0) {
  const { error: removeError } = await supabase.storage.from("submission-images").remove(files);
  if (removeError) throw removeError;
}
console.log(`Purged ${rows.length} rejected submission(s).`);
