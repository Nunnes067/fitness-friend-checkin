
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { joinGroup } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

interface JoinGroupFormProps {
  userId: string;
  onSuccess?: () => void; // Added onSuccess callback prop
}

export function JoinGroupForm({ userId, onSuccess }: JoinGroupFormProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error('Por favor, informe o código de convite');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error, message } = await joinGroup(userId, inviteCode);
      
      if (error) {
        throw new Error(message || error.message);
      }
      
      toast.success('Você entrou no grupo!', {
        description: `Grupo: ${data?.name || 'Grupo de Treino'}`
      });
      
      setInviteCode('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Recarregar a página para mostrar o novo grupo
        setTimeout(() => {
          window.location.href = '/groups';
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast.error('Erro ao entrar no grupo', {
        description: error.message || 'Código inválido ou grupo não encontrado'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inviteCode">Código de Convite</Label>
        <Input
          id="inviteCode"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="Digite o código (ex: ABC123)"
          className="uppercase"
          maxLength={6}
          required
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Entrar no Grupo
          </>
        )}
      </Button>
    </form>
  );
}
