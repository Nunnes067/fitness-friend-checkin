
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Hash, LogOut, CheckSquare, Copy, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PartyMembersList } from './PartyMembersList';
import { leaveParty, cancelParty, partyCheckIn } from '@/lib/supabase';
import { PartyTimeRemaining } from './PartyTimeRemaining';

interface PartyDetailsProps {
  currentParty: any;
  userId: string;
  isCreator: boolean;
  hasCheckedInToday: boolean;
  onPartyLeft: () => void;
  onCheckInSuccess: () => void;
}

export function PartyDetails({ 
  currentParty, 
  userId, 
  isCreator, 
  hasCheckedInToday, 
  onPartyLeft,
  onCheckInSuccess 
}: PartyDetailsProps) {
  const handleLeaveParty = async () => {
    if (!currentParty) return;
    
    try {
      console.log("Leaving/canceling party:", currentParty.id, "isCreator:", isCreator);
      
      // If the user is not the creator, just leave
      if (!isCreator) {
        const { error } = await leaveParty(userId, currentParty.id);
        if (error) {
          toast.error('Erro ao sair do grupo', {
            description: error.message,
          });
          return;
        }
        
        onPartyLeft();
        toast.success('Você saiu do grupo');
      } else {
        // If creator, cancel the whole party
        const { error, message } = await cancelParty(currentParty.id, userId);
        if (error) {
          toast.error('Erro ao cancelar o grupo', {
            description: message || error.message,
          });
          return;
        }
        
        onPartyLeft();
        toast.success(message || 'Grupo cancelado com sucesso');
      }
    } catch (err) {
      console.error("Error leaving/canceling party:", err);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  const handleCopyCode = () => {
    if (!currentParty) return;
    
    navigator.clipboard.writeText(currentParty.code);
    toast.success('Código copiado para a área de transferência');
  };
  
  const handleShareParty = async () => {
    if (!currentParty) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CheckMate - Treino em grupo',
          text: `Junte-se ao meu grupo de treino usando o código: ${currentParty.code}`,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        handleCopyCode();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };
  
  const handlePartyCheckIn = async () => {
    if (!currentParty || !isCreator) return;
    
    try {
      console.log("Performing party check-in for party:", currentParty.id);
      const { error, message } = await partyCheckIn(currentParty.id, userId);
      if (error) {
        toast.error('Erro ao fazer check-in do grupo', {
          description: message || error.message,
        });
        return;
      }
      
      toast.success(message || 'Check-in de grupo realizado com sucesso!');
      
      // Trigger parent component refresh
      onCheckInSuccess();
    } catch (err) {
      console.error("Error during party check-in:", err);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Party de Treino
            {isCreator && (
              <Badge variant="outline" className="ml-2 bg-primary/10">
                Criador
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">
            Treino em grupo com amigos
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLeaveParty}
          className="hover:bg-destructive/10 hover:text-destructive"
          title={isCreator ? "Cancelar Party" : "Sair da Party"}
        >
          {isCreator ? (
            <X className="h-4 w-4" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="p-4 bg-card/50 rounded-lg border border-border/60 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Hash className="h-4 w-4 text-primary mr-2" />
            <span className="text-xl font-mono font-bold tracking-wider">
              {currentParty.code}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleCopyCode}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleShareParty}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <PartyTimeRemaining expiresAt={currentParty.expires_at} />
      </div>
      
      <PartyMembersList 
        partyId={currentParty.id} 
        creatorId={currentParty.creator_id} 
      />
      
      {isCreator && (
        <Button 
          className="w-full py-6"
          size="lg"
          onClick={handlePartyCheckIn}
          disabled={hasCheckedInToday}
        >
          <CheckSquare className="mr-2 h-5 w-5" />
          Fazer Check-in do Grupo
        </Button>
      )}
      
      {!isCreator && (
        <Alert className="bg-secondary/30">
          <AlertDescription className="text-center text-sm">
            Aguarde o criador da Party iniciar o check-in do grupo.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
