
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trash, RefreshCcw, User, Users, AlertCircle, Shield, UserCog, 
  Ban, Award, RotateCw, Smartphone, Gift, Trophy, Medal 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  isAdmin, 
  removeAllTodayCheckIns, 
  removeAllUserCheckIns, 
  getAllUsers,
  setUserAdminStatus,
  banUser,
  unbanUser,
  removeCheckInFromRanking,
  addAchievementToUser,
  runPrizeWheelDraw
} from '@/lib/admin';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getWeeklyRanking, getTodayCheckins } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PrizeWheel } from '@/components/dashboard/PrizeWheel';

interface AdminControlsProps {
  userId: string;
  onActionComplete: () => void;
}

export function AdminControls({ userId, onActionComplete }: AdminControlsProps) {
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [weeklyRanking, setWeeklyRanking] = useState<any[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<any[]>([]);
  const [prizeWheelOpen, setPrizeWheelOpen] = useState(false);
  const [prizeWheelData, setPrizeWheelData] = useState<{
    winner: any,
    eligibleCount: number,
    spinning: boolean
  }>({
    winner: null,
    eligibleCount: 0,
    spinning: false
  });
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin(userId);
      setIsUserAdmin(adminStatus);
    };
    
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          user => 
            user.name?.toLowerCase().includes(query) || 
            user.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getAllUsers();
      
      if (error) {
        toast.error('Erro ao carregar usuários', {
          description: error.message
        });
        return;
      }
      
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      toast.error('Erro inesperado', {
        description: 'Não foi possível carregar os usuários'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeeklyRanking = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getWeeklyRanking();
      
      if (error) {
        console.error('Erro ao buscar ranking:', error);
        return;
      }
      
      setWeeklyRanking(data || []);
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayCheckins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getTodayCheckins();
      
      if (error) {
        console.error('Erro ao buscar check-ins:', error);
        return;
      }
      
      setTodayCheckins(data || []);
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userManagementOpen) {
      loadUsers();
    }
  }, [userManagementOpen]);

  const handleRemoveAllTodayCheckIns = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await removeAllTodayCheckIns();
      
      if (error) {
        toast.error('Erro ao remover check-ins', {
          description: error.message
        });
        return;
      }
      
      const count = data?.length || 0;
      toast.success(`${count} check-ins removidos com sucesso!`);
      onActionComplete();
      setConfirmDialogOpen(false);
    } catch (err) {
      toast.error('Erro inesperado', {
        description: 'Não foi possível remover os check-ins'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUserCheckIns = async () => {
    if (!targetUserId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await removeAllUserCheckIns(targetUserId);
      
      if (error) {
        toast.error('Erro ao remover check-ins do usuário', {
          description: error.message
        });
        return;
      }
      
      const count = data?.length || 0;
      toast.success(`${count} check-ins do usuário removidos com sucesso!`);
      onActionComplete();
      setConfirmDialogOpen(false);
    } catch (err) {
      toast.error('Erro inesperado', {
        description: 'Não foi possível remover os check-ins do usuário'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const { data, error } = await setUserAdminStatus(userId, !currentStatus);
      
      if (error) {
        toast.error('Erro ao atualizar status de administrador', {
          description: error.message
        });
        return;
      }
      
      toast.success(`Status de administrador atualizado com sucesso!`);
      
      // Update local users list
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: !currentStatus ? 'admin' : 'user' } 
          : user
      ));
    } catch (err) {
      toast.error('Erro inesperado', {
        description: 'Não foi possível atualizar o status de administrador'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBanUser = async (userId: string, isBanned: boolean) => {
    setIsLoading(true);
    try {
      const { data, error } = isBanned 
        ? await unbanUser(userId)
        : await banUser(userId);
      
      if (error) {
        toast.error(`Erro ao ${isBanned ? 'desbanir' : 'banir'} usuário`, {
          description: error.message
        });
        return;
      }
      
      toast.success(`Usuário ${isBanned ? 'desbanido' : 'banido'} com sucesso!`);
      
      // Update local users list
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_banned: !isBanned } 
          : user
      ));
    } catch (err) {
      toast.error('Erro inesperado', {
        description: `Não foi possível ${isBanned ? 'desbanir' : 'banir'} o usuário`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromRanking = async (userId: string) => {
    setIsLoading(true);
    try {
      // Find all check-ins for this user in the weekly ranking
      const userCheckIns = todayCheckins.filter(checkin => checkin.user_id === userId);
      
      if (userCheckIns.length === 0) {
        toast.error('Não foi possível encontrar check-ins para este usuário');
        return;
      }
      
      // Remove from ranking
      for (const checkin of userCheckIns) {
        await removeCheckInFromRanking(checkin.id);
      }
      
      toast.success('Usuário removido do ranking com sucesso!');
      
      // Refresh data
      loadWeeklyRanking();
      onActionComplete();
    } catch (err) {
      toast.error('Erro inesperado', {
        description: 'Não foi possível remover o usuário do ranking'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePWAShortcut = () => {
    // Show instructions on how to add to homescreen
    toast.info('Como adicionar o aplicativo na tela inicial', {
      description: 'No iOS: use o Safari, toque no botão de compartilhar e selecione "Adicionar à Tela de Início". No Android: toque nos três pontos do navegador e selecione "Adicionar à tela inicial".',
      duration: 8000,
    });
  };

  const handleRunPrizeWheel = async () => {
    setPrizeWheelData({
      ...prizeWheelData,
      spinning: true
    });
    
    try {
      const { winner, error, eligibleCount } = await runPrizeWheelDraw();
      
      if (error) {
        toast.error('Erro ao sortear ganhador', {
          description: error.message
        });
        return;
      }
      
      // Simulate spinning for 3 seconds
      setTimeout(() => {
        setPrizeWheelData({
          winner,
          eligibleCount,
          spinning: false
        });
        
        if (winner) {
          toast.success(`Sorteio realizado com sucesso!`, {
            description: `O ganhador é: ${winner.name || 'Usuário'}`
          });
        } else {
          toast.error('Não foi possível determinar um ganhador', {
            description: 'Não há usuários elegíveis (com 7+ check-ins)'
          });
        }
      }, 3000);
      
    } catch (err) {
      toast.error('Erro inesperado', {
        description: 'Não foi possível realizar o sorteio'
      });
      setPrizeWheelData({
        ...prizeWheelData,
        spinning: false
      });
    }
  };

  const triggerAction = (action: string, userId?: string) => {
    setCurrentAction(action);
    if (userId) {
      setTargetUserId(userId);
    }
    setConfirmDialogOpen(true);
  };

  const executeCurrentAction = () => {
    switch (currentAction) {
      case 'removeAllToday':
        handleRemoveAllTodayCheckIns();
        break;
      case 'removeUserAll':
        handleRemoveUserCheckIns();
        break;
      default:
        setConfirmDialogOpen(false);
    }
  };

  if (!isUserAdmin) {
    return null;
  }

  return (
    <div className="mb-8">
      <Card className="border-amber-400 border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Controles de Administrador
          </CardTitle>
          <CardDescription>
            Funcionalidades exclusivas para administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Button 
              variant="destructive" 
              className="w-full flex items-center gap-2"
              onClick={() => triggerAction('removeAllToday')}
            >
              <Trash className="h-4 w-4" />
              Remover Todos Check-ins de Hoje
            </Button>
            
            <Button 
              variant="outline" 
              className="border-amber-400 border w-full flex items-center gap-2"
              onClick={() => setPrizeWheelOpen(true)}
            >
              <Gift className="h-4 w-4" />
              Roleta de Sorteio (7+ Check-ins)
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="border-amber-400 border w-full flex items-center gap-2"
              onClick={() => setUserManagementOpen(true)}
            >
              <UserCog className="h-4 w-4" />
              Gerenciar Usuários
            </Button>
            
            <Button 
              variant="outline" 
              className="border-amber-400 border w-full flex items-center gap-2"
              onClick={handleCreatePWAShortcut}
            >
              <Smartphone className="h-4 w-4" />
              Adicionar à Tela Inicial (PWA)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prize Wheel Dialog */}
      <Dialog open={prizeWheelOpen} onOpenChange={setPrizeWheelOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Roleta de Sorteio</DialogTitle>
            <DialogDescription>
              Sorteia um ganhador entre membros com 7+ check-ins nos últimos 7 dias
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 flex flex-col items-center">
            <PrizeWheel 
              spinning={prizeWheelData.spinning}
              onSpin={handleRunPrizeWheel}
              winner={prizeWheelData.winner}
              eligibleCount={prizeWheelData.eligibleCount}
            />
            
            {prizeWheelData.winner && !prizeWheelData.spinning && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-center">
                <h3 className="text-lg font-bold text-green-800">Parabéns!</h3>
                <div className="flex items-center justify-center mt-2 gap-3">
                  <Avatar className="h-12 w-12 border-2 border-green-500">
                    <AvatarImage 
                      src={prizeWheelData.winner.photo_url || ''} 
                      alt={prizeWheelData.winner.name} 
                    />
                    <AvatarFallback>
                      {prizeWheelData.winner.name?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-bold text-green-700">{prizeWheelData.winner.name}</p>
                    <p className="text-sm text-green-600">{prizeWheelData.winner.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setPrizeWheelOpen(false)}
              variant="outline"
            >
              Fechar
            </Button>
            <Button 
              onClick={handleRunPrizeWheel}
              disabled={prizeWheelData.spinning}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {prizeWheelData.spinning ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Sorteando...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Girar Roleta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={userManagementOpen} onOpenChange={setUserManagementOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciamento de Usuários</DialogTitle>
            <DialogDescription>
              Gerencie os usuários e seus privilégios de administrador
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="users" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Lista de Usuários</TabsTrigger>
              <TabsTrigger value="admins">Gerenciar Administradores</TabsTrigger>
              <TabsTrigger value="ranking">Gerenciar Ranking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={loadUsers}
                  disabled={isLoading}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-md">
                {filteredUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name || '—'}</TableCell>
                          <TableCell>{user.email || '—'}</TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-medium">
                                Admin
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
                                Usuário
                              </span>
                            )}
                            {user.is_banned && (
                              <span className="bg-red-100 text-red-800 ml-1 px-2 py-1 rounded-md text-xs font-medium">
                                Banido
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => triggerAction('removeUserAll', user.id)}
                                className="h-8"
                                title="Remover todos check-ins"
                              >
                                <Trash className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleBanUser(user.id, user.is_banned)}
                                className={cn(
                                  "h-8",
                                  user.is_banned ? "text-green-600" : "text-red-600"
                                )}
                                title={user.is_banned ? "Desbanir usuário" : "Banir usuário"}
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFromRanking(user.id)}
                                className="h-8"
                                title="Remover do ranking semanal"
                              >
                                <Trophy className="h-3.5 w-3.5 text-amber-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="admins" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Ative ou desative privilégios de administrador para usuários. Administradores podem gerenciar check-ins e outros usuários.
              </p>
              
              <div className="border rounded-md">
                {filteredUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Administrador</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name || '—'}</TableCell>
                          <TableCell>{user.email || '—'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={user.role === 'admin'}
                                onCheckedChange={() => handleToggleAdminStatus(user.id, user.role === 'admin')}
                                disabled={isLoading}
                              />
                              <Label>
                                {user.role === 'admin' ? 'Ativo' : 'Inativo'}
                              </Label>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ranking" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ranking Semanal</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadWeeklyRanking}
                  disabled={isLoading}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
              
              <div className="border rounded-md">
                <ScrollArea className="h-[400px]">
                  {weeklyRanking.length > 0 ? (
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Posição</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Check-ins</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weeklyRanking.map((item, index) => (
                          <TableRow key={item.userId}>
                            <TableCell>
                              <div className="flex items-center justify-center h-8 w-8">
                                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                                {index === 1 && <Medal className="h-5 w-5 text-slate-400" />}
                                {index === 2 && <Award className="h-5 w-5 text-amber-700" />}
                                {index > 2 && <span className="text-muted-foreground font-mono">{index + 1}</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage 
                                    src={item.profile?.photo_url || ''} 
                                    alt={item.profile?.name || 'Usuário'} 
                                  />
                                  <AvatarFallback>
                                    {item.profile?.name?.substring(0, 2).toUpperCase() || '??'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{item.profile?.name || 'Usuário Anônimo'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                title="Remover do ranking"
                                onClick={() => handleRemoveFromRanking(item.userId)}
                              >
                                <Trash className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {isLoading ? 'Carregando ranking...' : 'Nenhum usuário no ranking semanal.'}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              {currentAction === 'removeAllToday' && 
                'Tem certeza que deseja remover TODOS os check-ins de hoje? Esta ação não pode ser desfeita.'}
              {currentAction === 'removeUserAll' && 
                'Tem certeza que deseja remover TODOS os check-ins deste usuário? Esta ação não pode ser desfeita.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={executeCurrentAction}
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
