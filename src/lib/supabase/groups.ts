
import { supabase } from '@/integrations/supabase/client';

export const getUserGroups = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        id,
        is_admin,
        joined_at,
        training_groups:group_id (
          id,
          name,
          description,
          invite_code,
          creator_id,
          is_active,
          created_at
        ),
        group_id
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user groups:', error);
      return { data: null, error };
    }
    
    const groupPromises = data.map(async (membership) => {
      const group = membership.training_groups;
      const isCreator = group.creator_id === userId;
      
      const { count, error: countError } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', group.id);
      
      const { data: creatorData, error: creatorError } = await supabase
        .from('app_users')
        .select('name, photo_url')
        .eq('id', group.creator_id)
        .single();
      
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        invite_code: isCreator ? group.invite_code : null,
        is_creator: isCreator,
        is_admin: membership.is_admin,
        member_count: count || 0,
        joined_at: membership.joined_at,
        creator_name: creatorData?.name,
        creator_photo: creatorData?.photo_url
      };
    });
    
    const groups = await Promise.all(groupPromises);
    return { data: groups, error: null };
  } catch (err) {
    console.error('Unexpected error fetching user groups:', err);
    return { data: null, error: err };
  }
};

export const joinGroup = async (userId: string, inviteCode: string) => {
  try {
    const { data: group, error: groupError } = await supabase
      .from('training_groups')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('is_active', true)
      .single();
    
    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return { data: null, error: groupError, message: 'Código de convite inválido ou expirado' };
      }
      console.error('Error finding group:', groupError);
      return { data: null, error: groupError };
    }
    
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      console.error('Error checking group membership:', memberCheckError);
      return { data: null, error: memberCheckError };
    }
    
    if (existingMember) {
      return { data: group, error: null, message: 'Você já é membro deste grupo' };
    }
    
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        is_admin: false
      });
    
    if (joinError) {
      console.error('Error joining group:', joinError);
      return { data: null, error: joinError };
    }
    
    return { data: group, error: null, message: 'Você entrou no grupo!' };
  } catch (err) {
    console.error('Unexpected error joining group:', err);
    return { data: null, error: err };
  }
};

export const createGroup = async ({ name, description, creatorId }: { name: string, description: string, creatorId: string }) => {
  try {
    const { data: code, error: codeError } = await supabase.rpc('generate_group_code');
    
    if (codeError) {
      console.error('Error generating group code:', codeError);
      return { data: null, error: codeError };
    }
    
    const { data: group, error: groupError } = await supabase
      .from('training_groups')
      .insert({
        name,
        description,
        creator_id: creatorId,
        invite_code: code
      })
      .select()
      .single();
    
    if (groupError) {
      console.error('Error creating group:', groupError);
      return { data: null, error: groupError };
    }
    
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: creatorId,
        is_admin: true
      });
    
    if (memberError) {
      console.error('Error adding creator to group:', memberError);
      await supabase
        .from('training_groups')
        .delete()
        .eq('id', group.id);
      return { data: null, error: memberError };
    }
    
    return { data: group, error: null };
  } catch (err) {
    console.error('Unexpected error creating group:', err);
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
        user_id,
        group_id,
        user:user_id (
          id,
          name,
          photo_url
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (err) {
    console.error('Error fetching group feed:', err);
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
    
    const members = data.map(member => ({
      id: member.id,
      is_admin: member.is_admin,
      joined_at: member.joined_at,
      is_creator: false,
      ...(member.app_users ? {
        id: member.app_users.id,
        name: member.app_users.name,
        email: member.app_users.email,
        photo_url: member.app_users.photo_url
      } : {})
    }));
    
    return { data: members, error: null };
  } catch (err) {
    console.error('Error fetching group members:', err);
    return { data: null, error: err };
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
      const fileName = `group-post-${groupId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-posts')
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('group-posts')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData?.publicUrl;
    }

    const { data, error } = await supabase
      .from('group_posts')
      .insert({
        group_id: groupId,
        user_id: userId,
        content,
        image_url: imageUrl,
      })
      .select(`
        id,
        content,
        image_url,
        created_at,
        user_id,
        group_id,
        user:user_id (
          id,
          name,
          photo_url
        )
      `)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    console.error('Error creating group post:', err);
    return { data: null, error: err };
  }
};

export const likeGroupPost = async (postId: string, userId: string) => {
  try {
    const { data: existingLike, error: checkError } = await supabase
      .from('group_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from('group_post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (unlikeError) throw unlikeError;

      return { data: { liked: false }, error: null };
    }

    const { error: likeError } = await supabase
      .from('group_post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      });

    if (likeError) throw likeError;

    return { data: { liked: true }, error: null };
  } catch (err) {
    console.error('Error toggling post like:', err);
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
      
    return { error };
  } catch (err) {
    console.error('Error leaving group:', err);
    return { error: err };
  }
};

export const getGroupDetails = async (groupId: string, userId?: string) => {
  try {
    const { data, error } = await supabase
      .from('training_groups')
      .select('*')
      .eq('id', groupId)
      .single();
      
    if (error) {
      console.error('Error fetching group details:', error);
      return { data: null, error };
    }
    
    // Check if user is creator
    const isCreator = userId ? data.creator_id === userId : false;
    
    // Check if user is admin (if userId is provided)
    let isAdmin = false;
    if (userId) {
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('is_admin')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();
        
      if (membershipError && membershipError.code !== 'PGRST116') {
        console.error('Error checking user membership:', membershipError);
      } else if (!membershipError) {
        isAdmin = membership?.is_admin || false;
      }
    }
    
    return { 
      data: {
        ...data,
        is_creator: isCreator,
        is_admin: isAdmin
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Unexpected error fetching group details:', err);
    return { data: null, error: err };
  }
};

export const updateGroup = async (groupId: string, data: { name?: string; description?: string; is_active?: boolean }) => {
  try {
    const { data: updatedData, error } = await supabase
      .from('training_groups')
      .update(data)
      .eq('id', groupId)
      .select();
      
    if (error) {
      return { data: null, error };
    }
    
    return { data: updatedData[0], error: null };
  } catch (err) {
    console.error('Error updating group:', err);
    return { data: null, error: err };
  }
};

export const generateNewInviteCode = async (groupId: string) => {
  try {
    const { data: code, error: codeError } = await supabase.rpc('generate_group_code');
    
    if (codeError) {
      console.error('Error generating new invite code:', codeError);
      return { data: null, error: codeError };
    }
    
    const { error: updateError } = await supabase
      .from('training_groups')
      .update({ invite_code: code })
      .eq('id', groupId);
      
    if (updateError) {
      console.error('Error updating invite code:', updateError);
      return { data: null, error: updateError };
    }
    
    return { data: { invite_code: code }, error: null };
  } catch (err) {
    console.error('Unexpected error generating new invite code:', err);
    return { data: null, error: err };
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    // Delete group members first
    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);
      
    if (membersError) {
      console.error('Error deleting group members:', membersError);
      return { error: membersError };
    }
    
    // Then delete group
    const { error } = await supabase
      .from('training_groups')
      .delete()
      .eq('id', groupId);
      
    return { error };
  } catch (err) {
    console.error('Error deleting group:', err);
    return { error: err };
  }
};

export const getUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user role:', error);
      return { role: 'user', error };
    }
    
    return { role: data?.role || 'user', error: null };
  } catch (err) {
    console.error('Unexpected error fetching user role:', err);
    return { role: 'user', error: err };
  }
};
