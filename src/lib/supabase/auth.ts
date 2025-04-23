
import { supabase } from '@/integrations/supabase/client';

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);
    return { user: null, error: err };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in with email:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in signInWithEmail:', err);
    return { data: null, error: err };
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (error) {
      console.error('Error signing up with email:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in signUpWithEmail:', err);
    return { data: null, error: err };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error in signOut:', err);
    return { error: err };
  }
};
