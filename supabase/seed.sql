-- Seed data: the three launch recipes (copy word for word from the reference design)
-- and three fake pending submissions so the admin screens have something to show in class.
-- Run with: npx supabase db push --include-seed   (remote)   or   npx supabase db reset   (local)

insert into public.recipes
  (slug, title, description, tag, category, effort, total_minutes, serves, ingredients, steps, allergens,
   image_path, card_colour, image_style, published, published_at, created_at)
values
  ('party-jollof-rice', 'Party Jollof Rice', 'Smoky, rich, and always the life of the party. Don''t forget the dodo!', 'THE PARTY FAVOURITE', 'rice', 'medium', 60, 4,
   '[{"text":"3 cups long-grain parboiled rice, rinsed"},{"text":"4 tomatoes, 2 red bell peppers & 1 scotch bonnet"},{"text":"2 onions, divided"},{"text":"⅓ cup vegetable oil & 3 tbsp tomato paste"},{"text":"4 cups chicken stock, plus more if needed"},{"text":"1 tsp each thyme & curry powder, 2 bay leaves"},{"text":"Salt to taste; chicken and fried plantain to serve"}]'::jsonb,
   '[{"text":"Blend the tomatoes, peppers and one onion until smooth. Slice the remaining onion."},{"text":"Heat the oil in a heavy pot. Soften the sliced onion, then fry the tomato paste for 5 minutes."},{"text":"Add the blended peppers and cook for 15–20 minutes, stirring, until the sauce thickens and the oil separates."},{"text":"Stir in the stock, thyme, curry, bay leaves and salt. Add the rinsed rice and bring to a gentle simmer."},{"text":"Cover tightly and cook on low for 25–35 minutes until tender. Add a little stock if needed. Rest covered for 10 minutes, fluff, and serve with chicken and dodo."}]'::jsonb,
   '{}'::text[], '/images/jollof-rice.png', 'peach', 'illustration', true, now() - interval '3 days', now() - interval '3 days'),
  ('egusi-and-pounded-yam', 'Egusi & Pounded Yam', 'A hearty bowl of goodness, made for dipping, sharing, and second helpings.', 'COMFORT IN A BOWL', 'soups_stews', 'involved', 50, 4,
   '[{"text":"2 cups ground egusi (melon seeds)"},{"text":"500 g beef, cut into pieces"},{"text":"1 smoked fish, deboned"},{"text":"¼ cup palm oil"},{"text":"1 onion & 1 scotch bonnet, blended"},{"text":"2 tbsp ground crayfish"},{"text":"3 cups beef stock & 3 cups chopped ugu or spinach"},{"text":"Salt to taste; prepared pounded yam to serve"}]'::jsonb,
   '[{"text":"Simmer beef with salt and a little onion until tender; reserve the cooking stock. This can be prepared ahead."},{"text":"Warm palm oil in a pot. Add the blended onion and pepper and cook for 5 minutes."},{"text":"Mix the egusi with a splash of water to form a thick paste. Spoon into the pot and let the clumps set for 5 minutes."},{"text":"Add stock, beef, smoked fish and crayfish. Simmer gently for 20 minutes, stirring occasionally."},{"text":"Fold in the washed greens and simmer for another 5 minutes. Season to taste and serve with pounded yam. Time excludes preparing the beef and yam."}]'::jsonb,
   array['fish', 'shellfish']::text[], '/images/egusi.png', 'yellow', 'illustration', true, now() - interval '2 days', now() - interval '2 days'),
  ('suya-and-sweet-dodo', 'Suya & Sweet Dodo', 'Spicy street-food magic meets golden plantain. One skewer is never enough.', 'SMALL CHOPS, BIG JOY', 'small_chops', 'easy', 35, 4,
   '[{"text":"500 g beef, sliced very thinly"},{"text":"3 tbsp suya spice (yaji; usually contains peanuts)"},{"text":"2 tbsp vegetable oil, plus oil for frying"},{"text":"2 ripe plantains"},{"text":"1 red onion & 2 tomatoes, sliced"},{"text":"Salt to taste & wooden skewers"}]'::jsonb,
   '[{"text":"Soak wooden skewers in water for 30 minutes. Coat the thin beef slices in oil, salt and suya spice."},{"text":"Thread the beef onto the skewers and arrange on a lined tray."},{"text":"Grill under a hot grill or on a barbecue, turning regularly, for 10–15 minutes until cooked through and lightly charred."},{"text":"Peel and slice the plantains diagonally. Fry in hot oil until golden on both sides, then drain."},{"text":"Serve the suya with dodo, sliced onions and tomatoes, and a little extra yaji. Check the spice blend for peanut allergens."}]'::jsonb,
   array['peanuts']::text[], '/images/suya.png', 'herb', 'illustration', true, now() - interval '1 days', now() - interval '1 days')
on conflict (slug) do nothing;


-- Fake pending submissions (fake people, @example.com addresses).
-- Their images are copies of the seed art, uploaded to the private bucket by
-- `npm run seed:images`. Each one is a teaching moment:
--   1. Ẹ̀fọ́ Rírò: tonal marks in the title, crayfish and stockfish in the
--      ingredients but no allergens ticked, and a phone number typed into a step
--      (watch redact() replace it before the AI sees it).
--   2. Puff-Puff: tidy and ready.
--   3. Zobo: a cooking time that doesn't add up (chilling overnight vs 20 mins).
insert into public.recipe_submissions
  (title, description, category, effort, total_minutes, serves, ingredients, steps, allergens, image_path,
   submitter_name, submitter_email, submitter_phone, credit_name, consent_publish, consent_privacy, ip_hash, created_at)
values
  ('Ẹ̀fọ́ Rírò', 'My grandmother''s rich Yoruba spinach stew, loaded with assorted meat and stockfish.', 'soups_stews', 'involved', 75, 6,
   '[{"text":"1 kg spinach (efo shoko), washed and chopped"},{"text":"500 g assorted meat, boiled"},{"text":"1 piece stockfish, soaked"},{"text":"3 tbsp ground crayfish"},{"text":"2 tbsp iru (locust beans)"},{"text":"½ cup palm oil"},{"text":"6 tatashe, 3 scotch bonnets and 2 onions, blended"}]'::jsonb,
   '[{"text":"Boil the blended peppers until most of the water is gone and the sauce is thick."},{"text":"Heat the palm oil, fry the iru and a sliced onion for 2 minutes, then add the pepper sauce."},{"text":"Add the meat, stockfish and crayfish and simmer for 15 minutes. If it tastes off, call me on 0803 123 4567 and I will talk you through it."},{"text":"Stir in the squeezed spinach and cook for 3 minutes only so it stays green. Serve with pounded yam or rice."}]'::jsonb,
   '{}'::text[], 'seed/efo-riro.png',
   'Adaeze Okafor', 'adaeze.okafor@example.com', '+2348031234567', 'Mama Ada', true, true, 'seed', now() - interval '5 hours'),

  ('Puff-Puff', 'Soft, golden, slightly sweet dough balls. The first thing to finish at every party.', 'small_chops', 'easy', 90, 8,
   '[{"text":"3 cups plain flour"},{"text":"½ cup sugar"},{"text":"2 tsp instant yeast"},{"text":"½ tsp salt and a pinch of nutmeg"},{"text":"1½ cups warm water"},{"text":"Vegetable oil for deep frying"}]'::jsonb,
   '[{"text":"Mix the flour, sugar, yeast, salt and nutmeg, then stir in the warm water to make a smooth, sticky batter."},{"text":"Cover and leave somewhere warm for 1 hour until doubled and bubbly."},{"text":"Heat the oil. Scoop the batter with your hand and squeeze small balls into the oil."},{"text":"Fry, turning, until golden all over. Drain on paper and serve warm."}]'::jsonb,
   array['wheat']::text[], 'seed/puff-puff.png',
   'Tunde Bakare', 'tunde.bakare@example.com', null, 'Tunde B.', true, true, 'seed', now() - interval '1 day'),

  ('Zobo Drink', 'A deep red hibiscus drink with ginger, pineapple and cloves. Serve it ice cold.', 'drinks', 'easy', 20, 10,
   '[{"text":"2 cups dried zobo (hibiscus) leaves"},{"text":"1 pineapple, peeled (keep the peel)"},{"text":"A thumb of ginger and 6 cloves"},{"text":"Sugar or honey to taste"}]'::jsonb,
   '[{"text":"Rinse the zobo leaves and boil them with the pineapple peel, ginger and cloves for 20 minutes."},{"text":"Leave to cool, then strain and sweeten. Chill overnight in the fridge before serving."}]'::jsonb,
   '{}'::text[], 'seed/zobo.png',
   'Chiamaka Eze', 'chiamaka.eze@example.com', null, null, true, true, 'seed', now() - interval '2 days');
