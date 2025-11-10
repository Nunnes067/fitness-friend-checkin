-- Add missing columns to existing tables

-- Add is_admin column to group_members
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add checked_in column to parties (for tracking check-in status)
ALTER TABLE public.parties
ADD COLUMN IF NOT EXISTS max_members INTEGER;

-- Update get_users_with_seven_or_more_checkins function to accept date parameter
CREATE OR REPLACE FUNCTION public.get_users_with_seven_or_more_checkins(start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days')
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  email TEXT,
  check_in_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(c.id) as check_in_count
  FROM public.app_users u
  LEFT JOIN public.check_ins c ON u.id = c.user_id
  WHERE c.count_in_ranking = true
    AND c.check_in_date >= start_date
  GROUP BY u.id, u.name, u.email
  HAVING COUNT(c.id) >= 7
  ORDER BY check_in_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
    AND user_id = p_user_id
    AND (role = 'admin' OR is_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update process_party_check_in to handle member arrays
CREATE OR REPLACE FUNCTION public.process_party_check_in(
  party_uuid UUID, 
  user_uuid UUID,
  p_member_ids UUID[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  member_id UUID;
BEGIN
  -- Check if user is party member
  IF NOT public.is_party_member(party_uuid, user_uuid) THEN
    RETURN false;
  END IF;
  
  -- Insert check-in for main user if not exists today
  INSERT INTO public.check_ins (user_id, check_in_date)
  VALUES (user_uuid, CURRENT_DATE)
  ON CONFLICT (user_id, check_in_date) DO NOTHING;
  
  -- Process member check-ins if provided
  IF p_member_ids IS NOT NULL THEN
    FOREACH member_id IN ARRAY p_member_ids
    LOOP
      IF public.is_party_member(party_uuid, member_id) THEN
        INSERT INTO public.check_ins (user_id, check_in_date)
        VALUES (member_id, CURRENT_DATE)
        ON CONFLICT (user_id, check_in_date) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;