
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, getTodayCheckins, signOut } from '@/lib/supabase';
import { CheckInButton } from '@/components/CheckInButton';
import { UserList } from '@/components/UserList';
import { WeeklyRanking } from '@/components/WeeklyRanking';
import { ProgressTracking } from '@/components/ProgressTracking';
import { WorkoutForm } from '@/components/WorkoutForm';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { LogOut, User, Calendar, Settings, Share2, Camera, Dumbbell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('check-in');
  const isMobile = useIsMobile();
  
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
  }, [navigate]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Erro ao sair:', err);
      toast.error('Falha ao sair');
    }
  };
  
  const handleCheckInSuccess = () => {
    setHasCheckedInToday(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CheckMate - Meu check-in da academia',
          text: 'Acabei de registrar minha presença na academia usando o CheckMate!',
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light">Carregando painel...</div>
      </div>
    );
  }

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="glass border-b border-border/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedLogo size="sm" />
            <h1 className="text-xl font-semibold tracking-tight">CheckMate</h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hidden md:flex"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              {user?.email}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              title="Perfil"
              className="md:hidden"
            >
              <User className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <motion.section 
            className="mb-12 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo ao CheckMate</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acompanhe sua presença na academia, mantenha-se motivado e compare com amigos - tudo em um só lugar.
            </p>
          </motion.section>
          
          <motion.section 
            className="mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card overflow-hidden border border-border/40">
              <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Pronto para o treino de hoje?</h2>
                <p className="text-muted-foreground mb-6 md:mb-8 max-w-md">
                  {hasCheckedInToday 
                    ? "Você já fez check-in hoje. Volte amanhã!" 
                    : "Registre sua presença na academia fazendo check-in abaixo"}
                </p>
                
                <CheckInButton 
                  userId={user.id} 
                  onCheckInSuccess={handleCheckInSuccess}
                  hasCheckedInToday={hasCheckedInToday}
                />
                
                <div className="mt-6 md:mt-8 text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Os check-ins são reiniciados todos os dias à meia-noite
                </div>

                {hasCheckedInToday && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShare}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar meu check-in
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.section>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="check-in" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Check-ins</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                <span>Progresso</span>
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex items-center">
                <Dumbbell className="h-4 w-4 mr-2" />
                <span>Treinos</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="check-in" className="m-0">
              <motion.section 
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariants}
              >
                <motion.div 
                  variants={fadeInUpVariants}
                  transition={{ delay: 0.3 }}
                >
                  <UserList refreshTrigger={refreshTrigger} />
                </motion.div>
                <motion.div 
                  variants={fadeInUpVariants}
                  transition={{ delay: 0.4 }}
                >
                  <WeeklyRanking />
                </motion.div>
              </motion.section>
            </TabsContent>
            
            <TabsContent value="progress" className="m-0">
              <motion.section 
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariants}
              >
                <ProgressTracking userId={user.id} />
              </motion.section>
            </TabsContent>
            
            <TabsContent value="workout" className="m-0">
              <motion.section 
                initial="hidden"
                animate="visible"
                variants={fadeInUpVariants}
              >
                <WorkoutForm />
              </motion.section>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          CheckMate - Seu companheiro diário na academia
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
