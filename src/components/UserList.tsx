
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getTodayCheckins } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function UserList({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCheckins = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getTodayCheckins();
        
        if (error) {
          console.error('Error fetching checkins:', error);
          return;
        }
        
        if (data) {
          setUsers(data as User[]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
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
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
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
        <CardTitle className="text-xl">Today's Check-ins</CardTitle>
        <CardDescription>
          {users.length > 0 
            ? `${users.length} member${users.length === 1 ? '' : 's'} checked in today`
            : 'No one has checked in yet today'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px] pr-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {users.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  Be the first to check in today!
                </div>
              )}
              
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage 
                        src={user.profiles?.avatar_url || ''} 
                        alt={user.profiles?.username || 'User'} 
                      />
                      <AvatarFallback>
                        {getInitials(user.profiles?.username || user.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium leading-none">
                        {user.profiles?.username || 'Anonymous User'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getTimeAgo(user.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    Checked In
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
