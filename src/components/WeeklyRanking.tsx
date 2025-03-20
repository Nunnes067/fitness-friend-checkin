
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Medal, Trophy, Award } from 'lucide-react';
import { getWeeklyRanking } from '@/lib/supabase';
import { cn } from '@/lib/utils';

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
  
  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getWeeklyRanking();
        
        if (error) {
          console.error('Error fetching ranking:', error);
          return;
        }
        
        if (data) {
          setRanking(data as RankingUser[]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
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

  return (
    <Card className="glass-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Weekly Leaderboard</CardTitle>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
        <CardDescription>
          Most consistent members this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse-light">Loading ranking...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {ranking.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No check-ins recorded this week
                </div>
              )}
              
              {ranking.map((user, index) => (
                <div 
                  key={user.userId} 
                  className={cn(
                    "flex items-center justify-between py-3 px-3 rounded-lg transition-colors",
                    index < 3 ? "bg-secondary/80" : "hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-8 w-8">
                      {getRankIcon(index)}
                    </div>
                    
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage 
                        src={user.profile?.photo_url || ''} 
                        alt={user.profile?.name || 'User'} 
                      />
                      <AvatarFallback>
                        {getInitials(user.profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="font-medium">
                      {user.profile?.name || 'Anonymous User'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 font-mono">
                    <span className="text-lg font-bold">{user.count}</span>
                    <span className="text-xs text-muted-foreground">
                      check-in{user.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
