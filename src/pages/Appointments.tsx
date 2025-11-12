import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser, getUserRole } from '@/lib/supabase';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { CreateAppointmentForm } from '@/components/appointments/CreateAppointmentForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';

const Appointments = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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
  
  const handleAppointmentCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isTrainer = userRole === 'personal' || userRole === 'admin';

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consultas</h1>
            <p className="text-muted-foreground">
              {isTrainer ? 'Gerencie suas consultas com clientes' : 'Suas consultas agendadas'}
            </p>
          </div>
        </div>

        {isTrainer ? (
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments">Minhas Consultas</TabsTrigger>
              <TabsTrigger value="create">Agendar Nova</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments" className="mt-6">
              <AppointmentsList 
                userId={user?.id} 
                userRole={userRole}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
            
            <TabsContent value="create" className="mt-6">
              <CreateAppointmentForm 
                trainerId={user?.id} 
                onSuccess={handleAppointmentCreated}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <AppointmentsList 
            userId={user?.id} 
            userRole={userRole}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
