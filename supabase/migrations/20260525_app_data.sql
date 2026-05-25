-- Cross-device sync: stores map images, graph positions, timeline data, settings
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key, user_id)
);

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own app_data" ON app_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own app_data" ON app_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own app_data" ON app_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own app_data" ON app_data
  FOR DELETE USING (auth.uid() = user_id);
