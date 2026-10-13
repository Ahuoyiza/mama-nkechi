// Uploads placeholder images for the fake submissions in supabase/seed.sql
// into the private submission-images bucket.
// Usage: npm run seed:images
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const uploads = {
  "seed/efo-riro.png": "public/images/egusi.png",
  "seed/puff-puff.png": "public/images/suya.png",
  "seed/zobo.png": "public/images/jollof-rice.png",
};

for (const [path, file] of Object.entries(uploads)) {
  const { error } = await supabase.storage
    .from("submission-images")
    .upload(path, await readFile(file), { contentType: "image/png", upsert: true });
  if (error) throw error;
  console.log(`uploaded ${path}`);
}
