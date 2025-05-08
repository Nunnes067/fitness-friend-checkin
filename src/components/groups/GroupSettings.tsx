
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Save, RefreshCw, Users, Trash2, Copy } from 'lucide-react';
import { getGroupDetails, updateGroup, generateNewInviteCode, deleteGroup } from '@/lib/supabase';

interface GroupSettingsProps {
  groupId: string;
  userId: string;
}

export function GroupSettings({ groupId, userId }: GroupSettingsProps) {
  const [group, setGroup] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const { data, error } = await getGroupDetails(groupId, userId);
        
        if (error) throw error;
        
        setGroup(data);
        setName(data?.name || '');
        setDescription(data?.description || '');
      } catch (error) {
        console.error('Error fetching group details:', error);
        toast.error('Erro ao carregar detalhes do grupo');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [groupId, userId]);
  
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('O nome do grupo não pode ficar em branco');
      return;
    }
    
    setSaving(true);
    
    try {
      const { error } = await updateGroup(groupId, {
        name,
        description
      });
      
      if (error) throw error;
      
      // Update the local group state with new values
      setGroup({
        ...group,
        name,
        description
      });
      
      toast.success('Grupo atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating group:', error);
      toast.error('Erro ao atualizar grupo', {
        description: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleGenerateNewCode = async () => {
    if (!confirm('Tem certeza que deseja gerar um novo código? O código atual deixará de funcionar.')) {
      return;
    }
    
    setGeneratingCode(true);
    
    try {
      const { data, error } = await generateNewInviteCode(groupId);
      
      if (error) throw error;
      
      if (data && data.invite_code) {
        setGroup({
          ...group,
          invite_code: data.invite_code
        });
        
        toast.success('Novo código de convite gerado');
      }
    } catch (error: any) {
      console.error('Error generating new code:', error);
      toast.error('Erro ao gerar novo código', {
        description: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setGeneratingCode(false);
    }
  };
  
  const copyInviteCode = () => {
    if (!group?.invite_code) return;
    
    navigator.clipboard.writeText(group.invite_code);
    toast.success('Código de convite copiado');
  };
  
  const handleDeleteGroup = async () => {
    if (!confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const { error } = await deleteGroup(groupId);
      
      if (error) throw error;
      
      toast.success('Grupo excluído com sucesso');
      
      // Redirect back to groups list
      window.location.href = '/groups';
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast.error('Erro ao excluir grupo', {
        description: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Grupo</CardTitle>
          <CardDescription>
            Gerencie detalhes e configurações do seu grupo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do grupo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo deste grupo"
                rows={3}
              />
            </div>
            
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="font-medium">Código de Convite</h3>
            
            <div className="flex items-center gap-2">
              <Input 
                value={group?.invite_code || ''} 
                readOnly 
                className="font-mono bg-muted"
              />
              <Button variant="outline" onClick={copyInviteCode} title="Copiar código">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" onClick={handleGenerateNewCode} disabled={generatingCode}>
              {generatingCode ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo Código
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Ao gerar um novo código, o código antigo deixará de funcionar.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="font-medium text-destructive">Zona de Perigo</h3>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="w-full"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Grupo
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Esta ação não pode ser desfeita. Todos os dados do grupo serão excluídos permanentemente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
