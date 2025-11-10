-- Add photo_url column to app_users table
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS photo_url TEXT;