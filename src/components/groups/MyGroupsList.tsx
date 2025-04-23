
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserGroups, leaveGroup } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, Star, MessageSquare, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupFeed } from './GroupFeed';
import { GroupSettings } from './GroupSettings';

interface MyGroupsListProps {
  userId: string;
  isPersonal: boolean;
}

export function MyGroupsList({ userId, isPersonal }: MyGroupsListProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'settings'>('feed');
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await getUserGroups(userId);
        
        if (error) {
          throw error;
        }
        
        setGroups(data || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Erro ao carregar grupos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, [userId]);

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (confirm(`Tem certeza que deseja sair do grupo "${groupName}"?`)) {
      try {
        const { error } = await leaveGroup(userId, groupId);
        
        if (error) throw error;
        
        setGroups(groups.filter(group => group.id !== groupId));
        toast.success(`Você saiu do grupo "${groupName}"`);
        
        if (selectedGroupId === groupId) {
          setSelectedGroupId(null);
        }
      } catch (error) {
        console.error('Error leaving group:', error);
        toast.error('Erro ao sair do grupo');
      }
    }
  };
  
  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Renderizar grupo selecionado
  if (selectedGroupId) {
    const selectedGroup = groups.find(group => group.id === selectedGroupId);
    
    if (!selectedGroup) {
      // Se o grupo não for encontrado (foi removido)
      return (
        <div className="text-center py-8">
          <Button onClick={() => setSelectedGroupId(null)}>
            Voltar para meus grupos
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => setSelectedGroupId(null)} className="mr-2">
              &larr; Voltar
            </Button>
            <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
            {selectedGroup.is_creator && (
              <Badge className="ml-2">Personal</Badge>
            )}
          </div>
          
          <div className="space-x-2">
            <Button 
              variant={viewMode === 'feed' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('feed')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feed
            </Button>
            {selectedGroup.is_creator && (
              <Button 
                variant={viewMode === 'settings' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setViewMode('settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            )}
          </div>
        </div>
        
        {viewMode === 'feed' ? (
          <GroupFeed groupId={selectedGroupId} userId={userId} isCreator={selectedGroup.is_creator} />
        ) : (
          <GroupSettings groupId={selectedGroupId} userId={userId} />
        )}
      </div>
    );
  }
  
  // Renderizar lista de grupos
  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum grupo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {isPersonal 
                ? 'Crie um grupo para começar a gerenciar seus alunos'
                : 'Entre em um grupo usando o código de convite fornecido pelo seu personal trainer'}
            </p>
            <Button onClick={() => isPersonal ? setActiveTab('create') : setActiveTab('join')}>
              {isPersonal ? 'Criar grupo' : 'Entrar em um grupo'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          {groups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>
                        {group.member_count || 0} {group.member_count === 1 ? 'membro' : 'membros'}
                      </CardDescription>
                    </div>
                    {group.is_creator && (
                      <Badge className="bg-primary">Criador</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  {group.description && (
                    <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.creator_photo} alt={group.creator_name} />
                      <AvatarFallback>{group.creator_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{group.creator_name || 'Personal'}</p>
                      <p className="text-xs text-muted-foreground">Criador do grupo</p>
                    </div>
                  </div>
                  
                  {group.is_creator && (
                    <div className="bg-muted/50 p-2 rounded-md text-sm mt-2 flex items-center justify-between">
                      <span>Código de convite: <strong>{group.invite_code}</strong></span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-1">
                  <Button onClick={() => setSelectedGroupId(group.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ver Feed
                  </Button>
                  
                  {!group.is_creator && (
                    <Button 
                      variant="ghost" 
                      onClick={() => handleLeaveGroup(group.id, group.name)}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
