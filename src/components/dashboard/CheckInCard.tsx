
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckInButton } from '@/components/CheckInButton';
import { toast } from 'sonner';

interface CheckInCardProps {
  userId: string;
  hasCheckedInToday: boolean;
  onCheckInSuccess: () => void;
}

export function CheckInCard({ userId, hasCheckedInToday, onCheckInSuccess }: CheckInCardProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CheckMate - Meu check-in da academia',
          text: 'Acabei de registrar minha presença na academia usando o CheckMate!',
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.section 
      className="mb-12"
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariants}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass-card overflow-hidden border border-border/40">
        <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Pronto para o treino de hoje?</h2>
          <p className="text-muted-foreground mb-6 md:mb-8 max-w-md">
            {hasCheckedInToday 
              ? "Você já fez check-in hoje. Volte amanhã!" 
              : "Registre sua presença na academia fazendo check-in abaixo"}
          </p>
          
          <CheckInButton 
            userId={userId} 
            onCheckInSuccess={onCheckInSuccess}
            hasCheckedInToday={hasCheckedInToday}
          />
          
          <div className="mt-6 md:mt-8 text-sm text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Os check-ins são reiniciados todos os dias à meia-noite
          </div>

          {hasCheckedInToday && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar meu check-in
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}
