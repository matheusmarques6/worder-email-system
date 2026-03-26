CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  invite_token TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(store_id, email)
);

ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Policy: users can see members of stores they belong to
CREATE POLICY "Users can view store members" ON store_users
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_users WHERE user_id = auth.uid()
    )
  );

-- Policy: owners and admins can manage members
CREATE POLICY "Owners and admins can manage members" ON store_users
  FOR ALL
  USING (
    store_id IN (
      SELECT store_id FROM store_users
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
