
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCcw, User, Users, AlertCircle, Shield, UserCog } from 'lucide-react';
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
  setUserAdminStatus
} from '@/lib/admin';

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="destructive" 
              className="w-full flex items-center gap-2"
              onClick={() => triggerAction('removeAllToday')}
            >
              <Trash className="h-4 w-4" />
              Remover Todos Check-ins de Hoje
            </Button>
            
            <Dialog open={userManagementOpen} onOpenChange={setUserManagementOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-amber-400 border w-full flex items-center gap-2"
                >
                  <UserCog className="h-4 w-4" />
                  Gerenciar Usuários
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gerenciamento de Usuários</DialogTitle>
                  <DialogDescription>
                    Gerencie os usuários e seus privilégios de administrador
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="users" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users">Lista de Usuários</TabsTrigger>
                    <TabsTrigger value="admins">Gerenciar Administradores</TabsTrigger>
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
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => triggerAction('removeUserAll', user.id)}
                                    className="h-8 mr-2"
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
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

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
