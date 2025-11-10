-- Create app_users table for user profiles
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'personal')),
  streak INTEGER DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT,
  notes TEXT,
  count_in_ranking BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);

-- Create parties table
CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  creator_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create party_members table
CREATE TABLE IF NOT EXISTS public.party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- Create training_groups table
CREATE TABLE IF NOT EXISTS public.training_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL,
  creator_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.training_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_posts table
CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.training_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_post_likes table
CREATE TABLE IF NOT EXISTS public.group_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.group_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now()
);

-- Create loan_proposals table (for future features)
CREATE TABLE IF NOT EXISTS public.loan_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_users
CREATE POLICY "Users can view all profiles" ON public.app_users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.app_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.app_users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for check_ins
CREATE POLICY "Users can view all check-ins" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Users can insert own check-ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON public.check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own check-ins" ON public.check_ins FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for parties
CREATE POLICY "Users can view active parties" ON public.parties FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create parties" ON public.parties FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own parties" ON public.parties FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own parties" ON public.parties FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for party_members
CREATE POLICY "Users can view party members" ON public.party_members FOR SELECT USING (true);
CREATE POLICY "Users can join parties" ON public.party_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave parties" ON public.party_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for training_groups
CREATE POLICY "Users can view active groups" ON public.training_groups FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create groups" ON public.training_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Group admins can update groups" ON public.training_groups FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = training_groups.id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RLS Policies for group_members
CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for group_posts
CREATE POLICY "Users can view group posts" ON public.group_posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_posts.group_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Group members can create posts" ON public.group_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_posts.group_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own posts" ON public.group_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.group_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for group_post_likes
CREATE POLICY "Users can view likes" ON public.group_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.group_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.group_post_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view all achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- RLS Policies for loan_proposals
CREATE POLICY "Users can view own proposals" ON public.loan_proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create proposals" ON public.loan_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.generate_party_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(LEFT(MD5(RANDOM()::TEXT), 6));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_group_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(LEFT(MD5(RANDOM()::TEXT), 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.has_checked_in_today(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.check_ins
    WHERE user_id = user_uuid
    AND check_in_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_users_with_seven_or_more_checkins()
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
  GROUP BY u.id, u.name, u.email
  HAVING COUNT(c.id) >= 7
  ORDER BY check_in_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = user_uuid
    AND role IN ('admin', 'personal')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_party_member(party_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.party_members
    WHERE party_id = party_uuid
    AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.process_party_check_in(party_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is party member
  IF NOT public.is_party_member(party_uuid, user_uuid) THEN
    RETURN false;
  END IF;
  
  -- Insert check-in if not exists today
  INSERT INTO public.check_ins (user_id, check_in_date)
  VALUES (user_uuid, CURRENT_DATE)
  ON CONFLICT (user_id, check_in_date) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for app_users
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON public.check_ins(check_in_date);
CREATE INDEX IF NOT EXISTS idx_party_members_party_id ON public.party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user_id ON public.party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON public.group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_post_likes_post_id ON public.group_post_likes(post_id);