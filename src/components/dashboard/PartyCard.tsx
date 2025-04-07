
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCurrentParty,
} from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { PartyForm } from './party/PartyForm';
import { PartyDetails } from './party/PartyDetails';

interface PartyCardProps {
  userId: string;
  hasCheckedInToday: boolean;
  onCheckInSuccess: () => void;
}

export function PartyCard({ userId, hasCheckedInToday, onCheckInSuccess }: PartyCardProps) {
  const [currentParty, setCurrentParty] = useState<any>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check for existing party on mount
  useEffect(() => {
    fetchCurrentParty();
  }, [userId]);
  
  // Set up realtime subscription for party status changes
  useEffect(() => {
    if (!currentParty) return;
    
    console.log("Setting up realtime subscription for party status:", currentParty.id);
    
    const channel = supabase
      .channel(`party-status-${currentParty.id}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'parties',
        filter: `id=eq.${currentParty.id}`
      }, (payload: any) => {
        console.log("Realtime update received for party status:", payload);
        
        // Check if party was deactivated or checked in
        if (payload.new && (
          payload.new.is_active !== currentParty.is_active ||
          payload.new.checked_in !== currentParty.checked_in
        )) {
          if (!payload.new.is_active) {
            // Party was canceled
            setCurrentParty(null);
            toast.info('A party foi cancelada pelo criador');
          } else if (payload.new.checked_in && !currentParty.checked_in) {
            // Check-in was done
            onCheckInSuccess();
            toast.success('Check-in realizado pelo criador da party!', {
              icon: <PartyPopper className="h-4 w-4 text-yellow-500" />,
              duration: 5000,
            });
            // Update local state
            setCurrentParty({...currentParty, checked_in: true});
          } else {
            // Outra atualização, buscar dados atualizados
            fetchCurrentParty();
          }
        }
      })
      .subscribe();
    
    return () => {
      console.log("Cleaning up party status subscription");
      supabase.removeChannel(channel);
    };
  }, [currentParty, onCheckInSuccess]);
  
  const fetchCurrentParty = async () => {
    try {
      setLoading(true);
      const { data, error } = await getCurrentParty(userId);
      if (error) {
        console.error('Error fetching current party:', error);
        return;
      }
      
      console.log("Current party data:", data);
      setCurrentParty(data);
      if (data) {
        setIsCreator(data.creator_id === userId);
      } else {
        setIsCreator(false);
      }
    } catch (err) {
      console.error("Unexpected error in fetchCurrentParty:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePartyCreated = (party: any) => {
    setCurrentParty(party);
    setIsCreator(party.creator_id === userId);
  };
  
  const handlePartyLeft = () => {
    setCurrentParty(null);
    setIsCreator(false);
  };
  
  // If user is already in a party, show party details
  if (currentParty) {
    return (
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card overflow-hidden border border-border/40">
          <CardContent className="p-6 md:p-8">
            <PartyDetails
              currentParty={currentParty}
              userId={userId}
              isCreator={isCreator}
              hasCheckedInToday={hasCheckedInToday}
              onPartyLeft={handlePartyLeft}
              onCheckInSuccess={onCheckInSuccess}
            />
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
          <PartyForm
            userId={userId}
            hasCheckedInToday={hasCheckedInToday}
            onPartyCreated={handlePartyCreated}
          />
        </CardContent>
      </Card>
    </motion.section>
  );
}
