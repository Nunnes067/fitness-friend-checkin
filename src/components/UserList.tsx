
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getTodayCheckins } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  timestamp: string;
  photo_url?: string;
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
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  
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

  const openPhotoPreview = (photoUrl: string | undefined, userName: string | null) => {
    if (photoUrl) {
      setSelectedPhotoUrl(photoUrl);
      setSelectedUserName(userName);
    }
  };

  const closePhotoPreview = () => {
    setSelectedPhotoUrl(null);
    setSelectedUserName(null);
  };

  return (
    <>
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
                      <div 
                        className="relative cursor-pointer" 
                        onClick={() => openPhotoPreview(
                          user.photo_url || user.app_users?.photo_url || undefined,
                          user.app_users?.name
                        )}
                      >
                        <Avatar className="h-10 w-10 border border-border">
                          {user.photo_url ? (
                            <AvatarImage 
                              src={user.photo_url} 
                              alt="Check-in photo" 
                              className="object-cover"
                            />
                          ) : (
                            <AvatarImage 
                              src={user.app_users?.photo_url || ''} 
                              alt={user.app_users?.name || 'Usuário'} 
                            />
                          )}
                          <AvatarFallback>
                            {getInitials(user.app_users?.name)}
                          </AvatarFallback>
                        </Avatar>
                        {user.photo_url && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border border-background" />
                        )}
                      </div>
                      
                      <div>
                        <div className="font-medium leading-none truncate max-w-[120px] md:max-w-full">
                          {user.app_users?.name || 'Usuário'}
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

      {/* Dialog for photo preview */}
      <Dialog open={!!selectedPhotoUrl} onOpenChange={() => closePhotoPreview()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Foto de check-in de {selectedUserName || 'Usuário'}</DialogTitle>
            <DialogDescription>
              Foto registrada durante o check-in
            </DialogDescription>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={closePhotoPreview}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex justify-center items-center py-4">
            {selectedPhotoUrl && (
              <img 
                src={selectedPhotoUrl} 
                alt="Check-in" 
                className="max-h-[60vh] max-w-full rounded-md object-contain" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
