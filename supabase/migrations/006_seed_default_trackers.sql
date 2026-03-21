insert into public.tracker_types (id, name, slug, icon, description, fields, created_by) values
(
  'a0000000-0000-0000-0000-000000000001',
  'Coffee',
  'coffee',
  '☕',
  'Track your coffee experiences — roasters, brew methods, and favorites.',
  '[
    {"key": "roaster", "label": "Roaster", "type": "text", "required": false},
    {"key": "origin", "label": "Origin", "type": "text", "required": false},
    {"key": "brew_method", "label": "Brew Method", "type": "dropdown", "required": false, "options": ["Pour Over", "Espresso", "French Press", "AeroPress", "Cold Brew", "Drip", "Moka Pot"]},
    {"key": "rating", "label": "Rating", "type": "rating", "required": false},
    {"key": "photo", "label": "Photo", "type": "image", "required": false},
    {"key": "price", "label": "Price", "type": "price", "required": false},
    {"key": "tags", "label": "Tags", "type": "tags", "required": false}
  ]'::jsonb,
  null
),
(
  'a0000000-0000-0000-0000-000000000002',
  'Books',
  'books',
  '📚',
  'Track books you have read or want to read.',
  '[
    {"key": "author", "label": "Author", "type": "text", "required": true},
    {"key": "genre", "label": "Genre", "type": "dropdown", "required": false, "options": ["Fiction", "Non-Fiction", "Sci-Fi", "Fantasy", "Mystery", "Biography", "Self-Help", "Technical", "History", "Philosophy"]},
    {"key": "rating", "label": "Rating", "type": "rating", "required": false},
    {"key": "date_finished", "label": "Date Finished", "type": "date", "required": false},
    {"key": "review", "label": "Review", "type": "long_text", "required": false},
    {"key": "cover", "label": "Cover Image", "type": "image", "required": false},
    {"key": "tags", "label": "Tags", "type": "tags", "required": false}
  ]'::jsonb,
  null
),
(
  'a0000000-0000-0000-0000-000000000003',
  'Recipes',
  'recipes',
  '🍳',
  'Track recipes you have cooked or want to try.',
  '[
    {"key": "cuisine", "label": "Cuisine", "type": "dropdown", "required": false, "options": ["Italian", "Mexican", "Indian", "Chinese", "Japanese", "Thai", "French", "American", "Mediterranean", "Korean"]},
    {"key": "prep_time", "label": "Prep Time", "type": "duration", "required": false},
    {"key": "cook_time", "label": "Cook Time", "type": "duration", "required": false},
    {"key": "difficulty", "label": "Difficulty", "type": "dropdown", "required": false, "options": ["Easy", "Medium", "Hard"]},
    {"key": "rating", "label": "Rating", "type": "rating", "required": false},
    {"key": "photo", "label": "Photo", "type": "image", "required": false},
    {"key": "recipe_url", "label": "Recipe URL", "type": "url", "required": false},
    {"key": "tags", "label": "Tags", "type": "tags", "required": false}
  ]'::jsonb,
  null
);
