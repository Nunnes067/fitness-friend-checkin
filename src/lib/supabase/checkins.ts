
import { supabase } from '@/integrations/supabase/client';

export const checkIn = async (userId: string, photoUrl?: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCheckIn, error: checkError } = await supabase
      .from('check_ins')
      .select('id')
      .eq('user_id', userId)
      .eq('check_in_date', today)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing check-in:', checkError);
      return { data: null, error: checkError, alreadyCheckedIn: false };
    }
    
    if (existingCheckIn) {
      return { data: null, error: null, alreadyCheckedIn: true };
    }
    
    let photoUrlToStore = null;
    if (photoUrl) {
      if (photoUrl.startsWith('data:')) {
        const fileName = `check-in-${userId}-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('check-ins')
          .upload(fileName, photoUrl, {
            contentType: 'image/jpeg',
            upsert: true,
          });
        
        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('check-ins')
            .getPublicUrl(fileName);
          
          photoUrlToStore = publicUrlData?.publicUrl;
        }
      } else {
        photoUrlToStore = photoUrl;
      }
    }
    
    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        check_in_date: today,
        timestamp: new Date().toISOString(),
        photo_url: photoUrlToStore,
      })
      .select()
      .single();
    
    if (!error) {
      const { data: userData } = await supabase
        .from('app_users')
        .select('streak')
        .eq('id', userId)
        .single();
      
      await supabase
        .from('app_users')
        .update({
          last_check_in: new Date().toISOString(),
          streak: (userData?.streak || 0) + 1
        })
        .eq('id', userId);
    }
    
    return { data, error, alreadyCheckedIn: false };
  } catch (err) {
    console.error('Unexpected error during check-in:', err);
    return { data: null, error: err, alreadyCheckedIn: false };
  }
};

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
        app_users (
          id,
          name,
          email,
          photo_url
        )
      `)
      .eq('check_in_date', today)
      .order('timestamp', { ascending: false });
    
    return { data, error };
  } catch (err) {
    console.error('Error fetching today check-ins:', err);
    return { data: null, error: err };
  }
};

export const getWeeklyRanking = async () => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        user_id,
        app_users (
          id,
          name,
          email,
          photo_url
        )
      `)
      .gte('timestamp', sevenDaysAgo.toISOString())
      .lte('timestamp', now.toISOString());
    
    if (error) {
      console.error('Error fetching weekly ranking:', error);
      return { data: null, error };
    }
    
    const userCounts: Record<string, any> = {};
    data?.forEach(checkIn => {
      const userId = checkIn.user_id;
      if (!userCounts[userId]) {
        userCounts[userId] = {
          userId,
          count: 0,
          profile: checkIn.app_users
        };
      }
      userCounts[userId].count++;
    });
    
    const ranking = Object.values(userCounts).sort((a, b) => b.count - a.count);
    
    return { data: ranking, error: null };
  } catch (err) {
    console.error('Unexpected error fetching weekly ranking:', err);
    return { data: null, error: err };
  }
};

export const getDailyHistory = async (date: Date) => {
  try {
    const dateString = date.toISOString().split('T')[0];
    
    const { data: users, error: usersError } = await supabase
      .from('app_users')
      .select('id, name, email, photo_url')
      .order('name');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { data: null, error: usersError };
    }
    
    const { data: checkIns, error: checkInsError } = await supabase
      .from('check_ins')
      .select('id, user_id, timestamp, photo_url')
      .eq('check_in_date', dateString);
    
    if (checkInsError) {
      console.error('Error fetching check-ins:', checkInsError);
      return { data: null, error: checkInsError };
    }
    
    const checkInMap: Record<string, any> = {};
    checkIns?.forEach(checkIn => {
      checkInMap[checkIn.user_id] = checkIn;
    });
    
    const result = users?.map(user => ({
      ...user,
      check_in: checkInMap[user.id] || null
    }));
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Unexpected error fetching daily history:', err);
    return { data: null, error: err };
  }
};
