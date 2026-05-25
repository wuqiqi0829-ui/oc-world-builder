-- Share token for read-only public access
ALTER TABLE worlds ADD COLUMN IF NOT EXISTS share_token text UNIQUE;
ALTER TABLE worlds ADD COLUMN IF NOT EXISTS share_enabled boolean NOT NULL DEFAULT false;

-- Allow anyone to read shared worlds
DROP POLICY IF EXISTS "Anyone can read shared worlds" ON worlds;
CREATE POLICY "Anyone can read shared worlds" ON worlds
  FOR SELECT USING (share_enabled = true);

-- Function to check if world is shared (bypasses RLS)
CREATE OR REPLACE FUNCTION is_world_shared(wid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(SELECT 1 FROM worlds WHERE id = wid AND share_enabled = true);
$$;

-- Allow public read on shared worlds' data
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['characters','timeline_events','locations','relationships','storylines','items','illustrations','tables','notes','custom_categories','organizations']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read shared" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Public read shared" ON %I FOR SELECT USING (is_world_shared(world_id))', tbl);
  END LOOP;
END $$;
