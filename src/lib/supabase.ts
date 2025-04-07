import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Re-export supabase client
export { supabase };

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

export const updateProfile = async (userId: string, updates: any) => {
  try {
    // Fetch current profile first to avoid overwriting existing data
    const { data: existingProfile, error: fetchError } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return { data: null, error: fetchError };
    }
    
    // If there are no updates, just return the existing profile
    if (Object.keys(updates).length === 0) {
      return { data: existingProfile, error: null };
    }
    
    // Update the profile
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

export const checkIn = async (userId: string, photoUrl?: string) => {
  try {
    // Check if user already checked in today
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
    
    // Process photo upload if provided
    let photoUrlToStore = null;
    if (photoUrl) {
      // If the photoUrl is a data URL, upload it to Supabase Storage
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
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('check-ins')
            .getPublicUrl(fileName);
          
          photoUrlToStore = publicUrlData?.publicUrl;
        }
      } else {
        // If it's already a URL, just store it
        photoUrlToStore = photoUrl;
      }
    }
    
    // Create new check-in
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
    
    // Update user's streak and last check-in date
    if (!error) {
      // First get the current streak
      const { data: userData } = await supabase
        .from('app_users')
        .select('streak')
        .eq('id', userId)
        .single();
      
      // Then increment it
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
    // Calculate date for 7 days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    // Get check-ins from the last 7 days
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
    
    // Count check-ins per user
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
    
    // Convert to array and sort by count
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
    
    // First get all users
    const { data: users, error: usersError } = await supabase
      .from('app_users')
      .select('id, name, email, photo_url')
      .order('name');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { data: null, error: usersError };
    }
    
    // Then get check-ins for the specified date
    const { data: checkIns, error: checkInsError } = await supabase
      .from('check_ins')
      .select('id, user_id, timestamp, photo_url')
      .eq('check_in_date', dateString);
    
    if (checkInsError) {
      console.error('Error fetching check-ins:', checkInsError);
      return { data: null, error: checkInsError };
    }
    
    // Map check-ins to users
    const checkInMap: Record<string, any> = {};
    checkIns?.forEach(checkIn => {
      checkInMap[checkIn.user_id] = checkIn;
    });
    
    // Create result with all users and their check-ins (if any)
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

export const createParty = async (creatorId: string) => {
  try {
    // Generate a random 6-character code
    const { data: code, error: codeError } = await supabase.rpc('generate_party_code');
    
    if (codeError) {
      console.error('Error generating party code:', codeError);
      return { data: null, error: codeError };
    }
    
    // Set expiration time (24 hours from creation)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Create the party
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert({
        code: code,
        creator_id: creatorId,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        checked_in: false,
        max_members: 5,
        custom_message: 'Vamos treinar juntos!'
      })
      .select()
      .single();
    
    if (partyError) {
      console.error('Error creating party:', partyError);
      return { data: null, error: partyError };
    }
    
    // Add creator as the first member
    const { error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: creatorId,
      });
    
    if (memberError) {
      console.error('Error adding creator to party:', memberError);
      // Attempt to delete the party if we couldn't add the creator
      await supabase
        .from('parties')
        .delete()
        .eq('id', party.id);
      return { data: null, error: memberError };
    }
    
    return { data: party, error: null };
  } catch (err) {
    console.error('Unexpected error creating party:', err);
    return { data: null, error: err };
  }
};

export const joinParty = async (userId: string, partyCode: string) => {
  try {
    // Find the party by code
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('code', partyCode)
      .eq('is_active', true)
      .eq('checked_in', false)
      .single();
    
    if (partyError) {
      if (partyError.code === 'PGRST116') {
        return { data: null, error: partyError, message: 'Código inválido ou expirado' };
      }
      console.error('Error finding party:', partyError);
      return { data: null, error: partyError };
    }
    
    // Check if party is expired
    if (new Date(party.expires_at) < new Date()) {
      await supabase
        .from('parties')
        .update({ is_active: false })
        .eq('id', party.id);
        
      return { data: null, error: { message: 'Party expirada' }, message: 'Esta party já expirou' };
    }
    
    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('party_members')
      .select('id')
      .eq('party_id', party.id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      console.error('Error checking party membership:', memberCheckError);
      return { data: null, error: memberCheckError };
    }
    
    if (existingMember) {
      return { data: party, error: null, message: 'Você já está nesta party' };
    }
    
    // Check if party has reached max members
    const { count, error: countError } = await supabase
      .from('party_members')
      .select('id', { count: 'exact' })
      .eq('party_id', party.id);
    
    if (countError) {
      console.error('Error counting party members:', countError);
      return { data: null, error: countError };
    }
    
    if (count && count >= party.max_members) {
      return { 
        data: null, 
        error: { message: 'Party cheia' }, 
        message: 'Esta party já atingiu o número máximo de participantes' 
      };
    }
    
    // Add user to party
    const { error: joinError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: userId,
      });
    
    if (joinError) {
      console.error('Error joining party:', joinError);
      return { data: null, error: joinError };
    }
    
    return { data: party, error: null, message: 'Você entrou na party!' };
  } catch (err) {
    console.error('Unexpected error joining party:', err);
    return { data: null, error: err };
  }
};

export const getPartyMembers = async (partyId: string) => {
  try {
    console.log('Fetching party members with correct query');
    
    // Correção: Não usar join com app_users, buscar separadamente
    const { data: members, error } = await supabase
      .from('party_members')
      .select('id, user_id, joined_at')
      .eq('party_id', partyId)
      .order('joined_at');
    
    if (error) {
      console.error('Error fetching party members:', error);
      return { data: null, error };
    }
    
    if (!members || members.length === 0) {
      return { data: [], error: null };
    }
    
    // Buscar detalhes de usuários separadamente
    const userIds = members.map(member => member.user_id);
    const { data: users, error: usersError } = await supabase
      .from('app_users')
      .select('id, name, email, photo_url')
      .in('id', userIds);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { data: null, error: usersError };
    }
    
    // Combinar dados
    const enrichedMembers = members.map(member => {
      const userDetails = users?.find(user => user.id === member.user_id) || null;
      return {
        ...member,
        app_users: userDetails
      };
    });
    
    return { data: enrichedMembers, error: null };
  } catch (err) {
    console.error('Unexpected error fetching party members:', err);
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
    console.error('Unexpected error leaving party:', err);
    return { error: err };
  }
};

export const cancelParty = async (partyId: string, creatorId: string) => {
  try {
    // Verify the user is the creator
    const { data: party, error: checkError } = await supabase
      .from('parties')
      .select('creator_id')
      .eq('id', partyId)
      .single();
    
    if (checkError) {
      console.error('Error checking party creator:', checkError);
      return { error: checkError };
    }
    
    if (party.creator_id !== creatorId) {
      return { 
        error: { message: 'Unauthorized' }, 
        message: 'Apenas o criador da party pode cancelá-la' 
      };
    }
    
    // Delete all members first
    const { error: membersError } = await supabase
      .from('party_members')
      .delete()
      .eq('party_id', partyId);
    
    if (membersError) {
      console.error('Error removing party members:', membersError);
      return { error: membersError };
    }
    
    // Then deactivate the party
    const { error: updateError } = await supabase
      .from('parties')
      .update({ is_active: false })
      .eq('id', partyId);
    
    if (updateError) {
      console.error('Error deactivating party:', updateError);
      return { error: updateError };
    }
    
    return { error: null, message: 'Party cancelada com sucesso' };
  } catch (err) {
    console.error('Unexpected error canceling party:', err);
    return { error: err };
  }
};

export const partyCheckIn = async (partyId: string, creatorId: string, photoUrl?: string) => {
  try {
    // Verify the user is the creator
    const { data: party, error: checkError } = await supabase
      .from('parties')
      .select('creator_id, is_active, checked_in')
      .eq('id', partyId)
      .single();
    
    if (checkError) {
      console.error('Error checking party status:', checkError);
      return { error: checkError };
    }
    
    if (party.creator_id !== creatorId) {
      return { 
        error: { message: 'Unauthorized' }, 
        message: 'Apenas o criador da party pode fazer check-in do grupo' 
      };
    }
    
    if (!party.is_active) {
      return { 
        error: { message: 'Party inactive' }, 
        message: 'Esta party não está mais ativa' 
      };
    }
    
    if (party.checked_in) {
      return { 
        error: { message: 'Already checked in' }, 
        message: 'Esta party já fez check-in' 
      };
    }
    
    // Get all members of the party
    const { data: members, error: membersError } = await supabase
      .from('party_members')
      .select('user_id')
      .eq('party_id', partyId);
    
    if (membersError) {
      console.error('Error getting party members:', membersError);
      return { error: membersError };
    }
    
    if (!members || members.length === 0) {
      return { 
        error: { message: 'No members' }, 
        message: 'Esta party não tem membros' 
      };
    }

    // Process photo upload if provided
    let photoUrlToStore = null;
    if (photoUrl) {
      // If the photoUrl is a data URL, upload it to Supabase Storage
      if (photoUrl.startsWith('data:')) {
        const fileName = `party-check-in-${partyId}-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('check-ins')
          .upload(fileName, photoUrl, {
            contentType: 'image/jpeg',
            upsert: true,
          });
        
        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          return { error: uploadError, message: 'Erro ao fazer upload da foto' };
        } else {
          // Get public URL for the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from('check-ins')
            .getPublicUrl(fileName);
          
          photoUrlToStore = publicUrlData?.publicUrl;
        }
      } else {
        // If it's already a URL, just store it
        photoUrlToStore = photoUrl;
      }
    }
    
    // Update party status to checked in first
    const { error: updateError } = await supabase
      .from('parties')
      .update({ checked_in: true })
      .eq('id', partyId)
      .eq('creator_id', creatorId);
    
    if (updateError) {
      console.error('Error updating party status:', updateError);
      return { error: updateError };
    }
    
    // Process check-ins for all members using a server-side function
    // This avoids RLS issues as we're using a single authenticated call
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    
    // Create batch of all member IDs
    const memberIds = members.map(member => member.user_id);
    
    // Call RPC function to process check-ins for all members in a single call
    const { data, error: rpcError } = await (supabase.rpc as any)(
      'process_party_check_in_with_photo',
      { 
        p_member_ids: memberIds,
        p_check_in_date: today,
        p_timestamp: timestamp,
        p_photo_url: photoUrlToStore
      }
    );
    
    if (rpcError) {
      console.error('Error processing party check-in:', rpcError);
      
      // Even if the RPC call fails, we'll still show the party as checked in
      // since we already updated that status
      return { 
        error: rpcError,
        message: 'Houve um problema ao registrar alguns check-ins, mas a party foi marcada como concluída'
      };
    }
    
    // Extract success count from the returned JSON
    const successCount = typeof data === 'object' && data !== null ? (data as any).success_count || 0 : 0;
    
    return { 
      error: null, 
      message: `Check-in em grupo realizado com sucesso para ${successCount} membros!` 
    };
  } catch (err) {
    console.error('Unexpected error during party check-in:', err);
    return { error: err };
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
      .filter(item => item.parties && 
               typeof item.parties === 'object' && 
               'is_active' in item.parties && 
               'checked_in' in item.parties && 
               item.parties.is_active === true && 
               item.parties.checked_in === false)
      .map(item => item.parties);
    
    if (activeParties.length === 0) {
      return { data: null, error: null };
    }
    
    // Return the most recent active party
    const mostRecentParty = activeParties.sort((a, b) => {
      // Ensure we're comparing dates correctly
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    })[0];
    
    return { data: mostRecentParty, error: null };
  } catch (err) {
    console.error('Error fetching current party:', err);
    return { data: null, error: err };
  }
};
