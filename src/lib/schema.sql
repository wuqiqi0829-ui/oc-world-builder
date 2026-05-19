-- OC World Builder 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此文件

-- 启用 uuid 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 世界观
-- ============================================
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_url TEXT,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worlds_select" ON worlds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "worlds_insert" ON worlds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "worlds_update" ON worlds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "worlds_delete" ON worlds FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 人物
-- ============================================
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  age TEXT DEFAULT '',
  appearance TEXT DEFAULT '',
  personality TEXT DEFAULT '',
  background TEXT DEFAULT '',
  abilities TEXT DEFAULT '',
  weaknesses TEXT DEFAULT '',
  catchphrase TEXT DEFAULT '',
  occupation TEXT DEFAULT '',
  faction TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "characters_select" ON characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "characters_insert" ON characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "characters_update" ON characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "characters_delete" ON characters FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 时间线事件
-- ============================================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time_label TEXT DEFAULT '',
  description TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  collapsed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_select" ON timeline_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "timeline_insert" ON timeline_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "timeline_update" ON timeline_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "timeline_delete" ON timeline_events FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 地点（地图标记）
-- ============================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  map_x REAL DEFAULT 50,
  map_y REAL DEFAULT 50,
  category TEXT DEFAULT '',
  region TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_select" ON locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "locations_insert" ON locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "locations_update" ON locations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "locations_delete" ON locations FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 组织/势力
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT '',
  description TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_select" ON organizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "orgs_delete" ON organizations FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 物品
-- ============================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  attributes JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_select" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "items_update" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "items_delete" ON items FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 关系
-- ============================================
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'other',
  label TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rel_select" ON relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rel_insert" ON relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rel_update" ON relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rel_delete" ON relationships FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 标签
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#7C5CBF',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_update" ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tags_delete" ON tags FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 标签关联
-- ============================================
CREATE TABLE tag_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  UNIQUE(tag_id, target_type, target_id)
);

ALTER TABLE tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tagass_select" ON tag_assignments FOR SELECT
  USING (EXISTS (SELECT 1 FROM tags WHERE tags.id = tag_id AND tags.user_id = auth.uid()));
CREATE POLICY "tagass_insert" ON tag_assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tags WHERE tags.id = tag_id AND tags.user_id = auth.uid())
);
CREATE POLICY "tagass_delete" ON tag_assignments FOR DELETE USING (
  EXISTS (SELECT 1 FROM tags WHERE tags.id = tag_id AND tags.user_id = auth.uid())
);

-- ============================================
-- 主线剧情
-- ============================================
CREATE TABLE storylines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  chapters JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE storylines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_select" ON storylines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "story_insert" ON storylines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "story_update" ON storylines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "story_delete" ON storylines FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 灵感速记
-- ============================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  linked_module TEXT DEFAULT '',
  linked_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_select" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 自定义分类模板
-- ============================================
CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ccat_select" ON custom_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ccat_insert" ON custom_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ccat_update" ON custom_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ccat_delete" ON custom_categories FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 自定义分类条目
-- ============================================
CREATE TABLE custom_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES custom_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  field_values JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE custom_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cent_select" ON custom_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cent_insert" ON custom_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cent_update" ON custom_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cent_delete" ON custom_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 自动更新 updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END $$;
