
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, MessageSquare, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getGroupFeed, getUserRole, getGroupMembers } from '@/lib/supabase/groups';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface GroupFeedProps {
  groupId: string;
  userId: string;
}

export default function GroupFeed({ groupId, userId }: GroupFeedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('user');
  const [activeTab, setActiveTab] = useState('feed');
  const [isGroupCreator, setIsGroupCreator] = useState(false);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const { role } = await getUserRole(userId);
        setUserRole(role);
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };
    
    loadUserRole();
  }, [userId]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getGroupFeed(groupId);
        
        if (error) {
          throw error;
        }
        
        setPosts(data || []);

        // Load group members
        const { data: membersData, error: membersError } = await getGroupMembers(groupId);
        
        if (membersError) {
          console.error('Error loading group members:', membersError);
        } else {
          setMembers(membersData || []);
          // Check if current user is the group creator
          const creator = membersData?.find(member => member.is_creator === true);
          setIsGroupCreator(creator?.user_id === userId);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading group feed:', err);
        toast.error('Erro ao carregar o feed do grupo');
        setIsLoading(false);
      }
    };

    if (groupId) {
      loadInitialData();
    }
  }, [groupId, userId]);

  const isPersonal = userRole === 'personal' || userRole === 'admin';
  const canManageMembers = isPersonal || userRole === 'admin' || isGroupCreator;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="feed" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            Membros
          </TabsTrigger>
          {canManageMembers && (
            <TabsTrigger value="manage" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Gerenciar
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="feed" className="space-y-6 mt-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center mb-4">
                  Nenhuma publicação neste grupo ainda. Seja o primeiro a compartilhar algo!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {post.user?.photo_url && (
                        <img 
                          src={post.user.photo_url} 
                          alt={post.user.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{post.user?.name || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    {post.content && <p className="mb-4">{post.content}</p>}
                    
                    {post.image_url && (
                      <img 
                        src={post.image_url} 
                        alt="Imagem do post" 
                        className="w-full h-auto rounded-md mb-4 max-h-96 object-contain"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4 mt-4">
          <Card>
            <CardContent className="py-6">
              <h3 className="text-lg font-medium mb-4">Membros do Grupo ({members.length})</h3>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.photo_url} />
                        <AvatarFallback>
                          {member.name?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground">
                          Entrou em {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {member.is_admin && (
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          Admin
                        </Badge>
                      )}
                      {member.is_creator && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Criador
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {canManageMembers && (
          <TabsContent value="manage" className="space-y-4 mt-4">
            <Card>
              <CardContent className="py-6">
                <h3 className="text-lg font-medium mb-4">Gerenciar Membros</h3>
                <p className="text-muted-foreground mb-4">
                  Como {isPersonal ? 'personal trainer' : 'administrador'}, você pode gerenciar os membros deste grupo.
                </p>
                
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.photo_url} />
                          <AvatarFallback>
                            {member.name?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name || 'Usuário'}</p>
                          <p className="text-xs text-muted-foreground">{member.email || ''}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!member.is_creator && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={member.is_admin ? "text-red-600" : "text-green-600"}
                            >
                              {member.is_admin ? "Remover Admin" : "Tornar Admin"}
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                            >
                              Remover
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Novo Membro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
