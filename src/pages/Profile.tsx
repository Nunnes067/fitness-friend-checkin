
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser, updateProfile } from '@/lib/supabase';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronLeft, Save, User, Lock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';

const passwordSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    fullName: '',
    bio: '',
    avatarUrl: '',
    name: '',
  });
  
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (!currentUser) {
          navigate('/');
          return;
        }
        
        setUser(currentUser);
        
        // Fetch user profile from the app_users table
        const { data: userData, error } = await updateProfile(currentUser.id, {});
        
        if (!error && userData) {
          setProfile({
            username: currentUser.email?.split('@')[0] || '',
            fullName: userData?.name || '',
            name: userData?.name || currentUser.email?.split('@')[0] || '',
            bio: '',
            avatarUrl: userData?.photo_url || '',
          });
        } else {
          setProfile({
            username: currentUser.email?.split('@')[0] || '',
            fullName: '',
            name: currentUser.email?.split('@')[0] || '',
            bio: '',
            avatarUrl: '',
          });
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
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      
      // Update profile in Supabase
      const { error } = await updateProfile(user.id, {
        name: profile.name,
        photo_url: profile.avatarUrl,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Perfil atualizado', {
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error('Falha na atualização', {
        description: 'Não foi possível atualizar o perfil. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (data: z.infer<typeof passwordSchema>) => {
    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Senha atualizada', {
        description: 'Sua senha foi atualizada com sucesso.',
      });
      
      passwordForm.reset();
    } catch (err: any) {
      console.error('Password change error:', err);
      toast.error('Falha na atualização da senha', {
        description: err.message || 'Não foi possível atualizar a senha. Tente novamente.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return name.slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light">Loading profile...</div>
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <section className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Seu Perfil</h1>
            <p className="text-muted-foreground">
              Atualize suas informações pessoais
            </p>
          </section>
          
          <Card className="glass-card border border-border/40 mb-6">
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Como você aparece para outros membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <Avatar className="h-24 w-24 border border-border">
                  <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                  <AvatarFallback className="text-lg">
                    {profile.name ? getInitials(profile.name) : <User />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Seu nome completo"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Este nome aparecerá na lista de check-ins
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">URL da Foto</Label>
                    <Input
                      id="avatarUrl"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      placeholder="https://example.com/foto.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Uma breve descrição sobre você (opcional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seu endereço de email não pode ser alterado
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="glass-card border border-border/40">
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Atualize sua senha e configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Sua senha deve ter pelo menos 6 caracteres. Use uma combinação de letras, números e símbolos para maior segurança.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="w-full"
                    >
                      {isChangingPassword ? 'Atualizando senha...' : 'Atualizar Senha'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground mt-auto">
        <div className="container mx-auto">
          CheckMate - Seu companheiro diário da academia
        </div>
      </footer>
    </div>
  );
};

export default Profile;
