import { supabase } from '@/integrations/supabase/client';

export const getDailyHistory = async (date: string) => {
  try {
    const formattedDate = typeof date === 'object' ? 
      (date as Date).toISOString().split('T')[0] : 
      date;
    
    const { data, error } = await supabase
      .from('app_users')
      .select(`
        id,
        name,
        email,
        photo_url,
        check_ins:check_ins (
          id,
          timestamp,
          photo_url
        )
      `)
      .eq('check_ins.check_in_date', formattedDate);
    
    if (error) {
      console.error('Error fetching daily history:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching daily history:', err);
    return { data: null, error: err };
  }
};

export const checkIn = async (userId: string, photoBase64: string | File | null) => {
  try {
    // Check if user already checked in today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('user_id', userId)
      .eq('check_in_date', today)
      .maybeSingle();
      
    if (existingCheckIn) {
      return { data: null, error: null, alreadyCheckedIn: true };
    }
    
    let photoUrl = null;
    
    if (photoBase64) {
      // If photoBase64 is a string (base64), process it
      if (typeof photoBase64 === 'string') {
        // Convert base64 to blob
        const base64Response = await fetch(photoBase64);
        const blob = await base64Response.blob();
        
        // Create a File object from the blob
        const file = new File([blob], `check-in-${userId}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Upload the photo
        const fileName = `check-in/${userId}/${Date.now()}.jpg`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('check-ins')
          .upload(fileName, file, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Error uploading check-in photo:', uploadError);
          // Continue without the photo if upload fails
        } else {
          const { data } = supabase.storage
            .from('check-ins')
            .getPublicUrl(fileName);
            
          photoUrl = data.publicUrl;
        }
      } else {
        // If photoBase64 is a File object, use it directly
        const fileName = `check-in/${userId}/${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('check-ins')
          .upload(fileName, photoBase64, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Error uploading check-in photo:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('check-ins')
            .getPublicUrl(fileName);
            
          photoUrl = data.publicUrl;
        }
      }
    }
    
    // Insert check-in record
    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        check_in_date: today,
        photo_url: photoUrl
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating check-in:', error);
      return { data: null, error, alreadyCheckedIn: false };
    }
    
    // Update user streak
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('streak')
      .eq('id', userId)
      .single();
      
    if (!userError) {
      await supabase
        .from('app_users')
        .update({
          last_check_in: new Date().toISOString(),
          streak: (userData?.streak || 0) + 1
        })
        .eq('id', userId);
    }
    
    return { data, error: null, alreadyCheckedIn: false };
  } catch (err) {
    console.error('Error in checkIn function:', err);
    return { data: null, error: err, alreadyCheckedIn: false };
  }
};

// Add missing getTodayCheckins function
export const getTodayCheckins = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        id,
        timestamp,
        photo_url,
        user_id,
        app_users!inner (
          id,
          name,
          email,
          photo_url
        )
      `)
      .eq('check_in_date', today)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching today checkins:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error in getTodayCheckins:', err);
    return { data: null, error: err };
  }
};

// Fix the getWeeklyRanking function to use the correct RPC function name
export const getWeeklyRanking = async () => {
  try {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Changed from 'get_weekly_checkin_count' to the supported function name
    const { data, error } = await supabase
      .rpc('get_users_with_seven_or_more_checkins', { 
        start_date: startDateStr 
      });
    
    if (error) {
      console.error('Error fetching weekly ranking:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error in getWeeklyRanking:', err);
    return { data: null, error: err };
  }
};
