import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Check, Loader2, AlertTriangle, LogOut, User, Ruler, Weight, Calendar, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Biometric data
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [biologicalSex, setBiologicalSex] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  
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
        
        // Fetch biometric data from app_users
        const { data: appUser } = await supabase
          .from('app_users')
          .select('height_cm, weight_kg, birth_date, biological_sex, activity_level, fitness_goal, name, photo_url')
          .eq('id', currentUser.id)
          .single();
          
        if (appUser) {
          if (appUser.name) setName(appUser.name);
          if (appUser.photo_url) setPhotoUrl(appUser.photo_url);
          if (appUser.height_cm) setHeightCm(String(appUser.height_cm));
          if (appUser.weight_kg) setWeightKg(String(appUser.weight_kg));
          if (appUser.birth_date) setBirthDate(appUser.birth_date);
          if (appUser.biological_sex) setBiologicalSex(appUser.biological_sex);
          if (appUser.activity_level) setActivityLevel(appUser.activity_level);
          if (appUser.fitness_goal) setFitnessGoal(appUser.fitness_goal);
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        toast.error('Sessão expirada');
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
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
        
      if (error) {
        toast.error('Erro ao fazer upload da foto');
      } else {
        const publicUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
        setPhotoUrl(publicUrl);
        toast.success('Foto atualizada!');
      }
    } catch (err) {
      toast.error('Erro inesperado ao fazer upload');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update auth metadata
      await supabase.auth.updateUser({
        data: { name, avatar_url: photoUrl }
      });
      
      // Update app_users with biometric data
      const { error } = await supabase
        .from('app_users')
        .update({
          name,
          photo_url: photoUrl,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          birth_date: birthDate || null,
          biological_sex: biologicalSex || null,
          activity_level: activityLevel || null,
          fitness_goal: fitnessGoal || null,
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error('Erro ao atualizar perfil');
        return;
      }
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      toast.error('Erro inesperado ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await signOut();
      toast.success('Solicitação de exclusão enviada!');
      navigate('/');
    } catch (err) {
      toast.error('Erro ao excluir conta');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getAge = () => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
                  <AvatarFallback className="text-lg">{name ? name[0].toUpperCase() : '?'}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="flex-1">
                    <Label htmlFor="photo">Alterar Foto</Label>
                    <Input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} disabled={uploading} />
                    {uploading && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Enviando...</p>}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biometric Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ruler className="h-5 w-5 text-primary" />
                Dados Biométricos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-1"><Ruler className="h-3 w-3" /> Altura (cm)</Label>
                  <Input type="number" placeholder="175" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <Label className="flex items-center gap-1"><Weight className="h-3 w-3" /> Peso (kg)</Label>
                  <Input type="number" placeholder="70" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} disabled={!isEditing} />
                </div>
                <div>
                  <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Nascimento</Label>
                  <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} disabled={!isEditing} />
                  {birthDate && !isEditing && <p className="text-xs text-muted-foreground mt-1">{getAge()} anos</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Sexo Biológico</Label>
                  {isEditing ? (
                    <Select value={biologicalSex} onValueChange={setBiologicalSex}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={biologicalSex ? biologicalSex.charAt(0).toUpperCase() + biologicalSex.slice(1) : 'Não informado'} disabled />
                  )}
                </div>
                <div>
                  <Label className="flex items-center gap-1"><Activity className="h-3 w-3" /> Nível de Atividade</Label>
                  {isEditing ? (
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentario">Sedentário</SelectItem>
                        <SelectItem value="leve">Levemente Ativo</SelectItem>
                        <SelectItem value="moderado">Moderadamente Ativo</SelectItem>
                        <SelectItem value="ativo">Muito Ativo</SelectItem>
                        <SelectItem value="muito_ativo">Extremamente Ativo</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={activityLevel ? {
                      sedentario: 'Sedentário',
                      leve: 'Levemente Ativo',
                      moderado: 'Moderadamente Ativo',
                      ativo: 'Muito Ativo',
                      muito_ativo: 'Extremamente Ativo',
                    }[activityLevel] || activityLevel : 'Não informado'} disabled />
                  )}
                </div>
                <div>
                  <Label>Objetivo</Label>
                  {isEditing ? (
                    <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perder_peso">Perder Peso</SelectItem>
                        <SelectItem value="ganhar_massa">Ganhar Massa</SelectItem>
                        <SelectItem value="manter">Manter Peso</SelectItem>
                        <SelectItem value="saude">Melhorar Saúde</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={fitnessGoal ? {
                      perder_peso: 'Perder Peso',
                      ganhar_massa: 'Ganhar Massa',
                      manter: 'Manter Peso',
                      saude: 'Melhorar Saúde',
                    }[fitnessGoal] || fitnessGoal : 'Não informado'} disabled />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button type="submit" disabled={isSaving || uploading} className="flex-1">
                  {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Check className="mr-2 h-4 w-4" /> Salvar</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)} className="flex-1">
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
              </Button>
            )}
          </div>
        </form>
        
        {/* Delete Account */}
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Excluir Conta</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
              {deleteLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...</> : <><AlertTriangle className="mr-2 h-4 w-4" /> Excluir Conta</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
