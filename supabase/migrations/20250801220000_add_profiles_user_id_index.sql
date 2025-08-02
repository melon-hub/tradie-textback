-- Add index on profiles.user_id for faster lookups
-- This improves the performance of profile queries which are frequently used
-- especially during authentication and admin checks

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- This index will significantly speed up queries like:
-- SELECT * FROM profiles WHERE user_id = $1