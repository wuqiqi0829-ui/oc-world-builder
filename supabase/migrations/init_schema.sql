-- Auto-generated from DATABASE_SCHEMA.md
-- Base tables for OC World Builder

-- worlds
CREATE TABLE IF NOT EXISTS worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worlds_select" ON worlds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "worlds_insert" ON worlds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "worlds_update" ON worlds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "worlds_delete" ON worlds FOR DELETE USING (auth.uid() = user_id);

-- characters
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  gender TEXT,
  age TEXT,
  appearance TEXT,
  personality TEXT,
  background TEXT,
  abilities TEXT,
  weaknesses TEXT,
  catchphrase TEXT,
  occupation TEXT,
  faction TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  outfit_descriptions JSONB DEFAULT '{}'::jsonb,
  avatar_url TEXT,
  sort_order INTEGER DEFAULT 0,
  card_bg_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "characters_select" ON characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "characters_insert" ON characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "characters_update" ON characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "characters_delete" ON characters FOR DELETE USING (auth.uid() = user_id);

-- timelines
CREATE TABLE IF NOT EXISTS timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES timelines(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timelines_select" ON timelines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "timelines_insert" ON timelines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "timelines_update" ON timelines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "timelines_delete" ON timelines FOR DELETE USING (auth.uid() = user_id);

-- timeline_events
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES timelines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time_label TEXT,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_events_select" ON timeline_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "timeline_events_insert" ON timeline_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "timeline_events_update" ON timeline_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "timeline_events_delete" ON timeline_events FOR DELETE USING (auth.uid() = user_id);

-- locations
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  map_x FLOAT,
  map_y FLOAT,
  category TEXT,
  region TEXT,
  card_bg_url TEXT,
  linked_characters JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_select" ON locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "locations_insert" ON locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "locations_update" ON locations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "locations_delete" ON locations FOR DELETE USING (auth.uid() = user_id);

-- organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organizations_select" ON organizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "organizations_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "organizations_update" ON organizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "organizations_delete" ON organizations FOR DELETE USING (auth.uid() = user_id);

-- items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_select" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "items_update" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "items_delete" ON items FOR DELETE USING (auth.uid() = user_id);

-- relationships
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT,
  source_id UUID,
  target_type TEXT,
  target_id UUID,
  relation_type TEXT,
  label TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "relationships_select" ON relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "relationships_insert" ON relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "relationships_update" ON relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "relationships_delete" ON relationships FOR DELETE USING (auth.uid() = user_id);

-- storylines
CREATE TABLE IF NOT EXISTS storylines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  chapters JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE storylines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "storylines_select" ON storylines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "storylines_insert" ON storylines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "storylines_update" ON storylines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "storylines_delete" ON storylines FOR DELETE USING (auth.uid() = user_id);

-- notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  linked_module TEXT,
  linked_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_select" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (auth.uid() = user_id);

-- illustrations
CREATE TABLE IF NOT EXISTS illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "illustrations_select" ON illustrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "illustrations_insert" ON illustrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "illustrations_update" ON illustrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "illustrations_delete" ON illustrations FOR DELETE USING (auth.uid() = user_id);

-- tables
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  cards JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tables_select" ON tables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tables_insert" ON tables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tables_update" ON tables FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tables_delete" ON tables FOR DELETE USING (auth.uid() = user_id);

-- tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_update" ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tags_delete" ON tags FOR DELETE USING (auth.uid() = user_id);

-- tag_assignments
CREATE TABLE IF NOT EXISTS tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  target_type TEXT,
  target_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tag_assignments_select" ON tag_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM tags WHERE tags.id = tag_assignments.tag_id AND tags.user_id = auth.uid())
);
CREATE POLICY "tag_assignments_insert" ON tag_assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tags WHERE tags.id = tag_assignments.tag_id AND tags.user_id = auth.uid())
);
CREATE POLICY "tag_assignments_delete" ON tag_assignments FOR DELETE USING (
  EXISTS (SELECT 1 FROM tags WHERE tags.id = tag_assignments.tag_id AND tags.user_id = auth.uid())
);

-- custom_categories
CREATE TABLE IF NOT EXISTS custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_categories_select" ON custom_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "custom_categories_insert" ON custom_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "custom_categories_update" ON custom_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "custom_categories_delete" ON custom_categories FOR DELETE USING (auth.uid() = user_id);

-- custom_entries
CREATE TABLE IF NOT EXISTS custom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES custom_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  field_values JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE custom_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_entries_select" ON custom_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "custom_entries_insert" ON custom_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "custom_entries_update" ON custom_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "custom_entries_delete" ON custom_entries FOR DELETE USING (auth.uid() = user_id);

-- books
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "books_select" ON books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "books_insert" ON books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "books_update" ON books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "books_delete" ON books FOR DELETE USING (auth.uid() = user_id);

-- book_storylines
CREATE TABLE IF NOT EXISTS book_storylines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  storyline_id UUID REFERENCES storylines(id) ON DELETE CASCADE
);
ALTER TABLE book_storylines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "book_storylines_select" ON book_storylines FOR SELECT USING (
  EXISTS (SELECT 1 FROM books WHERE books.id = book_storylines.book_id AND books.user_id = auth.uid())
);
CREATE POLICY "book_storylines_insert" ON book_storylines FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM books WHERE books.id = book_storylines.book_id AND books.user_id = auth.uid())
);
CREATE POLICY "book_storylines_delete" ON book_storylines FOR DELETE USING (
  EXISTS (SELECT 1 FROM books WHERE books.id = book_storylines.book_id AND books.user_id = auth.uid())
);

-- app_data (cross-device sync)
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key, user_id)
);
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_data_select" ON app_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "app_data_insert" ON app_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_data_update" ON app_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "app_data_delete" ON app_data FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "storage_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "storage_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "storage_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid() = owner);
