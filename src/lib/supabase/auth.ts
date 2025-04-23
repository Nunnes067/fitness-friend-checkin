
import { supabase } from '@/integrations/supabase/client';

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching user:', error.message);
      return { user: null, error };
    }
    
    return { user: data?.user || null, error: null };
  } catch (err) {
    console.error('Unexpected error fetching user:', err);
    return { user: null, error: err };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return { data: null, error: err };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error during sign up:', err);
    return { data: null, error: err };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('Unexpected error during sign out:', err);
    return { error: err };
  }
};

export const resetPassword = async (email: string, redirectTo?: string) => {
  try {
    const options = redirectTo ? { redirectTo } : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, options);
    return { error };
  } catch (err) {
    console.error('Unexpected error during password reset:', err);
    return { error: err };
  }
};
