
import { supabase } from '@/integrations/supabase/client';

export const updateProfile = async (userId: string, updates: any) => {
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return { data: null, error: fetchError };
    }
    
    if (Object.keys(updates).length === 0) {
      return { data: existingProfile, error: null };
    }
    
    const { data, error } = await supabase
      .from('app_users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error updating profile:', err);
    return { data: null, error: err };
  }
};

export const getUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return { role: 'user', error };
    }
    
    return { role: data?.role || 'user', error: null };
  } catch (err) {
    console.error('Unexpected error fetching user role:', err);
    return { role: 'user', error: err };
  }
};
