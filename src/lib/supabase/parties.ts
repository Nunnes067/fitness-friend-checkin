
import { supabase } from '@/integrations/supabase/client';

export const getParty = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching party:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error fetching party:', err);
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
    
    // Format the response to make it easier to work with
    const members = data.map(member => {
      const user = member.app_users;
      return {
        id: member.id,
        joined_at: member.joined_at,
        user_id: member.user_id,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        photo_url: user?.photo_url || '',
        streak: user?.streak || 0
      };
    });
    
    return { data: members, error: null };
  } catch (err) {
    console.error('Unexpected error fetching party members:', err);
    return { data: null, error: err };
  }
};

export const getCurrentParty = async (userId: string) => {
  try {
    // First, check if the user is a member of any active party
    const { data: memberData, error: memberError } = await supabase
      .from('party_members')
      .select(`
        party_id
      `)
      .eq('user_id', userId);
    
    if (memberError) {
      console.error('Error checking party membership:', memberError);
      return { data: null, error: memberError };
    }
    
    if (!memberData || memberData.length === 0) {
      // User is not a member of any party
      return { data: null, error: null };
    }
    
    // Get all party IDs the user is a member of
    const partyIds = memberData.map(m => m.party_id);
    
    // Now get the active party
    const { data: partyData, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .in('id', partyIds)
      .eq('is_active', true)
      .lte('expires_at', new Date().toISOString())
      .single();
    
    if (partyError && partyError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error fetching party:', partyError);
      return { data: null, error: partyError };
    }
    
    return { data: partyData || null, error: null };
  } catch (err) {
    console.error('Unexpected error in getCurrentParty:', err);
    return { data: null, error: err };
  }
};

export const createParty = async (userId: string) => {
  try {
    // Generate a unique party code
    const { data: code, error: codeError } = await supabase.rpc('generate_party_code');
    
    if (codeError) {
      console.error('Error generating party code:', codeError);
      return { data: null, error: codeError };
    }
    
    // Create the party
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert({
        creator_id: userId,
        code
      })
      .select()
      .single();
    
    if (partyError) {
      console.error('Error creating party:', partyError);
      return { data: null, error: partyError };
    }
    
    // Add creator as first member
    const { error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: userId
      });
    
    if (memberError) {
      // If adding member fails, try to delete the party
      console.error('Error adding creator to party:', memberError);
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

export const joinParty = async (userId: string, code: string) => {
  try {
    // Find the party by code
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
    
    if (partyError) {
      if (partyError.code === 'PGRST116') { // No rows returned
        return { data: null, error: partyError, message: 'Código inválido ou party expirada' };
      }
      console.error('Error finding party:', partyError);
      return { data: null, error: partyError };
    }
    
    // Check if party is full
    const { count, error: countError } = await supabase
      .from('party_members')
      .select('*', { count: 'exact', head: true })
      .eq('party_id', party.id);
    
    if (countError) {
      console.error('Error counting party members:', countError);
      return { data: null, error: countError };
    }
    
    if (count && count >= party.max_members) {
      return { data: null, error: { message: 'Party cheia' }, message: 'Party cheia' };
    }
    
    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('party_members')
      .select('id')
      .eq('party_id', party.id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (memberCheckError) {
      console.error('Error checking party membership:', memberCheckError);
      return { data: null, error: memberCheckError };
    }
    
    if (existingMember) {
      return { data: party, error: null, message: 'Você já é membro desta party' };
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
    
    return { data: party, error: null, message: 'Você entrou na party!' };
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
    
    return { error };
  } catch (err) {
    console.error('Error leaving party:', err);
    return { error: err };
  }
};

export const cancelParty = async (partyId: string, userId: string) => {
  try {
    // Verify user is creator
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('creator_id')
      .eq('id', partyId)
      .single();
    
    if (fetchError) {
      return { error: fetchError, message: 'Erro ao buscar dados da party' };
    }
    
    if (party.creator_id !== userId) {
      return { error: { message: 'Somente o criador pode cancelar a party' }, message: 'Somente o criador pode cancelar a party' };
    }
    
    // Cancel party by marking as inactive
    const { error } = await supabase
      .from('parties')
      .update({ is_active: false })
      .eq('id', partyId);
    
    if (error) {
      return { error, message: 'Erro ao cancelar a party' };
    }
    
    return { error: null, message: 'Party cancelada com sucesso' };
  } catch (err) {
    console.error('Error canceling party:', err);
    return { error: err };
  }
};

export const partyCheckIn = async (partyId: string, userId: string, photoBase64: string) => {
  try {
    // Verify user is creator
    const { data: party, error: fetchError } = await supabase
      .from('parties')
      .select('creator_id, checked_in')
      .eq('id', partyId)
      .single();
    
    if (fetchError) {
      return { error: fetchError, message: 'Erro ao buscar dados da party' };
    }
    
    if (party.creator_id !== userId) {
      return { error: { message: 'Somente o criador pode fazer check-in de grupo' }, message: 'Somente o criador pode fazer check-in de grupo' };
    }
    
    if (party.checked_in) {
      return { error: null, message: 'Esta party já realizou check-in hoje' };
    }
    
    // Get all members of the party
    const { data: members, error: membersError } = await supabase
      .from('party_members')
      .select('user_id')
      .eq('party_id', partyId);
    
    if (membersError) {
      return { error: membersError, message: 'Erro ao buscar membros da party' };
    }
    
    let photoUrl = null;
    
    // Upload the photo
    if (photoBase64) {
      // Convert base64 to blob
      const base64Response = await fetch(photoBase64);
      const blob = await base64Response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], `party-check-in-${partyId}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const fileName = `party-check-ins/${partyId}/${Date.now()}.jpg`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('check-ins')
        .upload(fileName, file, {
          contentType: 'image/jpeg',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error uploading party check-in photo:', uploadError);
        // Continue without the photo if upload fails
      } else {
        const { data } = supabase.storage
          .from('check-ins')
          .getPublicUrl(fileName);
          
        photoUrl = data.publicUrl;
      }
    }
    
    // Mark party as checked in
    const { error: updateError } = await supabase
      .from('parties')
      .update({ checked_in: true })
      .eq('id', partyId);
    
    if (updateError) {
      return { error: updateError, message: 'Erro ao atualizar status da party' };
    }
    
    // Process check-ins for all members
    const memberIds = members.map(m => m.user_id);
    const today = new Date().toISOString().split('T')[0];
    
    const { error: processError } = await supabase.rpc('process_party_check_in', {
      p_member_ids: memberIds,
      p_check_in_date: today,
      p_timestamp: new Date().toISOString()
    });
    
    if (processError) {
      console.error('Error processing party check-ins:', processError);
      return { error: processError, message: 'Houve um erro ao processar os check-ins do grupo' };
    }
    
    return { error: null, message: 'Check-in de grupo realizado com sucesso!' };
  } catch (err) {
    console.error('Error in party check-in:', err);
    return { error: err };
  }
};
