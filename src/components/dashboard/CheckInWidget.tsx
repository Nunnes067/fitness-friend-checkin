import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Share2, Sparkles } from 'lucide-react';
import { CheckInButton } from '@/components/CheckInButton';
import { toast } from 'sonner';

interface CheckInWidgetProps {
  userId: string;
  hasCheckedInToday: boolean;
  onCheckInSuccess: () => void;
}

export function CheckInWidget({ userId, hasCheckedInToday, onCheckInSuccess }: CheckInWidgetProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CheckMate - Meu check-in',
          text: 'Acabei de registrar minha presença na academia!',
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className={`glass-card overflow-hidden transition-all duration-500 ${
        hasCheckedInToday 
          ? 'border-success/50 bg-success/5' 
          : 'border-primary/30'
      }`}>
        <CardContent className="p-5">
          <AnimatePresence mode="wait">
            {hasCheckedInToday ? (
              <motion.div
                key="checked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </motion.div>
                
                <h3 className="text-lg font-bold text-success mb-1">Check-in Realizado!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você já treinou hoje. Volte amanhã!
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="not-checked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Pronto para treinar?</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-5">
                  Registre sua presença na academia
                </p>
                
                <CheckInButton 
                  userId={userId} 
                  onCheckInSuccess={onCheckInSuccess}
                  hasCheckedInToday={hasCheckedInToday}
                />
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Reset à meia-noite</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
