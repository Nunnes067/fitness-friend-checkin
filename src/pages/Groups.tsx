
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/supabase';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { GroupsManagement } from '@/components/groups/GroupsManagement';

const Groups = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout user={user}>
      <GroupsManagement userId={user?.id} />
    </DashboardLayout>
  );
};

export default Groups;
