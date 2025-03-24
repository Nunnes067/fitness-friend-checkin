
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser, getTodayCheckins } from '@/lib/supabase';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { CheckInCard } from '@/components/dashboard/CheckInCard';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { AdminControls } from '@/components/dashboard/AdminControls';
import { PartyCard } from '@/components/dashboard/PartyCard';
import { InstallPrompt } from '@/components/dashboard/InstallPrompt';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  // PWA install event listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install prompt after a short delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Check if the app was installed
  useEffect(() => {
    const handleAppInstalled = () => {
      // Hide the prompt when installed
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success('CheckMate instalado com sucesso!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
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
    // Reset check-in status and refresh data
    setHasCheckedInToday(false);
    setRefreshTrigger(prev => prev + 1);
  };

  // PWA install handler
  const handleInstallPWA = () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        toast.success('Aplicativo instalado com sucesso!');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    });
  };
  
  // Handle dismissing the install prompt
  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    // Remember that the user dismissed it to avoid showing again too soon
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout user={user}>
      <WelcomeHeader />
      
      {/* Add Admin Controls */}
      <AdminControls 
        userId={user?.id} 
        onActionComplete={handleAdminActionComplete} 
      />
      
      {/* Add Party Card */}
      <PartyCard
        userId={user?.id}
        hasCheckedInToday={hasCheckedInToday}
        onCheckInSuccess={handleCheckInSuccess}
      />
      
      <CheckInCard 
        userId={user?.id} 
        hasCheckedInToday={hasCheckedInToday}
        onCheckInSuccess={handleCheckInSuccess}
      />
      <DashboardTabs 
        refreshTrigger={refreshTrigger}
        userId={user?.id}
      />
      
      {/* Add Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt 
          deferredPrompt={deferredPrompt}
          onInstall={handleInstallPWA}
          onDismiss={handleDismissInstall}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
