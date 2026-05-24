-- 插图集模块数据库迁移
-- 请在 Supabase Dashboard → SQL Editor 中执行此脚本

CREATE TABLE IF NOT EXISTS illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_characters JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_timeline_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_storylines JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_illustrations_world_id ON illustrations(world_id);

-- RLS 策略
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'illustrations' AND policyname = 'illustrations_crud'
  ) THEN
    CREATE POLICY "illustrations_crud" ON illustrations FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 实时同步
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'illustrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE illustrations;
  END IF;
END $$;
