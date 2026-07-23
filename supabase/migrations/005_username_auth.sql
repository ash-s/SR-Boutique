-- Username & auth provider for Gmail / phone login
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recovery_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'user'
  );
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  IF length(base_username) < 3 THEN
    base_username := 'user';
  END IF;
  base_username := left(base_username, 30);

  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := left(base_username, 28) || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, full_name, phone, username, recovery_email, auth_provider, role)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      final_username
    ),
    COALESCE(NEW.phone, NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '')),
    final_username,
    CASE
      WHEN NEW.raw_user_meta_data->>'auth_provider' = 'phone' THEN NULLIF(TRIM(NEW.raw_user_meta_data->>'recovery_email'), '')
      WHEN NEW.email IS NOT NULL THEN NEW.email
      ELSE NULL
    END,
    CASE
      WHEN (NEW.raw_app_meta_data->>'provider') = 'google' THEN 'google'
      WHEN NEW.raw_user_meta_data->>'auth_provider' = 'phone' THEN 'phone'
      ELSE COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'auth_provider'), ''), 'email')
    END,
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow username lookup for login (phone -> email mapping via API uses service role)
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles (phone);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
