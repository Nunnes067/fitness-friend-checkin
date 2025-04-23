
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createGroup } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';

interface CreateGroupFormProps {
  userId: string;
}

export function CreateGroupForm({ userId }: CreateGroupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, informe um nome para o grupo');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await createGroup({
        name,
        description,
        creatorId: userId
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Grupo criado com sucesso!', {
        description: `Seu grupo "${name}" foi criado. Compartilhe o código de convite com seus alunos.`
      });
      
      setName('');
      setDescription('');
      
      // Recarregar a página para mostrar o novo grupo
      setTimeout(() => {
        window.location.href = '/groups';
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error('Erro ao criar grupo', {
        description: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Grupo</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Turma Avançada, Alunos da Manhã"
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
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando...
          </>
        ) : (
          <>
            <Users className="mr-2 h-4 w-4" />
            Criar Grupo
          </>
        )}
      </Button>
    </form>
  );
}
