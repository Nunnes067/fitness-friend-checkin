import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity,
  Clock
} from 'lucide-react';
import { getTodayCheckins } from '@/lib/supabase';

interface CheckIn {
  id: string;
  created_at: string;
  user_id: string;
  app_users: {
    id: string;
    name: string;
    email: string;
    photo_url: string | null;
  };
}

export function ActivityFeed() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const { data, error } = await getTodayCheckins();
        if (!error && data) {
          setCheckins(data as CheckIn[]);
        }
      } catch (err) {
        console.error('Error fetching checkins:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckins();
  }, []);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    return `${Math.floor(diffHours / 24)}d`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-4 pb-4">
          <div className="space-y-3">
            {checkins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum check-in hoje ainda</p>
              </div>
            ) : (
              checkins.map((checkin, index) => (
                <motion.div
                  key={checkin.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <Avatar className="h-9 w-9 border-2 border-background">
                    <AvatarImage src={checkin.app_users?.photo_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {getInitials(checkin.app_users?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {checkin.app_users?.name || 'Usuário'}
                      </span>
                      <Activity className="h-4 w-4 text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      fez check-in na academia
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(checkin.created_at)}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}