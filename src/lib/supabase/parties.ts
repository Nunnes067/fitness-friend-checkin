
import { supabase } from '@/integrations/supabase/client';

export const getCurrentParty = async (userId: string) => {
  try {
    // First check if the user is in an active party
    const { data: memberData, error: memberError } = await supabase
      .from('party_members')
      .select(`
        id,
        joined_at,
        party_id,
        parties:party_id (
          id,
          created_at,
          expires_at,
          is_active,
          max_members,
          checked_in,
          custom_message,
          code,
          creator_id
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(1);

    if (memberError) {
      console.error('Error checking party membership:', memberError);
      return { data: null, error: memberError };
    }
    
    // If user is not in a party
    if (!memberData || memberData.length === 0) {
      return { data: null, error: null };
    }
    
    const party = memberData[0].parties;
    
    // Check if the party is active and not expired
    if (!party.is_active || new Date(party.expires_at) < new Date()) {
      return { data: null, error: null };
    }
    
    // Get member count
    const { count, error: countError } = await supabase
      .from('party_members')
      .select('id', { count: 'exact', head: true })
      .eq('party_id', party.id);
      
    if (countError) {
      console.error('Error counting party members:', countError);
    }
    
    // Check if user is creator
    const isCreator = party.creator_id === userId;
    
    return { 
      data: {
        ...party,
        member_count: count || 0,
        is_creator: isCreator,
        joined_at: memberData[0].joined_at
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Unexpected error fetching party:', err);
    return { data: null, error: err };
  }
};

export const createParty = async ({ creatorId, expiresAt, maxMembers, customMessage }: { 
  creatorId: string; 
  expiresAt?: Date; 
  maxMembers?: number;
  customMessage?: string;
}) => {
  try {
    // Generate a random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('parties')
      .insert({
        creator_id: creatorId,
        expires_at: expiresAt,
        max_members: maxMembers,
        custom_message: customMessage,
        code
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating party:', error);
      return { data: null, error };
    }
    
    // Add creator as a member
    const { error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: data.id,
        user_id: creatorId
      });
      
    if (memberError) {
      console.error('Error adding creator to party:', memberError);
      // Rollback party creation
      await supabase
        .from('parties')
        .delete()
        .eq('id', data.id);
      return { data: null, error: memberError };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error creating party:', err);
    return { data: null, error: err };
  }
};

export const joinParty = async (userId: string, code: string) => {
  try {
    // Find the party
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();
      
    if (partyError) {
      if (partyError.code === 'PGRST116') {
        return { 
          data: null, 
          error: null, 
          message: 'Código inválido ou expirado' 
        };
      }
      console.error('Error finding party:', partyError);
      return { data: null, error: partyError };
    }
    
    // Check if user is already in the party
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
      return { 
        data: party, 
        error: null,
        message: 'Você já está neste grupo'
      };
    }
    
    // Get current member count
    const { count, error: countError } = await supabase
      .from('party_members')
      .select('id', { count: 'exact', head: true })
      .eq('party_id', party.id);
      
    if (countError) {
      console.error('Error counting party members:', countError);
      return { data: null, error: countError };
    }
    
    // Check if party is full
    if ((count || 0) >= party.max_members) {
      return { 
        data: null, 
        error: null,
        message: 'Este grupo já está cheio'
      };
    }
    
    // Join the party
    const { error: joinError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: userId
      });
      
    if (joinError) {
      console.error('Error joining party:', joinError);
      return { data: null, error: joinError };
    }
    
    return { 
      data: party, 
      error: null,
      message: 'Você entrou no grupo!'
    };
  } catch (err) {
    console.error('Unexpected error joining party:', err);
    return { data: null, error: err };
  }
};

export const leaveParty = async (userId: string, partyId: string) => {
  try {
    const { error } = await supabase
      .from('party_members')
      .delete()
      .eq('user_id', userId)
      .eq('party_id', partyId);
      
    if (error) {
      console.error('Error leaving party:', error);
      return { error };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error leaving party:', err);
    return { error: err };
  }
};

export const cancelParty = async (partyId: string) => {
  try {
    const { error } = await supabase
      .from('parties')
      .update({ is_active: false })
      .eq('id', partyId);
      
    if (error) {
      console.error('Error cancelling party:', error);
      return { error };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error cancelling party:', err);
    return { error: err };
  }
};

export const getPartyMembers = async (partyId: string) => {
  try {
    const { data, error } = await supabase
      .from('party_members')
      .select(`
        id,
        joined_at,
        user_id,
        app_users:user_id (
          id,
          name,
          email,
          photo_url,
          streak
        )
      `)
      .eq('party_id', partyId)
      .order('joined_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching party members:', error);
      return { data: null, error };
    }
    
    const members = data.map(member => ({
      id: member.id,
      user_id: member.user_id,
      joined_at: member.joined_at,
      name: member.app_users.name,
      email: member.app_users.email,
      photo_url: member.app_users.photo_url,
      streak: member.app_users.streak
    }));
    
    return { data: members, error: null };
  } catch (err) {
    console.error('Unexpected error fetching party members:', err);
    return { data: null, error: err };
  }
};

export const partyCheckIn = async (partyId: string, creatorId: string) => {
  try {
    // Update party to checked in
    const { error: updateError } = await supabase
      .from('parties')
      .update({ checked_in: true })
      .eq('id', partyId)
      .eq('creator_id', creatorId);
      
    if (updateError) {
      console.error('Error updating party check-in status:', updateError);
      return { error: updateError };
    }
    
    // Get all members of the party
    const { data: members, error: membersError } = await supabase
      .from('party_members')
      .select('user_id')
      .eq('party_id', partyId);
      
    if (membersError) {
      console.error('Error fetching party members:', membersError);
      return { error: membersError };
    }
    
    // Check in all members
    const today = new Date().toISOString().split('T')[0];
    
    for (const member of members) {
      // Check if user already checked in today
      const { data: existingCheckIn, error: checkError } = await supabase
        .from('check_ins')
        .select('id')
        .eq('user_id', member.user_id)
        .eq('check_in_date', today)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for existing check-in:', checkError);
        continue;
      }
      
      if (!existingCheckIn) {
        // Create check-in
        await supabase.from('check_ins').insert({
          user_id: member.user_id,
          check_in_date: today,
          timestamp: new Date().toISOString()
        });
        
        // Update user streak
        const { data: userData } = await supabase
          .from('app_users')
          .select('streak')
          .eq('id', member.user_id)
          .single();
          
        await supabase
          .from('app_users')
          .update({
            last_check_in: today,
            streak: (userData?.streak || 0) + 1
          })
          .eq('id', member.user_id);
      }
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error during party check-in:', err);
    return { error: err };
  }
};
