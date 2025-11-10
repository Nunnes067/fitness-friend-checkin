import { supabase } from '@/integrations/supabase/client';

export const getUserRole = async (userId: string) => {
  try {
    console.log("Fetching role for user ID:", userId);
    
    if (!userId) {
      console.error("No user ID provided");
      return { role: 'user', error: new Error("No user ID provided") };
    }
    
    const { data, error } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user role:', error);
      return { role: 'user', error };
    }
    
    console.log("Role data returned:", data);
    return { role: data?.role || 'user', error: null };
  } catch (err) {
    console.error('Unexpected error in getUserRole:', err);
    return { role: 'user', error: err };
  }
};

export const getUserGroups = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        group_id,
        training_groups (
          id,
          name,
          description,
          creator_id,
          is_active,
          invite_code
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user groups:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error in getUserGroups:', err);
    return { data: null, error: err };
  }
};

export const joinGroup = async (userId: string, inviteCode: string) => {
  try {
    // Find the group with the matching invite code
    const { data: groups, error: groupError } = await supabase
      .from('training_groups')
      .select('id, is_active')
      .eq('code', inviteCode)
      .single();
    
    if (groupError) {
      console.error('Error finding group with invite code:', groupError);
      return { data: null, error: groupError, message: 'Código de convite inválido' };
    }
    
    if (!groups) {
      return { data: null, error: new Error('Group not found'), message: 'Grupo não encontrado' };
    }
    
    if (!groups.is_active) {
      return { data: null, error: new Error('Group is inactive'), message: 'Este grupo está inativo' };
    }
    
    // Check if the user is already a member of the group
    const { data: existingMember, error: memberError } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('group_id', groups.id);
    
    if (memberError) {
      console.error('Error checking existing membership:', memberError);
      return { data: null, error: memberError, message: 'Erro ao verificar a associação ao grupo' };
    }
    
    if (existingMember) {
      return { data: null, error: new Error('Already a member'), message: 'Você já é membro deste grupo' };
    }
    
    // Add the user to the group
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groups.id,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error joining group:', error);
      return { data: null, error, message: 'Erro ao entrar no grupo' };
    }
    
    return { data, error: null, message: 'Você entrou no grupo!' };
  } catch (err) {
    console.error('Unexpected error in joinGroup:', err);
    return { data: null, error: err, message: 'Ocorreu um erro inesperado' };
  }
};

export const createGroup = async ({ name, description, creatorId }: { name: string, description: string, creatorId: string }) => {
  try {
    // Generate a unique invite code
    const { data: generatedCode, error: codeError } = await supabase.rpc('generate_group_code');
    
    if (codeError) {
      console.error('Error generating invite code:', codeError);
      return { data: null, error: codeError };
    }
    
    const inviteCode = generatedCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create the group
    const { data, error } = await supabase
      .from('training_groups')
      .insert({
        name,
        description,
        creator_id: creatorId,
        code: inviteCode,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating group:', error);
      return { data: null, error };
    }
    
    // Add the creator to the group members
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: data.id,
        user_id: creatorId,
        is_admin: true,
      });
    
    if (memberError) {
      console.error('Error adding creator to group members:', memberError);
      return { data: null, error: memberError };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in createGroup:', err);
    return { data: null, error: err };
  }
};

export const getGroupFeed = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('group_posts')
      .select(`
        id,
        content,
        image_url,
        created_at,
        user:user_id (
          id,
          name,
          email,
          photo_url
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching group feed:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error in getGroupFeed:', err);
    return { data: null, error: err };
  }
};

export const getGroupMembers = async (groupId: string) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        id,
        is_admin,
        joined_at,
        user_id,
        app_users:user_id (
          id,
          name,
          email,
          photo_url
        )
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching group members:', error);
      return { data: null, error };
    }
    
    // Get today's date in format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Use type assertion to handle the uncertain type structure
    const membersPromises = data.map(async member => {
      // Create a safe user object with default values
      const user = member.app_users as any;
      
      // Check if this member has checked in today
      const { data: checkInData, error: checkInError } = await supabase.rpc(
        'has_checked_in_today',
        { user_uuid: member.user_id }
      );
      
      const hasCheckedInToday = checkInData || false;
      
      return {
        id: member.id,
        is_admin: member.is_admin,
        joined_at: member.joined_at,
        is_creator: false, // Will be updated later if needed
        user_id: member.user_id,
        name: user ? user.name : 'Unknown',
        email: user ? user.email : '',
        photo_url: user ? user.photo_url : null,
        checked_in_today: hasCheckedInToday
      };
    });
    
    const members = await Promise.all(membersPromises);
    
    // Now check for the creator
    const { data: groupData } = await supabase
      .from('training_groups')
      .select('creator_id')
      .eq('id', groupId)
      .single();
      
    if (groupData) {
      // Mark the creator
      members.forEach(member => {
        if (member.user_id === groupData.creator_id) {
          member.is_creator = true;
        }
      });
    }
    
    return { data: members, error: null };
  } catch (err) {
    console.error('Error fetching group members:', err);
    return { data: null, error: err };
  }
};

export const checkInGroupMember = async (groupId: string, userId: string, photoBase64: string | File) => {
  try {
    // Verify that the user is a member of the group
    const { count, error: memberCheckError } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('group_id', groupId);
      
    if (memberCheckError) {
      console.error('Error checking group membership:', memberCheckError);
      return { error: memberCheckError, message: 'Erro ao verificar a associação ao grupo' };
    }
    
    if (!count || count === 0) {
      return { error: new Error('User is not a member of this group'), message: 'Usuário não é membro deste grupo' };
    }
    
    // Check if the user already checked in today
    const { data: hasCheckedIn, error: checkInError } = await supabase.rpc(
      'has_checked_in_today',
      { user_uuid: userId }
    );
      
    if (checkInError) {
      console.error('Error checking existing check-in:', checkInError);
      return { error: checkInError, message: 'Erro ao verificar check-ins existentes' };
    }
    
    if (hasCheckedIn) {
      return { error: new Error('User already checked in today'), message: 'Usuário já fez check-in hoje' };
    }
    
    // Process photo upload
    let photoUrl = null;
    
    if (photoBase64) {
      // If photoBase64 is a string (base64), process it
      if (typeof photoBase64 === 'string') {
        // Convert base64 to blob
        const base64Response = await fetch(photoBase64);
        const blob = await base64Response.blob();
        
        // Create a File object from the blob
        const file = new File([blob], `check-in-${userId}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Upload the photo
        const fileName = `check-in/${groupId}/${userId}/${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('check-ins')
          .upload(fileName, file, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Error uploading check-in photo:', uploadError);
          // Continue without the photo if upload fails
        } else {
          const { data } = supabase.storage
            .from('check-ins')
            .getPublicUrl(fileName);
            
          photoUrl = data.publicUrl;
        }
      } else {
        // If photoBase64 is a File object, use it directly
        const fileName = `check-in/${groupId}/${userId}/${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('check-ins')
          .upload(fileName, photoBase64, {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Error uploading check-in photo:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('check-ins')
            .getPublicUrl(fileName);
            
          photoUrl = data.publicUrl;
        }
      }
    }
    
    // Insert check-in record
    const { data: checkInData, error } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        photo_url: photoUrl,
        group_id: groupId  // Add the group_id to associate check-in with the group
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating check-in:', error);
      return { error, message: 'Erro ao registrar check-in' };
    }
    
    // Update user streak
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('streak')
      .eq('id', userId)
      .single();
      
    if (!userError) {
      await supabase
        .from('app_users')
        .update({
          last_check_in: new Date().toISOString(),
          streak: (userData?.streak || 0) + 1
        })
        .eq('id', userId);
    }
    
    return { data: checkInData, error: null, message: 'Check-in realizado com sucesso' };
  } catch (err) {
    console.error('Error in checkInGroupMember function:', err);
    return { error: err, message: 'Erro inesperado ao fazer check-in' };
  }
};

export const createGroupPost = async ({ 
  groupId, 
  userId, 
  content, 
  imageFile 
}: { 
  groupId: string;
  userId: string;
  content: string;
  imageFile?: File;
}) => {
  try {
    let imageUrl = null;
    
    if (imageFile) {
      const fileName = `group-posts/${groupId}/${userId}/${Date.now()}.${imageFile.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('group-posts')
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { data: null, error: uploadError };
      }
      
      const { data } = supabase.storage
        .from('group-posts')
        .getPublicUrl(fileName);
      
      imageUrl = data.publicUrl;
    }
    
    const { data, error } = await supabase
      .from('group_posts')
      .insert({
        group_id: groupId,
        user_id: userId,
        content,
        image_url: imageUrl,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating group post:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in createGroupPost:', err);
    return { data: null, error: err };
  }
};

export const likeGroupPost = async (postId: string, userId: string) => {
  try {
    // Check if the user already liked the post
    const { data: existingLike, error: likeError } = await supabase
      .from('group_post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (likeError) {
      console.error('Error checking existing like:', likeError);
      return { data: null, error: likeError };
    }
    
    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('group_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Error unliking post:', deleteError);
        return { data: null, error: deleteError };
      }
      
      return { data: { liked: false }, error: null };
    } else {
      // Like the post
      const { data, error } = await supabase
        .from('group_post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error liking post:', error);
        return { data: null, error };
      }
      
      return { data: { liked: true }, error: null };
    }
  } catch (err) {
    console.error('Unexpected error in likeGroupPost:', err);
    return { data: null, error: err };
  }
};

export const leaveGroup = async (userId: string, groupId: string) => {
  try {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);
    
    if (error) {
      console.error('Error leaving group:', error);
      return { error };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error in leaveGroup:', err);
    return { error: err };
  }
};

export const getGroupDetails = async (groupId: string, userId?: string) => {
  try {
    const { data, error } = await supabase
      .from('training_groups')
      .select(`
        id,
        name,
        description,
        creator_id,
        is_active,
        code
      `)
      .eq('id', groupId)
      .single();
    
    if (error) {
      console.error('Error fetching group details:', error);
      return { data: null, error };
    }
    
    if (!data) {
      return { data: null, error: new Error('Group not found') };
    }
    
    // If userId is provided, check if the user is a member of the group
    if (userId) {
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('group_id', groupId);
      
      if (memberError) {
        console.error('Error checking group membership:', memberError);
        return { data: null, error: memberError };
      }
      
      const isMember = memberData !== null;
      return { 
        data: { ...data, isMember }, 
        error: null 
      };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in getGroupDetails:', err);
    return { data: null, error: err };
  }
};

export const updateGroup = async (groupId: string, data: { name?: string; description?: string; is_active?: boolean }) => {
  try {
    const { error } = await supabase
      .from('training_groups')
      .update(data)
      .eq('id', groupId);
    
    if (error) {
      console.error('Error updating group:', error);
      return { error };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error in updateGroup:', err);
    return { error: err };
  }
};

export const generateNewInviteCode = async (groupId: string) => {
  try {
    // Generate a unique invite code
    const { data: generatedCode, error: codeError } = await supabase.rpc('generate_group_code');
    
    if (codeError) {
      console.error('Error generating invite code:', codeError);
      return { data: null, error: codeError };
    }
    
    const inviteCode = generatedCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase
      .from('training_groups')
      .update({ code: inviteCode })
      .eq('id', groupId);
    
    if (error) {
      console.error('Error updating invite code:', error);
      return { data: null, error };
    }
    
    return { data: { invite_code: inviteCode }, error: null };
  } catch (err) {
    console.error('Unexpected error in generateNewInviteCode:', err);
    return { data: null, error: err };
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    // Delete group members
    const { error: memberError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);
    
    if (memberError) {
      console.error('Error deleting group members:', memberError);
      return { error: memberError };
    }
    
    // Delete group posts
    const { error: postError } = await supabase
      .from('group_posts')
      .delete()
      .eq('group_id', groupId);
    
    if (postError) {
      console.error('Error deleting group posts:', postError);
      return { error: postError };
    }
    
    // Finally, delete the group
    const { error } = await supabase
      .from('training_groups')
      .delete()
      .eq('id', groupId);
    
    if (error) {
      console.error('Error deleting group:', error);
      return { error };
    }
    
    return { error: null };
  } catch (err) {
    console.error('Unexpected error in deleteGroup:', err);
    return { error: err };
  }
};
