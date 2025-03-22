
import { supabase } from './supabase';

// Function to check if the current user is an admin
export const isAdmin = async (userId: string) => {
  try {
    if (!userId) return false;
    
    const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data === true;
  } catch (err) {
    console.error('Unexpected error checking admin status:', err);
    return false;
  }
};

// Function to remove a check-in by ID
export const removeCheckIn = async (checkInId: string) => {
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .delete()
      .eq('id', checkInId)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Error removing check-in:', err);
    return { data: null, error: err };
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
