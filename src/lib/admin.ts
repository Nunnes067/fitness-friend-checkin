
import { supabase } from '@/integrations/supabase/client';

// Function to check if the current user is an admin
export const isAdmin = async (userId: string) => {
  try {
    if (!userId) return false;
    
    const { data, error } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (err) {
    console.error('Unexpected error checking admin status:', err);
    return false;
  }
};

// Function to remove a check-in by ID
export const removeCheckIn = async (checkInId: string) => {
  try {
    const { error } = await supabase
      .from('check_ins')
      .delete()
      .eq('id', checkInId);
    
    return { error };
  } catch (err) {
    console.error('Error removing check-in:', err);
    return { error: err };
  }
};

// Function to remove all check-ins for a user
export const removeAllUserCheckIns = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .delete()
      .eq('user_id', userId)
      .select();
    
    return { data, error };
  } catch (err) {
    console.error('Error removing all user check-ins:', err);
    return { data: null, error: err };
  }
};

// Function to remove all check-ins from today
export const removeAllTodayCheckIns = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .delete()
      .eq('check_in_date', today)
      .select();
    
    return { data, error };
  } catch (err) {
    console.error('Error removing all today check-ins:', err);
    return { data: null, error: err };
  }
};

// Function to get all users
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, name, email, role, created_at')
      .order('name');
    
    return { data, error };
  } catch (err) {
    console.error('Error fetching users:', err);
    return { data: null, error: err };
  }
};

// Function to set a user's admin status
export const setUserAdminStatus = async (userId: string, isAdmin: boolean) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .update({ role: isAdmin ? 'admin' : 'user' })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Error updating user admin status:', err);
    return { data: null, error: err };
  }
};

// Function to ban a user (set as inactive)
export const banUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .update({ is_banned: true })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Error banning user:', err);
    return { data: null, error: err };
  }
};

// Function to unban a user
export const unbanUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .update({ is_banned: false })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Error unbanning user:', err);
    return { data: null, error: err };
  }
};

// Function to remove a check-in from weekly ranking
export const removeCheckInFromRanking = async (checkInId: string) => {
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .update({ count_in_ranking: false })
      .eq('id', checkInId)
      .select();
    
    return { data, error };
  } catch (err) {
    console.error('Error removing check-in from ranking:', err);
    return { data: null, error: err };
  }
};

// Function to add achievement to a user
export const addAchievementToUser = async (userId: string, achievementId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        awarded_at: new Date().toISOString()
      })
      .select();
    
    return { data, error };
  } catch (err) {
    console.error('Error adding achievement to user:', err);
    return { data: null, error: err };
  }
};

// Function to get users eligible for the prize wheel (7+ check-ins)
export const getEligibleForPrizeWheel = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .rpc('get_users_with_seven_or_more_checkins', { 
        start_date: dateStr 
      });
    
    return { data, error };
  } catch (err) {
    console.error('Error fetching eligible users for prize wheel:', err);
    return { data: null, error: err };
  }
};

// Function to run prize wheel draw
export const runPrizeWheelDraw = async () => {
  try {
    const { data: eligibleUsers, error: eligibleError } = await getEligibleForPrizeWheel();
    
    if (eligibleError || !eligibleUsers || eligibleUsers.length === 0) {
      return { 
        winner: null, 
        error: eligibleError || new Error('No eligible users found'),
        eligibleCount: 0
      };
    }
    
    // Select a random winner from eligible users
    const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
    const winner = eligibleUsers[randomIndex];
    
    return { 
      winner, 
      error: null,
      eligibleCount: eligibleUsers.length
    };
  } catch (err) {
    console.error('Error running prize wheel draw:', err);
    return { 
      winner: null, 
      error: err,
      eligibleCount: 0
    };
  }
};
