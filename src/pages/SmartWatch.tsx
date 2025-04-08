
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Smartphone, Watch } from 'lucide-react';
import { SmartWatchView } from '@/components/smartwatch/SmartWatchView';
import { SmartWatchStats } from '@/components/smartwatch/SmartWatchStats';
import { getCurrentUser, getTodayCheckins } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';

const SmartWatch = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [activeScreen, setActiveScreen] = useState('main'); // 'main' or 'stats'
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (!currentUser) {
          navigate('/');
          return;
        }
        
        setUser(currentUser);
        
        // Get user data for stats
        const { data: userData, error: userError } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        if (!userError) {
          setUserData(userData);
        }
        
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
  }, [navigate]);
  
  const handleCheckInSuccess = () => {
    setHasCheckedInToday(true);
    
    // Update user data after check-in
    if (userData) {
      setUserData({
        ...userData,
        streak: (userData.streak || 0) + 1,
        last_check_in: new Date().toISOString()
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-lg font-semibold">Integração Smartwatch</h1>
        </div>
      </header>

      <main className="flex-1 container py-6 md:py-10">
        <div className="max-w-md mx-auto">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Watch className="h-6 w-6 mr-2 text-primary" />
                <h2 className="text-xl font-bold">CheckMate para Smartwatch</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Visualize e faça check-in diretamente do seu smartwatch com nossa interface otimizada para dispositivos wearable.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <Smartphone className="h-4 w-4 mr-1" /> 
                  Dispositivos compatíveis
                </h3>
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                  <li>Smartwatches com WearOS</li>
                  <li>Apple Watch (via aplicativo complementar)</li>
                  <li>Dispositivos FitBit com suporte a aplicativos</li>
                  <li>Samsung Galaxy Watch</li>
                </ul>
              </div>
              
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Prévia da interface do smartwatch:
                </p>
                
                <div className="relative mb-6">
                  <div className="flex flex-col items-center">
                    {activeScreen === 'main' ? (
                      <SmartWatchView 
                        userId={user?.id} 
                        hasCheckedInToday={hasCheckedInToday}
                        onCheckInSuccess={handleCheckInSuccess}
                      />
                    ) : (
                      <SmartWatchStats 
                        streak={userData?.streak || 0}
                        lastCheckInDate={userData?.last_check_in}
                        hasCheckedInToday={hasCheckedInToday}
                      />
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant={activeScreen === 'main' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setActiveScreen('main')}
                      >
                        Check-in
                      </Button>
                      <Button 
                        variant={activeScreen === 'stats' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setActiveScreen('stats')}
                      >
                        Estatísticas
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => toast.info('Em breve!', { 
                    description: 'O download para smartwatch estará disponível em breve.'
                  })}
                >
                  <Watch className="h-4 w-4 mr-2" />
                  Baixar para Smartwatch
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-sm text-center text-muted-foreground">
            <p>Para mais detalhes sobre a compatibilidade e instalação em dispositivos específicos, consulte nossa documentação.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SmartWatch;
