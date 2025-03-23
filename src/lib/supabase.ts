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

export const resetPassword = async (email: string, redirectTo: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { data, error };
  } catch (err) {
    console.error('Error during password reset:', err);
    return { data: null, error: err };
  }
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
    // First get current profile to return if no updates provided
    if (Object.keys(updates).length === 0) {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return { data: null, error: fetchError };
      }
      
      return { data: currentProfile, error: null };
    }
    
    // Then update profile if there are updates
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

// Party system functions
export const createParty = async (userId: string, maxMembers = 5, customMessage?: string) => {
  try {
    // Generate a code first
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_party_code');
    
    if (codeError) {
      console.error('Error generating code:', codeError);
      return { data: null, error: codeError };
    }
    
    const code = codeData;
    
    // Create the party entry
    const partyData = {
      code,
      creator_id: userId,
      max_members: maxMembers,
      ...(customMessage && { custom_message: customMessage })
    };
    
    const { data, error } = await supabase
      .from('parties')
      .insert([partyData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating party:', error);
      return { data: null, error };
    }
    
    // Add creator as a member automatically
    const { error: memberError } = await supabase
      .from('party_members')
      .insert([{ party_id: data.id, user_id: userId }]);
    
    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // Continue anyway as the party was created
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error during party creation:', err);
    return { data: null, error: err };
  }
};

export const joinParty = async (userId: string, code: string) => {
  try {
    // Find the party with the given code
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (partyError) {
      return { data: null, error: partyError, message: 'Código inválido ou expirado' };
    }
    
    // Check if party is full
    const { data: members, error: membersError } = await supabase
      .from('party_members')
      .select('*')
      .eq('party_id', party.id);
    
    if (membersError) {
      return { data: null, error: membersError, message: 'Erro ao verificar membros' };
    }
    
    if (members && members.length >= party.max_members) {
      return { 
        data: null, 
        error: new Error('Party is full'), 
        message: 'Este grupo já atingiu o limite máximo de membros' 
      };
    }
    
    // Check if user is already a member
    const isMember = members.some(member => member.user_id === userId);
    if (isMember) {
      return { 
        data: party, 
        error: null, 
        message: 'Você já é membro deste grupo' 
      };
    }
    
    // Add user as a member
    const { data: memberData, error: memberError } = await supabase
      .from('party_members')
      .insert([{ party_id: party.id, user_id: userId }])
      .select()
      .single();
    
    if (memberError) {
      return { data: null, error: memberError, message: 'Erro ao juntar-se ao grupo' };
    }
    
    return { data: party, memberData, error: null, message: party.custom_message || 'Bem-vindo ao grupo!' };
  } catch (err) {
    console.error('Error joining party:', err);
    return { data: null, error: err, message: 'Erro inesperado' };
  }
};

export const getPartyMembers = async (partyId: string) => {
  try {
    const { data, error } = await supabase
      .from('party_members')
      .select(`
        id,
        user_id,
        joined_at,
        app_users:user_id (
          id,
          name,
          email,
          photo_url
        )
      `)
      .eq('party_id', partyId)
      .order('joined_at');
    
    return { data, error };
  } catch (err) {
    console.error('Error fetching party members:', err);
    return { data: null, error: err };
  }
};

export const getCurrentParty = async (userId: string) => {
  try {
    // Get active parties where the user is a member
    const { data: memberData, error: memberError } = await supabase
      .from('party_members')
      .select(`
        party_id,
        parties:party_id (
          id,
          code,
          creator_id,
          created_at,
          expires_at,
          is_active,
          max_members,
          custom_message,
          checked_in
        )
      `)
      .eq('user_id', userId);
    
    if (memberError) {
      console.error('Error fetching user parties:', memberError);
      return { data: null, error: memberError };
    }
    
    if (!memberData || memberData.length === 0) {
      return { data: null, error: null };
    }
    
    // Find active parties - filter out any null parties entries first
    const activeParties = memberData
      .filter(item => item.parties && item.parties.is_active && !item.parties.checked_in)
      .map(item => item.parties);
    
    if (activeParties.length === 0) {
      return { data: null, error: null };
    }
    
    // Return the most recent active party
    const mostRecentParty = activeParties.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return { data: mostRecentParty, error: null };
  } catch (err) {
    console.error('Error fetching current party:', err);
    return { data: null, error: err };
  }
};

export const leaveParty = async (userId: string, partyId: string) => {
  try {
    const { error } = await supabase
      .from('party_members')
      .delete()
      .eq('party_id', partyId)
      .eq('user_id', userId);
    
    return { error };
  } catch (err) {
    console.error('Error leaving party:', err);
    return { error: err };
  }
};

export const cancelParty = async (partyId: string, creatorId: string) => {
  try {
    // Verify that the user is the creator
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('creator_id')
      .eq('id', partyId)
      .single();
    
    if (partyError) {
      return { error: partyError, message: 'Grupo não encontrado' };
    }
    
    if (party.creator_id !== creatorId) {
      return { error: new Error('Not authorized'), message: 'Apenas o criador pode cancelar o grupo' };
    }
    
    // Update the party status
    const { error } = await supabase
      .from('parties')
      .update({ is_active: false })
      .eq('id', partyId);
    
    if (error) {
      return { error, message: 'Erro ao cancelar o grupo' };
    }
    
    return { error: null, message: 'Grupo cancelado com sucesso' };
  } catch (err) {
    console.error('Error canceling party:', err);
    return { error: err, message: 'Erro inesperado' };
  }
};

export const partyCheckIn = async (partyId: string, creatorId: string) => {
  try {
    // Verify that the user is the creator
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('creator_id, checked_in')
      .eq('id', partyId)
      .single();
    
    if (partyError) {
      return { error: partyError, message: 'Grupo não encontrado' };
    }
    
    if (party.creator_id !== creatorId) {
      return { error: new Error('Not authorized'), message: 'Apenas o criador pode fazer check-in do grupo' };
    }
    
    if (party.checked_in) {
      return { error: new Error('Already checked in'), message: 'Este grupo já realizou check-in' };
    }
    
    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('party_members')
      .select('user_id')
      .eq('party_id', partyId);
    
    if (membersError) {
      return { error: membersError, message: 'Erro ao verificar membros' };
    }
    
    // Check in for all members
    const today = new Date().toISOString().split('T')[0];
    const checkInPromises = members.map(member => 
      supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', member.user_id)
        .eq('check_in_date', today)
        .then(({ data }) => {
          // Only check in if the user hasn't already checked in
          if (!data || data.length === 0) {
            return supabase
              .from('check_ins')
              .insert([{ user_id: member.user_id }]);
          }
          return { data: null, error: null };
        })
    );
    
    await Promise.all(checkInPromises);
    
    // Update the party status
    const { error } = await supabase
      .from('parties')
      .update({ checked_in: true, is_active: false })
      .eq('id', partyId);
    
    if (error) {
      return { error, message: 'Erro ao atualizar status do grupo' };
    }
    
    return { error: null, message: 'Check-in de grupo realizado com sucesso!' };
  } catch (err) {
    console.error('Error during party check-in:', err);
    return { error: err, message: 'Erro inesperado' };
  }
};
