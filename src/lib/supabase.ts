
import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables,
// but for this demo we'll use public keys directly
const supabaseUrl = 'https://wdnxhijcmrsnlvzcaxrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbnhoaWpjbXJzbmx2emNheHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA3OTc4MzksImV4cCI6MjAyNjM3MzgzOX0.c_t59-7dKcK0k-ZmWOuzaLT0Wq0f3SkA9rXc4kRuiS4';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
};

// Check-in functions
export const checkIn = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if user already checked in today
  const { data: existing } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today)
    .lt('created_at', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString())
    .single();
  
  if (existing) {
    return { data: existing, error: null, alreadyCheckedIn: true };
  }
  
  // Create new check-in
  const { data, error } = await supabase
    .from('checkins')
    .insert([{ user_id: userId }])
    .select()
    .single();
  
  return { data, error, alreadyCheckedIn: false };
};

export const getTodayCheckins = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('checkins')
    .select(`
      id,
      created_at,
      user_id,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .gte('created_at', today)
    .lt('created_at', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString())
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getWeeklyRanking = async () => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  
  const { data, error } = await supabase
    .from('checkins')
    .select(`
      user_id,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .gte('created_at', startOfWeek.toISOString())
    .order('created_at', { ascending: false });
  
  if (data) {
    // Count check-ins by user
    const userCheckIns = data.reduce((acc, curr) => {
      const userId = curr.user_id;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Create ranking array
    const ranking = Object.entries(userCheckIns)
      .map(([userId, count]) => {
        const userProfile = data.find(item => item.user_id === userId)?.profiles;
        return {
          userId,
          count,
          profile: userProfile
        };
      })
      .sort((a, b) => b.count - a.count);
      
    return { data: ranking, error: null };
  }
  
  return { data: null, error };
};

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};
