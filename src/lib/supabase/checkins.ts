
import { supabase } from '@/integrations/supabase/client';

export const checkIn = async (userId: string, photoFile?: File) => {
  try {
    const now = new Date();
    const checkInDate = now.toISOString().split('T')[0];
    
    // Check if user already checked in today
    const { data: existingCheckIn, error: checkError } = await supabase
      .from('check_ins')
      .select('id')
      .eq('user_id', userId)
      .eq('check_in_date', checkInDate)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing check-in:', checkError);
      return { data: null, error: checkError };
    }
    
    if (existingCheckIn) {
      return { 
        data: null, 
        error: { message: 'Você já fez check-in hoje' },
        alreadyCheckedIn: true
      };
    }
    
    let photoUrl = null;
    
    // Upload photo if provided
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('check-ins')
        .upload(fileName, photoFile);
        
      if (uploadError) {
        console.error('Error uploading check-in photo:', uploadError);
        // Continue with check-in even if photo upload fails
      } else {
        const { data: urlData } = supabase.storage
          .from('check-ins')
          .getPublicUrl(fileName);
          
        photoUrl = urlData.publicUrl;
      }
    }
    
    // Create check-in record
    const { data: checkInData, error: insertError } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        check_in_date: checkInDate,
        timestamp: now.toISOString(),
        photo_url: photoUrl
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating check-in:', insertError);
      return { data: null, error: insertError };
    }
    
    // Update user streak in app_users table
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('streak, last_check_in')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      // Continue even if we can't get user data
    } else {
      let newStreak = 1;
      
      // If user has a previous check-in, calculate streak
      if (userData.last_check_in) {
        const lastCheckIn = new Date(userData.last_check_in);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last check-in was yesterday, increment streak
        if (lastCheckIn.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          newStreak = (userData.streak || 0) + 1;
        }
      }
      
      const { error: updateError } = await supabase
        .from('app_users')
        .update({
          streak: newStreak,
          last_check_in: checkInDate
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user streak:', updateError);
      }
    }
    
    return { data: checkInData, error: null };
  } catch (err) {
    console.error('Error during check-in:', err);
    return { data: null, error: err };
  }
};

export const getDailyHistory = async (userId: string, days: number = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .gte('check_in_date', startDate.toISOString().split('T')[0])
      .lte('check_in_date', endDate.toISOString().split('T')[0])
      .order('check_in_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching check-in history:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching check-in history:', err);
    return { data: null, error: err };
  }
};

export const getWeeklyRanking = async (startDate?: Date) => {
  try {
    if (!startDate) {
      // Default to beginning of current week
      startDate = new Date();
      const day = startDate.getDay() || 7; // Convert Sunday (0) to 7
      const diff = startDate.getDate() - day + 1; // Adjust to Monday
      startDate = new Date(startDate.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    }
    
    const { data, error } = await supabase.rpc(
      'get_users_with_seven_or_more_checkins',
      { start_date: startDate.toISOString().split('T')[0] }
    );
    
    if (error) {
      console.error('Error fetching weekly ranking:', error);
      return { data: null, error };
    }
    
    // Sort users by check-in count (descending)
    const sortedData = data ? [...data].sort((a, b) => b.count - a.count) : [];
    
    return { data: sortedData, error: null };
  } catch (err) {
    console.error('Error fetching weekly ranking:', err);
    return { data: null, error: err };
  }
};

export const getTodayCheckins = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        id,
        check_in_date,
        timestamp,
        photo_url,
        app_users:user_id (
          id,
          name,
          email,
          photo_url,
          streak
        )
      `)
      .eq('check_in_date', today)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error('Error fetching today\'s check-ins:', error);
      return { data: null, error };
    }
    
    const formattedData = data.map(checkin => ({
      id: checkin.id,
      check_in_date: checkin.check_in_date,
      timestamp: checkin.timestamp,
      photo_url: checkin.photo_url,
      user: checkin.app_users
    }));
    
    return { data: formattedData, error: null };
  } catch (err) {
    console.error('Error fetching today\'s check-ins:', err);
    return { data: null, error: err };
  }
};
