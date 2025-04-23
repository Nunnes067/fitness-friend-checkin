
import { supabase } from '@/integrations/supabase/client';

export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching profile:', err);
    return { data: null, error: err };
  }
};

export const updateProfile = async (userId: string, updates: {
  name?: string;
  photo_url?: string;
  role?: string;
  is_banned?: boolean;
}) => {
  try {
    const { error } = await supabase
      .from('app_users')
      .update(updates)
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Error updating profile:', err);
    return { error: err };
  }
};

export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading profile photo:', uploadError);
      return { url: null, error: uploadError };
    }
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    if (!urlData?.publicUrl) {
      return { url: null, error: { message: 'Could not get public URL for uploaded file' } };
    }
    
    // Update user profile with new photo URL
    const { error: updateError } = await supabase
      .from('app_users')
      .update({ photo_url: urlData.publicUrl })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating profile with new photo URL:', updateError);
      return { url: urlData.publicUrl, error: updateError };
    }
    
    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Error uploading profile photo:', err);
    return { url: null, error: err };
  }
};
