
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Medal, Trophy, Award } from 'lucide-react';
import { getWeeklyRanking } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface RankingUser {
  userId: string;
  count: number;
  profile: {
    id: string;
    name: string;
    email: string;
    photo_url: string | null;
  } | null;
}

export function WeeklyRanking() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getWeeklyRanking();
        
        if (error) {
          console.error('Erro ao buscar ranking:', error);
          return;
        }
        
        if (data) {
          setRanking(data as RankingUser[]);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRanking();
  }, []);
  
  const getRankIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-slate-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-sm text-muted-foreground font-mono">{position + 1}</span>;
    }
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) return name.slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <Card className="glass-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Ranking Semanal</CardTitle>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
        <CardDescription>
          Membros mais constantes desta semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn("pr-4", isMobile ? "h-[220px]" : "h-[280px]")}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse-light">Carregando ranking...</div>
            </div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {ranking.length === 0 && (
                <motion.div 
                  className="py-8 text-center text-muted-foreground"
                  variants={itemVariants}
                >
                  Nenhum check-in registrado esta semana
                </motion.div>
              )}
              
              {ranking.map((user, index) => (
                <motion.div 
                  key={user.userId} 
                  className={cn(
                    "flex items-center justify-between py-3 px-3 rounded-lg transition-colors",
                    index < 3 ? "bg-secondary/80" : "hover:bg-secondary/50"
                  )}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-8 w-8">
                      {getRankIcon(index)}
                    </div>
                    
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage 
                        src={user.profile?.photo_url || ''} 
                        alt={user.profile?.name || 'Usuário'} 
                      />
                      <AvatarFallback>
                        {getInitials(user.profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="font-medium truncate max-w-[120px] md:max-w-full">
                      {user.profile?.name || 'Usuário Anônimo'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 font-mono">
                    <span className="text-lg font-bold">{user.count}</span>
                    <span className="text-xs text-muted-foreground">
                      check-in{user.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
