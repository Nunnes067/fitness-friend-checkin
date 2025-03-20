
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { checkIn } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CheckInButtonProps {
  userId: string;
  onCheckInSuccess: () => void;
  hasCheckedInToday: boolean;
}

export function CheckInButton({ userId, onCheckInSuccess, hasCheckedInToday }: CheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleCheckIn = async () => {
    if (hasCheckedInToday) {
      toast.info("Você já fez check-in hoje!", {
        description: "Volte amanhã para seu próximo check-in."
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error, alreadyCheckedIn } = await checkIn(userId);
      
      if (error) {
        toast.error('Falha no check-in', {
          description: error.message,
        });
        return;
      }
      
      if (alreadyCheckedIn) {
        toast.info("Você já fez check-in hoje!", {
          description: "Volte amanhã para seu próximo check-in."
        });
        return;
      }
      
      // Show success animation
      setShowSuccess(true);
      
      // Reset after animation completes
      setTimeout(() => {
        setShowSuccess(false);
        
        // Show success toast
        toast.success('Check-in realizado com sucesso!', {
          description: "Sua presença na academia foi registrada hoje.",
          icon: <Trophy className="h-4 w-4 text-yellow-500" />,
        });
        
        // Trigger parent component refresh
        onCheckInSuccess();
      }, 2000);
      
    } catch (err) {
      toast.error('Ocorreu um erro inesperado');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {showSuccess && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
        >
          <CheckCircle className="h-16 w-16 text-green-500" />
        </motion.div>
      )}
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className={cn(
            "transition-all duration-500 h-16 px-8 rounded-full font-semibold",
            showSuccess ? "opacity-0" : "opacity-100",
            hasCheckedInToday ? "bg-secondary text-foreground hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"
          )}
          disabled={isLoading || showSuccess}
          onClick={handleCheckIn}
        >
          <Dumbbell className={cn(
            "mr-2 h-5 w-5 transition-transform duration-300",
            isLoading ? "animate-pulse" : ""
          )} />
          {hasCheckedInToday ? "Já registrou hoje" : "Fazer Check-in Agora"}
        </Button>
      </motion.div>
    </div>
  );
}
