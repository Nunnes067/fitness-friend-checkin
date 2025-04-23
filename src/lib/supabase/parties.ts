
import { supabase } from '@/integrations/supabase/client';

export const createParty = async ({ 
  creatorId, 
  expiresAt, 
  maxMembers, 
  customMessage 
}: {
  creatorId: string;
  expiresAt?: Date;
  maxMembers?: number;
  customMessage?: string;
}) => {
  try {
    const { data: code, error: codeError } = await supabase.rpc('generate_party_code');
    
    if (codeError) {
      console.error('Error generating party code:', codeError);
      return { data: null, error: codeError };
    }
    
    const partyData: any = {
      creator_id: creatorId,
      code
    };
    
    if (expiresAt) {
      partyData.expires_at = expiresAt.toISOString();
    }
    
    if (maxMembers) {
      partyData.max_members = maxMembers;
    }
    
    if (customMessage) {
      partyData.custom_message = customMessage;
    }
    
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert(partyData)
      .select()
      .single();
    
    if (partyError) {
      console.error('Error creating party:', partyError);
      return { data: null, error: partyError };
    }
    
    // Add creator as member
    const { error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: creatorId
      });
    
    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      
      // Rollback party creation
      await supabase
        .from('parties')
        .delete()
        .eq('id', party.id);
        
      return { data: null, error: memberError };
    }
    
    return { data: party, error: null };
  } catch (err) {
    console.error('Error creating party:', err);
    return { data: null, error: err };
  }
};

export const joinParty = async (userId: string, partyCode: string) => {
  try {
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('code', partyCode)
      .eq('is_active', true)
      .single();
    
    if (partyError) {
      if (partyError.code === 'PGRST116') {
        return { data: null, error: partyError, message: 'Código de grupo inválido ou expirado' };
      }
      console.error('Error finding party:', partyError);
      return { data: null, error: partyError };
    }
    
    // Check if party has expired
    if (new Date(party.expires_at) < new Date()) {
      return { data: null, error: { message: 'Este grupo já expirou' }, message: 'Este grupo já expirou' };
    }
    
    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase.rpc(
      'is_party_member',
      { user_id: userId, party_id: party.id }
    );
    
    if (memberCheckError) {
      console.error('Error checking membership:', memberCheckError);
      return { data: null, error: memberCheckError };
    }
    
    if (existingMember) {
      return { data: party, error: null, message: 'Você já é membro deste grupo' };
    }
    
    // Check if party is full
    const { count, error: countError } = await supabase
      .from('party_members')
      .select('*', { count: 'exact' })
      .eq('party_id', party.id);
    
    if (countError) {
      console.error('Error counting members:', countError);
      return { data: null, error: countError };
    }
    
    if (count && count >= party.max_members) {
      return { data: null, error: { message: 'Este grupo está cheio' }, message: 'Este grupo está cheio' };
    }
    
    // Add user as member
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
    
    return { data: party, error: null, message: 'Você entrou no grupo!' };
  } catch (err) {
    console.error('Error joining party:', err);
    return { data: null, error: err };
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
      .eq('party_id', partyId);
    
    if (error) {
      console.error('Error fetching party members:', error);
      return { data: null, error };
    }
    
    const members = data.map(member => {
      return {
        id: member.id,
        joined_at: member.joined_at,
        user_id: member.user_id,
        name: member.app_users?.name,
        email: member.app_users?.email, 
        photo_url: member.app_users?.photo_url,
        streak: member.app_users?.streak
      };
    });
    
    return { data: members, error: null };
  } catch (err) {
    console.error('Error fetching party members:', err);
    return { data: null, error: err };
  }
};

export const getCurrentParty = async (userId: string) => {
  try {
    const now = new Date();
    
    const { data, error } = await supabase
      .from('parties')
      .select(`
        id,
        code,
        created_at,
        expires_at,
        is_active,
        checked_in,
        max_members,
        custom_message,
        creator_id
      `)
      .eq('is_active', true)
      .gt('expires_at', now.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching parties:', error);
      return { data: null, error };
    }
    
    if (!data || data.length === 0) {
      return { data: null, error: null };
    }
    
    // Check which parties the user is a member of
    const partyPromises = data.map(async (party) => {
      const isMember = await supabase.rpc(
        'is_party_member',
        { user_id: userId, party_id: party.id }
      );
      
      if (isMember.data) {
        const { count, error: countError } = await supabase
          .from('party_members')
          .select('*', { count: 'exact' })
          .eq('party_id', party.id);
          
        if (countError) {
          console.error('Error counting members:', countError);
        }
        
        const isCreator = party.creator_id === userId;
        
        return {
          ...party,
          member_count: count || 0,
          is_creator: isCreator,
          time_remaining: new Date(party.expires_at).getTime() - now.getTime()
        };
      }
      
      return null;
    });
    
    const parties = await Promise.all(partyPromises);
    const userParties = parties.filter(party => party !== null);
    
    return { data: userParties[0] || null, error: null };
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
      .eq('user_id', userId)
      .eq('party_id', partyId);
      
    return { error };
  } catch (err) {
    console.error('Error leaving party:', err);
    return { error: err };
  }
};

export const cancelParty = async (partyId: string) => {
  try {
    const { error } = await supabase
      .from('parties')
      .update({ is_active: false })
      .eq('id', partyId);
      
    return { error };
  } catch (err) {
    console.error('Error canceling party:', err);
    return { error: err };
  }
};

export const partyCheckIn = async (partyId: string, memberIds: string[]) => {
  try {
    const now = new Date();
    const checkInDate = now.toISOString().split('T')[0];
    
    const { data, error } = await supabase.rpc(
      'process_party_check_in', 
      { 
        p_member_ids: memberIds,
        p_check_in_date: checkInDate,
        p_timestamp: now.toISOString()
      }
    );
    
    if (error) {
      console.error('Error processing party check-in:', error);
      return { data: null, error };
    }
    
    // Update party's checked_in status
    const { error: updateError } = await supabase
      .from('parties')
      .update({ checked_in: true })
      .eq('id', partyId);
      
    if (updateError) {
      console.error('Error updating party check-in status:', updateError);
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error during party check-in:', err);
    return { data: null, error: err };
  }
};
