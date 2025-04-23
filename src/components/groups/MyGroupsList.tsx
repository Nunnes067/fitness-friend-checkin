
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserGroups, leaveGroup } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, Plus, Calendar, LogOut, Settings, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface MyGroupsListProps {
  userId: string;
  onCreateClick: () => void;
  onJoinClick: () => void;
  setActiveTab: (tab: string) => void;
}

export function MyGroupsList({ userId, onCreateClick, onJoinClick, setActiveTab }: MyGroupsListProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await getUserGroups(userId);
        
        if (error) throw error;
        
        setGroups(data || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Erro ao carregar seus grupos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, [userId]);
  
  const handleGroupClick = (groupId: string) => {
    navigate(`/groups?id=${groupId}`);
  };
  
  const handleLeaveGroup = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    
    try {
      const confirmed = window.confirm('Tem certeza que deseja sair deste grupo?');
      
      if (!confirmed) return;
      
      const { error } = await leaveGroup(userId, groupId);
      
      if (error) {
        throw error;
      }
      
      setGroups(groups.filter(group => group.id !== groupId));
      toast.success('Você saiu do grupo');
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast.error(error.message || 'Erro ao sair do grupo');
    }
  };
  
  const handleShareGroup = (e: React.MouseEvent, group: any) => {
    e.stopPropagation();
    
    if (!group.invite_code) {
      toast.error('Apenas o criador pode compartilhar o código de convite');
      return;
    }
    
    // Copy invite code to clipboard
    navigator.clipboard.writeText(group.invite_code)
      .then(() => {
        toast.success('Código de convite copiado!', {
          description: `Compartilhe o código: ${group.invite_code}`
        });
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
        toast('Código de convite:', {
          description: group.invite_code
        });
      });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meus Grupos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onJoinClick}>
            <Users className="w-4 h-4 mr-2" />
            Entrar
          </Button>
          <Button size="sm" onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="h-36 animate-pulse">
              <CardContent className="flex items-center justify-center h-full">
                <div className="w-full h-4 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum grupo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não participa de nenhum grupo de treino
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onJoinClick}>
                Entrar em um grupo
              </Button>
              <Button onClick={onCreateClick}>
                <Plus className="w-4 h-4 mr-2" />
                Criar grupo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="cursor-pointer hover:bg-accent/5 transition-colors"
                onClick={() => handleGroupClick(group.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{group.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {group.description || 'Sem descrição'}
                      </p>
                    </div>
                    {group.is_creator && (
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        Criador
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Desde {format(new Date(group.joined_at), "d MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={group.creator_photo} />
                      <AvatarFallback>{group.creator_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">
                      Criado por {group.creator_name || 'Usuário'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {group.member_count} {group.member_count === 1 ? 'membro' : 'membros'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex justify-between w-full">
                    {group.is_creator ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/groups?id=${group.id}&settings=true`);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurações
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleLeaveGroup(e, group.id)}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sair
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!group.is_creator}
                      onClick={(e) => handleShareGroup(e, group)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Compartilhar
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
