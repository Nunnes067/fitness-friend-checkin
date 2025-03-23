import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, Users, Hash, LogOut, 
  CheckSquare, Copy, Share2, X, 
  PartyPopper, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  createParty, 
  joinParty, 
  getPartyMembers,
  getCurrentParty,
  leaveParty,
  cancelParty,
  partyCheckIn
} from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PartyCardProps {
  userId: string;
  hasCheckedInToday: boolean;
  onCheckInSuccess: () => void;
}

export function PartyCard({ userId, hasCheckedInToday, onCheckInSuccess }: PartyCardProps) {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [partyCode, setPartyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentParty, setCurrentParty] = useState<any>(null);
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  
  // Check for existing party on mount
  useEffect(() => {
    fetchCurrentParty();
  }, [userId]);
  
  // Set up realtime subscription for party members
  useEffect(() => {
    if (!currentParty) return;
    
    // Set up realtime subscription
    const channel = supabase
      .channel('party-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'party_members',
        filter: `party_id=eq.${currentParty.id}`
      }, (payload) => {
        // Refresh members list
        fetchPartyMembers();
      })
      .subscribe();
    
    // Fetch initial members
    fetchPartyMembers();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentParty]);
  
  // Also listen for party status changes
  useEffect(() => {
    if (!currentParty) return;
    
    const channel = supabase
      .channel('party-status-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'parties',
        filter: `id=eq.${currentParty.id}`
      }, (payload: any) => {
        // Update current party if status changed
        if (payload.new && (
          payload.new.is_active !== currentParty.is_active ||
          payload.new.checked_in !== currentParty.checked_in
        )) {
          fetchCurrentParty();
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentParty]);
  
  const fetchCurrentParty = async () => {
    const { data, error } = await getCurrentParty(userId);
    if (error) {
      console.error('Error fetching current party:', error);
      return;
    }
    
    setCurrentParty(data);
    if (data) {
      setIsCreator(data.creator_id === userId);
    } else {
      setIsCreator(false);
    }
  };
  
  const fetchPartyMembers = async () => {
    if (!currentParty) return;
    
    const { data, error } = await getPartyMembers(currentParty.id);
    if (error) {
      console.error('Error fetching party members:', error);
      return;
    }
    
    setPartyMembers(data || []);
  };
  
  const handleCreateParty = async () => {
    if (hasCheckedInToday) {
      toast.error('Você já fez check-in hoje');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await createParty(userId);
      if (error) {
        toast.error('Erro ao criar grupo', {
          description: error.message,
        });
        return;
      }
      
      setCurrentParty(data);
      setIsCreator(true);
      toast.success('Grupo criado com sucesso!', {
        description: 'Compartilhe o código com seus amigos.'
      });
    } catch (err) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinParty = async () => {
    if (!partyCode.trim()) {
      toast.error('Digite o código do grupo');
      return;
    }
    
    if (hasCheckedInToday) {
      toast.error('Você já fez check-in hoje');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error, message } = await joinParty(userId, partyCode);
      
      if (error) {
        toast.error('Erro ao entrar no grupo', {
          description: message || error.message,
        });
        return;
      }
      
      setCurrentParty(data);
      setIsCreator(data?.creator_id === userId);
      toast.success(message || 'Você entrou no grupo!');
      setPartyCode('');
    } catch (err) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLeaveParty = async () => {
    if (!currentParty) return;
    
    setLoading(true);
    try {
      const { error } = await leaveParty(userId, currentParty.id);
      if (error) {
        toast.error('Erro ao sair do grupo', {
          description: error.message,
        });
        return;
      }
      
      // If the user is not the creator, just leave
      if (!isCreator) {
        setCurrentParty(null);
        setPartyMembers([]);
        toast.success('Você saiu do grupo');
      } else {
        // If creator, offer to cancel the whole party
        const { error, message } = await cancelParty(currentParty.id, userId);
        if (error) {
          toast.error('Erro ao cancelar o grupo', {
            description: message || error.message,
          });
          return;
        }
        
        setCurrentParty(null);
        setPartyMembers([]);
        toast.success(message || 'Grupo cancelado com sucesso');
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
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
    
    setLoading(true);
    try {
      const { error, message } = await partyCheckIn(currentParty.id, userId);
      if (error) {
        toast.error('Erro ao fazer check-in do grupo', {
          description: message || error.message,
        });
        return;
      }
      
      toast.success(message || 'Check-in de grupo realizado com sucesso!', {
        icon: <PartyPopper className="h-4 w-4 text-yellow-500" />,
      });
      
      // Trigger parent component refresh
      onCheckInSuccess();
    } catch (err) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };
  
  // If user is already in a party, show party details
  if (currentParty) {
    const expiresAt = new Date(currentParty.expires_at);
    const timeRemaining = expiresAt.getTime() - new Date().getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return (
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card overflow-hidden border border-border/40">
          <CardContent className="p-6 md:p-8">
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
                disabled={loading}
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
              <p className="text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3 inline mr-1" />
                Expira em {hoursRemaining}h {minutesRemaining}min
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Participantes ({partyMembers.length}/{currentParty.max_members})
              </h3>
              
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {partyMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center p-2 rounded-md bg-background/40 border border-border/40"
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.app_users.photo_url} alt={member.app_users.name} />
                        <AvatarFallback>
                          {member.app_users.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.app_users.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(member.joined_at), "'Entrou às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {member.user_id === currentParty.creator_id && (
                        <Badge variant="secondary" className="ml-auto text-xs">Criador</Badge>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {partyMembers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Carregando participantes...
                  </div>
                )}
              </div>
            </div>
            
            {isCreator && (
              <Button 
                className="w-full py-6"
                size="lg"
                onClick={handlePartyCheckIn}
                disabled={loading || partyMembers.length === 0}
              >
                <CheckSquare className="mr-2 h-5 w-5" />
                Fazer Check-in do Grupo ({partyMembers.length} pessoas)
              </Button>
            )}
            
            {!isCreator && (
              <Alert className="bg-secondary/30">
                <AlertDescription className="text-center text-sm">
                  Aguarde o criador da Party iniciar o check-in do grupo.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.section>
    );
  }
  
  // Otherwise, show the create/join options
  return (
    <motion.section 
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card overflow-hidden border border-border/40">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
            Party de Treino
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-center">
            Treine junto com seus amigos e registrem presença em grupo
          </p>
          
          <div className="flex items-center border-b border-border/40 mb-6">
            <button 
              className={`flex-1 py-3 px-1 text-center font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'join' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent hover:border-border/60'
              }`}
              onClick={() => setActiveTab('join')}
            >
              Entrar em uma Party
            </button>
            <button 
              className={`flex-1 py-3 px-1 text-center font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'create' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent hover:border-border/60'
              }`}
              onClick={() => setActiveTab('create')}
            >
              Criar nova Party
            </button>
          </div>
          
          {/* Join Party */}
          {activeTab === 'join' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="party-code" className="block text-sm font-medium">
                  Código da Party
                </label>
                <div className="flex gap-2">
                  <Input
                    id="party-code"
                    placeholder="Digite o código de 6 dígitos"
                    value={partyCode}
                    onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="flex-1 font-mono text-center uppercase"
                  />
                  <Button 
                    onClick={handleJoinParty}
                    disabled={loading || !partyCode.trim() || hasCheckedInToday}
                  >
                    Entrar
                  </Button>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Peça o código para o amigo que criou a Party
              </div>
            </div>
          )}
          
          {/* Create Party */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground mb-4">
                Crie uma nova Party e convide seus amigos para treinar juntos. 
                Você receberá um código de 6 dígitos para compartilhar.
              </p>
              
              <Button 
                className="w-full"
                size="lg"
                onClick={handleCreateParty}
                disabled={loading || hasCheckedInToday}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Criar Nova Party
              </Button>
              
              {hasCheckedInToday && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>
                    Você já fez check-in hoje. Não é possível criar ou participar de um grupo.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}
