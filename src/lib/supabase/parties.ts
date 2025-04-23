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

// Add more functions as needed for party functionality
