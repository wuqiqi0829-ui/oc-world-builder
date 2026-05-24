-- 为各表添加 sort_order 列以支持拖拽排序持久化
ALTER TABLE characters ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE storylines ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE custom_entries ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
