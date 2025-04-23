
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, UserCog, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreateGroupForm } from './CreateGroupForm';
import { MyGroupsList } from './MyGroupsList';
import { JoinGroupForm } from './JoinGroupForm';
import { getUserRole } from '@/lib/supabase';

interface GroupsManagementProps {
  userId: string;
}

export function GroupsManagement({ userId }: GroupsManagementProps) {
  const [activeTab, setActiveTab] = useState('my-groups');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPersonal, setIsPersonal] = useState(false);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userId) return;
      
      try {
        const { role } = await getUserRole(userId);
        setUserRole(role);
        setIsPersonal(role === 'personal' || role === 'admin');
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    fetchUserRole();
  }, [userId]);
  
  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeVariants}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grupos de Treino</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus grupos de treino e conecte-se com seus amigos e personal trainers
          </p>
        </div>
        
        {isPersonal && (
          <Button onClick={() => setActiveTab('create')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="my-groups">
            <Users className="h-4 w-4 mr-2" />
            Meus Grupos
          </TabsTrigger>
          <TabsTrigger value="join">
            <UserPlus className="h-4 w-4 mr-2" />
            Entrar em Grupo
          </TabsTrigger>
          {isPersonal && (
            <TabsTrigger value="create">
              <UserCog className="h-4 w-4 mr-2" />
              Criar Grupo
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="my-groups">
          <MyGroupsList userId={userId} isPersonal={isPersonal} />
        </TabsContent>
        
        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Entrar em um Grupo</CardTitle>
              <CardDescription>
                Digite o código de convite fornecido pelo personal trainer ou administrador do grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JoinGroupForm userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {isPersonal && (
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Grupo</CardTitle>
                <CardDescription>
                  Crie um grupo para gerenciar seus alunos e compartilhar conteúdo exclusivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateGroupForm userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
