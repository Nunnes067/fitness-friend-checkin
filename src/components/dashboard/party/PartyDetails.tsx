
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Hash, LogOut, CheckSquare, Copy, Share2, X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PartyMembersList } from './PartyMembersList';
import { leaveParty, cancelParty, partyCheckIn } from '@/lib/supabase';
import { PartyTimeRemaining } from './PartyTimeRemaining';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import { PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  // Photo handling functions
  const openPhotoDialog = () => {
    if (hasCheckedInToday) {
      toast.info("Você já fez check-in hoje!", {
        description: "Volte amanhã para seu próximo check-in."
      });
      return;
    }
    
    setShowPhotoDialog(true);
  };
  
  const closePhotoDialog = () => {
    setShowPhotoDialog(false);
    setPhotoPreview(null);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview of the selected photo
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePartyCheckIn = async () => {
    if (!currentParty || !photoPreview) {
      toast.error('Por favor, tire uma foto para fazer o check-in do grupo');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Performing party check-in for party:", currentParty.id);
      
      // Make sure we pass the full party object to include all member data
      const { error, message } = await partyCheckIn(currentParty.id, userId, photoPreview);
      
      if (error) {
        console.error("Party check-in error:", error);
        toast.error('Erro ao fazer check-in do grupo', {
          description: message || error.message,
        });
        return;
      }
      
      toast.success(message || 'Check-in de grupo realizado com sucesso!', {
        icon: <PartyPopper className="h-4 w-4 text-yellow-500" />,
        duration: 5000,
      });
      
      // Close the dialog
      closePhotoDialog();
      
      // Trigger parent component refresh
      onCheckInSuccess();
    } catch (err) {
      console.error("Error during party check-in:", err);
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setIsLoading(false);
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
      
      <Alert className="mb-6">
        <AlertDescription className="text-center text-sm">
          <p className="mb-2">Novo! Agora você pode criar grupos permanentes para check-ins!</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/groups" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Ir para Grupos
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
      
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
          onClick={openPhotoDialog}
          disabled={hasCheckedInToday || currentParty.checked_in}
        >
          <CheckSquare className="mr-2 h-5 w-5" />
          {currentParty.checked_in 
            ? "Check-in já realizado" 
            : "Fazer Check-in do Grupo com Foto"}
        </Button>
      )}
      
      {!isCreator && (
        <Alert className="bg-secondary/30">
          <AlertDescription className="text-center text-sm">
            {currentParty.checked_in 
              ? "Este grupo já realizou check-in hoje!" 
              : "Aguarde o criador da Party iniciar o check-in do grupo."}
          </AlertDescription>
        </Alert>
      )}
      
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in em Grupo</DialogTitle>
            <DialogDescription>
              Tire uma foto para confirmar a presença de todos do grupo na academia. 
              Todos os membros do grupo receberão o check-in automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="mx-auto rounded-md max-h-60 object-cover" 
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  onClick={() => setPhotoPreview(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-md p-12 text-center cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique para tirar ou selecionar uma foto</p>
              </div>
            )}
            
            <Input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden"
              onChange={handleFileChange}
            />
            
            <Button
              variant="outline"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              {photoPreview ? "Tirar outra foto" : "Selecionar foto da galeria"}
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closePhotoDialog}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handlePartyCheckIn}
              disabled={!photoPreview || isLoading}
            >
              {isLoading ? "Processando..." : "Confirmar Check-in do Grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
