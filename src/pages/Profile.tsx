import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Check, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (!currentUser) {
          navigate('/');
          return;
        }
        
        setUser(currentUser);
        setName(currentUser?.user_metadata?.name || '');
        setPhotoUrl(currentUser?.user_metadata?.avatar_url || '');
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
    } catch (error) {
      console.error('Erro ao fazer signout:', error);
      toast.error('Erro ao fazer signout');
    }
  };
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setUploading(true);
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error('Erro ao fazer upload da foto:', error);
          toast.error('Erro ao fazer upload da foto');
        } else {
          const publicUrl = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath).data.publicUrl;
            
          setPhotoUrl(publicUrl);
          toast.success('Foto de perfil atualizada com sucesso!');
        }
      } catch (err) {
        console.error('Erro inesperado ao fazer upload da foto:', err);
        toast.error('Erro inesperado ao fazer upload da foto');
      } finally {
        setUploading(false);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: name,
          avatar_url: photoUrl
        }
      });
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil', {
          description: error.message,
        });
        return;
      }
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      console.error('Erro inesperado ao atualizar perfil:', err);
      toast.error('Erro inesperado ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    
    try {
      const { error: deleteError } = await supabase.auth.deleteUser({
        userId: user.id
      });
      
      if (deleteError && deleteError.error) {
        toast.error('Erro ao excluir conta', {
          description: deleteError.error.message || 'Não foi possível excluir a conta. Tente novamente mais tarde.'
        });
      } else {
        toast.success('Conta excluída com sucesso!');
        navigate('/');
      }
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      toast.error('Erro ao excluir conta', {
        description: 'Ocorreu um erro ao tentar excluir a conta. Tente novamente mais tarde.'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto mt-8 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-24 w-24 border border-border">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={name || 'Usuário'} />
              ) : null}
              <AvatarFallback>{name ? name[0].toUpperCase() : '?'}</AvatarFallback>
            </Avatar>
          </div>
          
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="photo">Foto de Perfil</Label>
                <Input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Nome</Label>
                <Input
                  type="text"
                  value={name}
                  readOnly
                  disabled
                />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                />
              </div>
            </>
          )}
          
          <div className="flex justify-between">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  disabled={isLoading || uploading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleEdit}
                  disabled={isLoading || uploading}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={toggleEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            )}
          </div>
        </form>
        
        <div className="mt-8 border-t pt-4">
          <h2 className="text-lg font-semibold mb-4">Excluir Conta</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Esta ação é irreversível. Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Excluir Conta
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
