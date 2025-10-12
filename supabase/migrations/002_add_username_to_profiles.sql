-- Add username to profiles with validation and case-insensitive uniqueness

-- 1) Add nullable column first to avoid breaking existing rows
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username text;

-- 2) Basic format validation (3-20 chars, letters/numbers/underscore)
DO $$ BEGIN
  ALTER TABLE profiles
  ADD CONSTRAINT username_format CHECK (
    username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,20}$'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Case-insensitive uniqueness (allows existing NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
ON profiles (LOWER(username))
WHERE username IS NOT NULL;

-- Note:
-- - Keep the column nullable to support legacy rows and staged rollout.
-- - To enforce NOT NULL later, backfill existing rows first then:
--     ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
-- - If you prefer forcing lowercase usernames, replace the CHECK with
--     CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$')
--   and normalize inputs in the app layer.

