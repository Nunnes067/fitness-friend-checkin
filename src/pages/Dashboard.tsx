
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser, getTodayCheckins, signOut } from '@/lib/supabase';
import { CheckInButton } from '@/components/CheckInButton';
import { UserList } from '@/components/UserList';
import { WeeklyRanking } from '@/components/WeeklyRanking';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { LogOut, User, Calendar, Settings } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (!currentUser) {
          // Not logged in, redirect to login page
          navigate('/');
          return;
        }
        
        setUser(currentUser);
        
        // Check if user has already checked in today
        const { data } = await getTodayCheckins();
        if (data) {
          const userCheckIn = data.find((item: any) => item.user_id === currentUser.id);
          setHasCheckedInToday(!!userCheckIn);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        toast.error('Session expired', {
          description: 'Please log in again',
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Sign out failed');
    }
  };
  
  const handleCheckInSuccess = () => {
    setHasCheckedInToday(true);
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="glass border-b border-border/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedLogo size="sm" />
            <h1 className="text-xl font-semibold tracking-tight">CheckMate</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              {user?.email}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <section className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to CheckMate</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track your gym attendance, stay motivated, and compete with friends - all in one place.
            </p>
          </section>
          
          <section className="mb-12">
            <Card className="glass-card overflow-hidden border border-border/40">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold mb-6">Ready for today's workout?</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {hasCheckedInToday 
                    ? "You've already checked in for today. Come back tomorrow!" 
                    : "Record your gym attendance by checking in below"}
                </p>
                
                <CheckInButton 
                  userId={user.id} 
                  onCheckInSuccess={handleCheckInSuccess}
                  hasCheckedInToday={hasCheckedInToday}
                />
                
                <div className="mt-8 text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Check-ins reset every day at midnight
                </div>
              </CardContent>
            </Card>
          </section>
          
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <UserList refreshTrigger={refreshTrigger} />
            <WeeklyRanking />
          </section>
        </div>
      </main>
      
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          CheckMate - Your daily gym companion
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
