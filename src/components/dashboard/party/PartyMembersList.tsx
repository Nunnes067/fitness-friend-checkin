
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPartyMembers, supabase } from '@/lib/supabase';

interface PartyMembersListProps {
  partyId: string;
  creatorId: string;
}

export function PartyMembersList({ partyId, creatorId }: PartyMembersListProps) {
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPartyMembers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching members for party:', partyId);
      const { data, error } = await getPartyMembers(partyId);
      
      if (error) {
        console.error('Error fetching party members:', error);
        setError('Não foi possível carregar os membros');
        setPartyMembers([]);
        return;
      }
      
      console.log('Party members data:', data);
      setPartyMembers(data || []);
      setError(null);
    } catch (err) {
      console.error("Unexpected error in fetchPartyMembers:", err);
      setError('Erro ao carregar participantes');
      setPartyMembers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (partyId) {
      fetchPartyMembers();
    }
  }, [partyId]);
  
  useEffect(() => {
    if (!partyId) return;
    
    // Configurar inscrição em tempo real para atualizações de membros
    console.log("Setting up realtime subscription for party members:", partyId);
    
    const channel = supabase
      .channel(`party-members-${partyId}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'party_members',
        filter: `party_id=eq.${partyId}`
      }, (payload) => {
        console.log("Realtime update received for party members:", payload);
        fetchPartyMembers();
      })
      .subscribe();
    
    return () => {
      console.log("Cleaning up realtime subscription for party members");
      supabase.removeChannel(channel);
    };
  }, [partyId]);
  
  if (isLoading) {
    return (
      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
        <div className="text-center py-4 text-muted-foreground text-sm">
          Carregando participantes...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
        <div className="text-center py-4 text-rose-500 text-sm">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Users className="h-4 w-4 mr-2" />
        Participantes ({partyMembers.length})
      </h3>
      
      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
        <AnimatePresence>
          {partyMembers.length > 0 ? (
            partyMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center p-2 rounded-md bg-background/40 border border-border/40"
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage 
                    src={member.app_users?.photo_url} 
                    alt={member.app_users?.name || 'Usuário'} 
                  />
                  <AvatarFallback>
                    {member.app_users?.name?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.app_users?.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(member.joined_at), "'Entrou às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {member.user_id === creatorId && (
                  <Badge variant="secondary" className="ml-auto text-xs">Criador</Badge>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Nenhum participante ainda
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
