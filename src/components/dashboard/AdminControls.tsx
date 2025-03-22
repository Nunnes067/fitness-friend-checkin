
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCcw, User, Users, AlertCircle } from 'lucide-react';
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
import { isAdmin, removeAllTodayCheckIns, removeAllUserCheckIns } from '@/lib/admin';

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

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin(userId);
      setIsUserAdmin(adminStatus);
    };
    
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]);

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
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-amber-400 border w-full flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Gerenciar Usuário Específico
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerenciar Usuário</DialogTitle>
                  <DialogDescription>
                    Selecione as ações para um usuário específico (NÃO IMPLEMENTADO - SERÁ FEITO NA PRÓXIMA ATUALIZAÇÃO)
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-amber-500">Esta funcionalidade será implementada na próxima atualização.</p>
                </div>
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
