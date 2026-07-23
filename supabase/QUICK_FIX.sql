-- QUICK FIX for SR Boutique — paste ALL of this in Supabase SQL Editor and Run
-- File: supabase/QUICK_FIX.sql

-- (Copy contents from 006_fix_permissions.sql, then run admin lines below)

-- After running 006_fix_permissions.sql, run these two lines:

UPDATE profiles SET role = 'admin' WHERE id = 'af226d0f-5b5c-4641-876d-2aa36cd0da66';

INSERT INTO profiles (id, full_name, role, username)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'admin', split_part(email, '@', 1)
FROM auth.users
WHERE id = 'af226d0f-5b5c-4641-876d-2aa36cd0da66'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
