-- 多时间轴模块数据库迁移
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 创建 timelines 表
CREATE TABLE IF NOT EXISTS timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timelines_world_id ON timelines(world_id);

ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'timelines' AND policyname = 'timelines_crud'
  ) THEN
    CREATE POLICY "timelines_crud" ON timelines FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'timelines'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE timelines;
  END IF;
END $$;

-- 2. timeline_events 新增 timeline_id 列
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS timeline_id UUID REFERENCES timelines(id) ON DELETE CASCADE;

-- 3. 为现有事件创建默认时间轴并关联
DO $$
DECLARE
  world_record RECORD;
  default_timeline_id UUID;
BEGIN
  FOR world_record IN SELECT DISTINCT world_id FROM timeline_events LOOP
    -- 为该世界创建默认"主线"时间轴（如果还没有）
    INSERT INTO timelines (world_id, user_id, name, sort_order)
    SELECT world_record.world_id, user_id, '主线', 0
    FROM timeline_events
    WHERE world_id = world_record.world_id
    LIMIT 1
    ON CONFLICT DO NOTHING;

    -- 获取默认时间轴 ID
    SELECT id INTO default_timeline_id
    FROM timelines
    WHERE world_id = world_record.world_id AND name = '主线'
    LIMIT 1;

    -- 更新现有事件
    UPDATE timeline_events
    SET timeline_id = default_timeline_id
    WHERE world_id = world_record.world_id AND timeline_id IS NULL;
  END LOOP;
END $$;
