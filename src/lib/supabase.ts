import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
const supabaseUrl = 'https://kngnuoydsbtvoayzotbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZ251b3lkc2J0dm9heXpvdGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDA4NjAsImV4cCI6MjA1ODA3Njg2MH0.J7J9wO-jFtmz8vobnSRueELCK8fOJm9_LEzZHbKSHLA';

// Create Supabase client with explicit configuration to ensure correct behavior
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Authentication helper functions
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    console.error('Error during signup:', err);
    return { data: null, error: err };
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
    console.error('Error during signin:', err);
    return { data: null, error: err };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data?.user, error };
  } catch (err) {
    console.error('Error getting current user:', err);
    return { user: null, error: err };
  }
};

// Check-in functions
export const checkIn = async (userId: string, photoData?: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Check if user already checked in today
    const { data: existing } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('check_in_date', today)
      .single();
    
    if (existing) {
      return { data: existing, error: null, alreadyCheckedIn: true };
    }
    
    // If we have photo data, upload it to storage
    let photoUrl = null;
    if (photoData && photoData.startsWith('data:image')) {
      // Convert base64 to blob
      const base64Response = await fetch(photoData);
      const blob = await base64Response.blob();
      
      const fileName = `${userId}_${today}_${Date.now()}.jpg`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('check-in-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
      } else if (uploadData) {
        const { data: urlData } = supabase
          .storage
          .from('check-in-photos')
          .getPublicUrl(fileName);
        
        photoUrl = urlData.publicUrl;
      }
    }
    
    // Create new check-in with photo URL if available
    const checkInData = { 
      user_id: userId,
      ...(photoUrl && { photo_url: photoUrl })
    };
    
    const { data, error } = await supabase
      .from('check_ins')
      .insert([checkInData])
      .select()
      .single();
    
    return { data, error, alreadyCheckedIn: false };
  } catch (err) {
    console.error('Error during check-in:', err);
    return { data: null, error: err, alreadyCheckedIn: false };
  }
};

export const getTodayCheckins = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        id,
        timestamp,
        photo_url,
        user_id,
        app_users:user_id (
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

export const getDailyHistory = async (date: Date) => {
  const formattedDate = date.toISOString().split('T')[0];
  
  try {
    // First get all users
    const { data: allUsers, error: usersError } = await supabase
      .from('app_users')
      .select('id, name, email, photo_url')
      .order('name');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { data: null, error: usersError };
    }
    
    // Then get all check-ins for the selected date
    const { data: checkIns, error: checkInsError } = await supabase
      .from('check_ins')
      .select('id, user_id, timestamp, photo_url')
      .eq('check_in_date', formattedDate);
    
    if (checkInsError) {
      console.error('Error fetching check-ins:', checkInsError);
      return { data: null, error: checkInsError };
    }
    
    // Combine the data to show who checked in and who didn't
    const combinedData = allUsers.map((user: any) => {
      const userCheckIn = checkIns?.find((checkIn: any) => checkIn.user_id === user.id);
      return {
        ...user,
        check_in: userCheckIn || null
      };
    });
    
    return { data: combinedData, error: null };
  } catch (err) {
    console.error('Error fetching daily history:', err);
    return { data: null, error: err };
  }
};

export const getWeeklyRanking = async () => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const formattedStartDate = startOfWeek.toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        user_id,
        app_users:user_id (
          id,
          name,
          email,
          photo_url
        )
      `)
      .gte('check_in_date', formattedStartDate)
      .order('timestamp', { ascending: false });
    
    if (data) {
      // Count check-ins by user
      const userCheckIns = data.reduce((acc, curr) => {
        const userId = curr.user_id;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Create ranking array
      const ranking = Object.entries(userCheckIns)
        .map(([userId, count]) => {
          const userProfile = data.find(item => item.user_id === userId)?.app_users;
          return {
            userId,
            count,
            profile: userProfile
          };
        })
        .sort((a, b) => b.count - a.count);
        
      return { data: ranking, error: null };
    }
    
    return { data: null, error };
  } catch (err) {
    console.error('Error fetching weekly ranking:', err);
    return { data: null, error: err };
  }
};

export const updateProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Error updating profile:', err);
    return { data: null, error: err };
  }
};
