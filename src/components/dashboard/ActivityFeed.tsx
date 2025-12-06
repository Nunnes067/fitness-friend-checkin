import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Trophy,
  Flame,
  Dumbbell,
  Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  type: 'checkin' | 'workout' | 'achievement' | 'streak';
  time: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'checkin':
      return <Activity className="h-4 w-4 text-primary" />;
    case 'workout':
      return <Dumbbell className="h-4 w-4 text-accent" />;
    case 'achievement':
      return <Trophy className="h-4 w-4 text-warning" />;
    case 'streak':
      return <Flame className="h-4 w-4 text-destructive" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const defaultActivities: ActivityItem[] = [
  { id: '1', user: { name: 'João Silva' }, action: 'fez check-in', type: 'checkin', time: '2 min' },
  { id: '2', user: { name: 'Maria Santos' }, action: 'completou Leg Day', type: 'workout', time: '5 min' },
  { id: '3', user: { name: 'Pedro Costa' }, action: 'atingiu 30 dias de streak', type: 'streak', time: '12 min' },
  { id: '4', user: { name: 'Ana Oliveira' }, action: 'desbloqueou conquista', type: 'achievement', time: '20 min' },
  { id: '5', user: { name: 'Carlos Lima' }, action: 'fez check-in', type: 'checkin', time: '25 min' },
];

export function ActivityFeed({ activities = defaultActivities }: ActivityFeedProps) {
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
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Avatar className="h-9 w-9 border-2 border-background">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {activity.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {activity.user.name}
                    </span>
                    {getActivityIcon(activity.type)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.action}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
