
import { supabase } from '@/integrations/supabase/client';

// Function to check if the current user is an admin
export const isAdmin = async (userId: string) => {
  try {
    if (!userId) return false;
    
    console.log("Checking admin status for user:", userId);
    
    const { data, error } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    console.log("Admin check result:", data);
    return data?.role === 'admin' || data?.role === 'personal';
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
      .select('id, name, email, role, created_at, is_banned')
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

// New admin functions

// Function to reset user streak
export const resetUserStreak = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .update({ streak: 0 })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Error resetting user streak:', err);
    return { data: null, error: err };
  }
};

// Function to set user streak to specific value
export const setUserStreak = async (userId: string, streakValue: number) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .update({ streak: streakValue })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Error setting user streak:', err);
    return { data: null, error: err };
  }
};

// Function to cancel a party
export const cancelAllParties = async () => {
  try {
    const { data, error } = await supabase
      .from('parties')
      .update({ is_active: false })
      .eq('is_active', true)
      .select();
    
    return { data, error };
  } catch (err) {
    console.error('Error canceling all parties:', err);
    return { data: null, error: err };
  }
};

// Function to get all active parties
export const getAllActiveParties = async () => {
  try {
    const { data, error } = await supabase
      .from('parties')
      .select(`
        id, 
        code,
        creator_id,
        created_at,
        expires_at,
        is_active,
        checked_in,
        app_users:creator_id (name, email)
      `)
      .eq('is_active', true);
    
    return { data, error };
  } catch (err) {
    console.error('Error fetching active parties:', err);
    return { data: null, error: err };
  }
};

// Function to extend a party expiration time
export const extendPartyExpiration = async (partyId: string, hoursToAdd: number = 24) => {
  try {
    const { data: currentParty, error: fetchError } = await supabase
      .from('parties')
      .select('expires_at')
      .eq('id', partyId)
      .single();
      
    if (fetchError || !currentParty) {
      return { data: null, error: fetchError || new Error('Party not found') };
    }
    
    // Calculate new expiration time
    const currentExpiry = new Date(currentParty.expires_at);
    const newExpiry = new Date(currentExpiry.getTime() + (hoursToAdd * 60 * 60 * 1000));
    
    const { data, error } = await supabase
      .from('parties')
      .update({ expires_at: newExpiry.toISOString() })
      .eq('id', partyId)
      .select();
    
    return { data, error };
  } catch (err) {
    console.error('Error extending party expiration:', err);
    return { data: null, error: err };
  }
};

// Function to get all check-ins for a specific date
export const getCheckInsByDate = async (checkInDate: string) => {
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        id, 
        user_id,
        check_in_date,
        timestamp,
        photo_url,
        app_users:user_id (name, email)
      `)
      .eq('check_in_date', checkInDate);
    
    return { data, error };
  } catch (err) {
    console.error('Error fetching check-ins by date:', err);
    return { data: null, error: err };
  }
};
