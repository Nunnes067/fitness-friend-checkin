import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CirclePlus, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { CreateGroupForm } from './CreateGroupForm';
import { JoinGroupForm } from './JoinGroupForm';
import { MyGroupsList } from './MyGroupsList';
import { getUserRole } from '@/lib/supabase';

interface GroupsManagementProps {
  userId: string;
}

export function GroupsManagement({ userId }: GroupsManagementProps) {
  const [activeTab, setActiveTab] = useState<string>('my-groups');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { role, error } = await getUserRole(userId);
        
        if (error) throw error;
        
        setUserRole(role);
      } catch (err) {
        console.error('Error fetching user role:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRole();
  }, [userId]);
  
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setActiveTab('my-groups');
    toast.success('Grupo criado com sucesso');
  };
  
  const handleJoinSuccess = () => {
    setShowJoinForm(false);
    setActiveTab('my-groups');
    toast.success('Você entrou no grupo');
  };
  
  const isPersonal = userRole === 'personal' || userRole === 'admin';
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos de Treino</h1>
          <p className="text-muted-foreground mt-1">
            Participe de grupos para treinar com outras pessoas e compartilhar sua jornada
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          {isPersonal && (
            <Button
              onClick={() => {
                setShowCreateForm(true);
                setShowJoinForm(false);
              }}
              className="gap-1"
            >
              <CirclePlus className="h-4 w-4" />
              Criar Grupo
            </Button>
          )}
          
          <Button
            variant={isPersonal ? "outline" : "default"}
            onClick={() => {
              setShowJoinForm(true);
              setShowCreateForm(false);
            }}
            className="gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Entrar em Grupo
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="my-groups" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Meus Grupos
          </TabsTrigger>
          <TabsTrigger value="all-groups" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Todos os Grupos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-groups" className="space-y-4 mt-4">
          {showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Grupo</CardTitle>
                <CardDescription>
                  Preencha as informações abaixo para criar um novo grupo de treino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateGroupForm 
                  userId={userId}
                />
              </CardContent>
            </Card>
          ) : showJoinForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Entrar em um Grupo</CardTitle>
                <CardDescription>
                  Digite o código de convite para entrar em um grupo de treino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JoinGroupForm 
                  userId={userId}
                />
              </CardContent>
            </Card>
          ) : (
            <MyGroupsList 
              userId={userId} 
              onCreateClick={() => {
                setShowCreateForm(true);
                setShowJoinForm(false);
              }}
              onJoinClick={() => {
                setShowJoinForm(true);
                setShowCreateForm(false);
              }}
              setActiveTab={setActiveTab}
            />
          )}
        </TabsContent>
        
        <TabsContent value="all-groups" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Grupos</CardTitle>
              <CardDescription>
                Listagem de todos os grupos ativos na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
