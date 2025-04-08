
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { Activity, Watch, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { checkIn } from '@/lib/supabase';

interface SmartWatchViewProps {
  userId: string;
  hasCheckedInToday: boolean;
  onCheckInSuccess?: () => void;
}

export function SmartWatchView({ userId, hasCheckedInToday, onCheckInSuccess }: SmartWatchViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [watchConnected, setWatchConnected] = useState(false);
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Simulate watch connection
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWatchConnected(true);
      toast.success('Smartwatch conectado', {
        description: 'Seu dispositivo foi conectado com sucesso'
      });
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleCheckIn = async () => {
    if (hasCheckedInToday) return;
    
    setIsCheckingIn(true);
    
    try {
      const { error, alreadyCheckedIn } = await checkIn(userId);
      
      if (error) {
        toast.error('Erro ao fazer check-in', {
          description: error.message || 'Tente novamente mais tarde'
        });
        return;
      }
      
      if (alreadyCheckedIn) {
        toast.info('Você já fez check-in hoje');
        return;
      }
      
      toast.success('Check-in realizado com sucesso!', {
        icon: <Check className="h-4 w-4" />,
      });
      
      if (onCheckInSuccess) {
        onCheckInSuccess();
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Erro ao fazer check-in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="watch-container">
      <Card className="w-[170px] h-[220px] rounded-3xl bg-black text-white border-4 border-zinc-700 overflow-hidden shadow-xl">
        <CardContent className="flex flex-col items-center justify-center p-2 h-full">
          {/* Watch Status Bar */}
          <div className="w-full flex justify-between items-center mb-1 text-xs text-zinc-400">
            <span>
              {watchConnected ? 
                <Watch className="h-3 w-3 text-green-500" /> : 
                <Watch className="h-3 w-3 text-red-500 animate-pulse" />
              }
            </span>
            <span className="text-xs">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          
          <Separator className="bg-zinc-700 mb-3" />
          
          {/* Main Screen */}
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="text-center mb-3">
              <h3 className="text-sm font-bold">CheckMate</h3>
              <p className="text-xs text-zinc-400">Status:</p>
              
              {hasCheckedInToday ? (
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center mt-1"
                >
                  <Check className="h-10 w-10 text-green-500 mb-1" />
                  <span className="text-xs text-green-500 font-bold">REGISTRADO</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center mt-1"
                >
                  <AlertCircle className="h-10 w-10 text-yellow-500 mb-1" />
                  <span className="text-xs text-yellow-500 font-bold">PENDENTE</span>
                </motion.div>
              )}
            </div>
            
            <Button 
              size="sm"
              variant={hasCheckedInToday ? "outline" : "default"}
              onClick={handleCheckIn}
              disabled={isCheckingIn || hasCheckedInToday}
              className={`text-xs px-3 py-1 h-8 ${hasCheckedInToday ? 'border-green-500 text-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isCheckingIn ? (
                <span className="flex items-center">
                  <span className="mr-1 h-3 w-3 rounded-full bg-white animate-ping"></span>
                  Processando
                </span>
              ) : hasCheckedInToday ? (
                <span className="flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Concluído
                </span>
              ) : (
                <span className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Check-in
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
