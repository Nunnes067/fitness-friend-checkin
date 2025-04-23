
import { supabase } from '@/integrations/supabase/client';

export const createParty = async (creatorId: string) => {
  try {
    const { data: code, error: codeError } = await supabase.rpc('generate_party_code');
    
    if (codeError) {
      console.error('Error generating party code:', codeError);
      return { data: null, error: codeError };
    }
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
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
    
    const { error: memberError } = await supabase
      .from('party_members')
      .insert({
        party_id: party.id,
        user_id: creatorId,
      });
    
    if (memberError) {
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

// ... Export other party-related functions (joinParty, getPartyMembers, leaveParty, cancelParty, partyCheckIn, getCurrentParty)
