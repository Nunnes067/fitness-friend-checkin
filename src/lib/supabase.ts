
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
