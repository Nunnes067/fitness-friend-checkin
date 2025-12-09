-- Create trigger function to create app_users record when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_users (id, email, name, role, streak)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'user',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also insert any existing auth users that don't have app_users records
INSERT INTO public.app_users (id, email, name, role, streak)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  'user',
  0
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.app_users WHERE id = au.id
)
ON CONFLICT (id) DO NOTHING;