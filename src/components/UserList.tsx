
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getTodayCheckins } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';  // Added the missing import for cn utility

interface User {
  id: string;
  timestamp: string;
  user_id: string;
  app_users: {
    id: string;
    name: string;
    email: string;
    photo_url: string | null;
  } | null;
}

export function UserList({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchCheckins = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getTodayCheckins();
        
        if (error) {
          console.error('Erro ao buscar check-ins:', error);
          return;
        }
        
        if (data) {
          // Type assertion to make TypeScript happy
          setUsers(data as unknown as User[]);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCheckins();
  }, [refreshTrigger]);
  
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const checkinTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - checkinTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h atrás`;
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
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <Card className="glass-card w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Check-ins de Hoje</CardTitle>
        <CardDescription>
          {users.length > 0 
            ? `${users.length} membro${users.length === 1 ? '' : 's'} registrou presença hoje`
            : 'Ninguém fez check-in ainda hoje'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn("pr-4", isMobile ? "h-[320px]" : "h-[380px]")}>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {users.length === 0 && (
                <motion.div 
                  className="py-8 text-center text-muted-foreground"
                  variants={itemVariants}
                >
                  Seja o primeiro a fazer check-in hoje!
                </motion.div>
              )}
              
              {users.map((user) => (
                <motion.div 
                  key={user.id} 
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage 
                        src={user.app_users?.photo_url || ''} 
                        alt={user.app_users?.email || 'Usuário'} 
                      />
                      <AvatarFallback>
                        {getInitials(user.app_users?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium leading-none truncate max-w-[120px] md:max-w-full">
                        {user.app_users?.email || 'Usuário Anônimo'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getTimeAgo(user.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    Registrado
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
