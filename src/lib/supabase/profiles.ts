import { supabase } from '@/integrations/supabase/client';

export const updateProfile = async (userId: string, data: {
  name?: string;
  photo_url?: string;
  // Add any other profile fields that can be updated
}) => {
  try {
    const { error } = await supabase
      .from('app_users')
      .update(data)
      .eq('id', userId);
      
    return { error };
  } catch (err) {
    console.error('Error updating profile:', err);
    return { error: err };
  }
};

export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();
      
    return { data, error };
  } catch (err) {
    console.error('Error fetching profile:', err);
    return { data: null, error: err };
  }
};

export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
    const fileName = `profile-${userId}-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });
      
    if (uploadError) {
      console.error('Error uploading profile photo:', uploadError);
      return { data: null, error: uploadError };
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);
      
    const photoUrl = publicUrlData?.publicUrl;
    
    // Update user profile with new photo URL
    const { error: updateError } = await supabase
      .from('app_users')
      .update({ photo_url: photoUrl })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating profile with new photo:', updateError);
      return { data: null, error: updateError };
    }
    
    return { data: { photo_url: photoUrl }, error: null };
  } catch (err) {
    console.error('Unexpected error uploading profile photo:', err);
    return { data: null, error: err };
  }
};

export const updateUserSettings = async (userId: string, settings: {
  notification_preferences?: any;
  privacy_settings?: any;
  theme_preference?: string;
}) => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings
      });
      
    return { error };
  } catch (err) {
    console.error('Error updating user settings:', err);
    return { error: err };
  }
};

export const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    return { data, error };
  } catch (err) {
    console.error('Error fetching user settings:', err);
    return { data: null, error: err };
  }
};
