import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser, getTodayCheckins, getUserRole } from '@/lib/supabase';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { AdminControls } from '@/components/dashboard/AdminControls';
import { PartyCard } from '@/components/dashboard/PartyCard';
import { InstallPrompt } from '@/components/dashboard/InstallPrompt';
import { QuickWorkoutCard } from '@/components/dashboard/QuickWorkoutCard';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { CheckInWidget } from '@/components/dashboard/CheckInWidget';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { motion } from 'framer-motion';
import { Sparkles, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  
  // Detect iOS and show custom install prompt
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone === true;
    
    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true);
      setTimeout(() => {
        const lastPrompt = localStorage.getItem('installPromptDismissed');
        if (!lastPrompt || Date.now() - Number(lastPrompt) > 24 * 60 * 60 * 1000) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    }
  }, []);
  
  // PWA install event listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        const lastPrompt = localStorage.getItem('installPromptDismissed');
        if (!lastPrompt || Date.now() - Number(lastPrompt) > 24 * 60 * 60 * 1000) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);
  
  // Check if app was installed
  useEffect(() => {
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success('CheckMate instalado com sucesso!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (!currentUser) {
          navigate('/');
          return;
        }
        
        setUser(currentUser);
        
        const { role } = await getUserRole(currentUser.id);
        setUserRole(role);
        
        const { data } = await getTodayCheckins();
        if (data) {
          const userCheckIn = data.find((item: any) => item.user_id === currentUser.id);
          setHasCheckedInToday(!!userCheckIn);
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        toast.error('Sessão expirada', {
          description: 'Por favor, faça login novamente',
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, refreshTrigger]);
  
  const handleCheckInSuccess = () => {
    setHasCheckedInToday(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAdminActionComplete = () => {
    setHasCheckedInToday(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleInstallPWA = () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        toast.success('Aplicativo instalado com sucesso!');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    });
  };
  
  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  const isProfessional = userRole === 'personal' || userRole === 'admin';

  return (
    <DashboardLayout user={user}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Olá,</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Bem-vindo de volta!
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-warning" />
            <span>Pronto para treinar</span>
          </div>
        </div>
      </motion.div>
      
      {/* Admin Controls */}
      <AdminControls 
        userId={user?.id} 
        onActionComplete={handleAdminActionComplete} 
      />
      
      {/* Professional Quick Access */}
      {isProfessional && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <Button 
            onClick={() => navigate('/groups')}
            className="w-full justify-between h-12"
            variant="outline"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              Gerenciar Grupos de Treino
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Workout Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Workout Card */}
          <QuickWorkoutCard />
          
          {/* Stats Overview */}
          <StatsOverview />
          
          {/* Party Card */}
          <PartyCard
            userId={user?.id}
            hasCheckedInToday={hasCheckedInToday}
            onCheckInSuccess={handleCheckInSuccess}
          />
        </div>
        
        {/* Right Column - Check-in & Activity */}
        <div className="space-y-6">
          {/* Check-in Widget */}
          <CheckInWidget 
            userId={user?.id} 
            hasCheckedInToday={hasCheckedInToday}
            onCheckInSuccess={handleCheckInSuccess}
          />
          
          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
      
      {/* Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt 
          deferredPrompt={deferredPrompt}
          onInstall={handleInstallPWA}
          onDismiss={handleDismissInstall}
          isIOS={isIOS}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
