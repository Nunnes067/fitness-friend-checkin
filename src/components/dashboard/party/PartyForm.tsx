
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { createParty, joinParty } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PartyFormProps {
  userId: string;
  hasCheckedInToday: boolean;
  onPartyCreated: (party: any) => void;
}

export function PartyForm({ userId, hasCheckedInToday, onPartyCreated }: PartyFormProps) {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [partyCode, setPartyCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleCreateParty = async () => {
    if (hasCheckedInToday) {
      toast.error('Você já fez check-in hoje');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await createParty(userId);
      if (error) {
        toast.error('Erro ao criar grupo', {
          description: error.message,
        });
        return;
      }
      
      console.log("Party created:", data);
      onPartyCreated(data);
      toast.success('Grupo criado com sucesso!', {
        description: 'Compartilhe o código com seus amigos.'
      });
    } catch (err) {
      console.error("Error creating party:", err);
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinParty = async () => {
    if (!partyCode.trim()) {
      toast.error('Digite o código do grupo');
      return;
    }
    
    if (hasCheckedInToday) {
      toast.error('Você já fez check-in hoje');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Joining party with code:", partyCode);
      const { data, error, message } = await joinParty(userId, partyCode);
      
      if (error) {
        toast.error('Erro ao entrar no grupo', {
          description: message || error.message,
        });
        return;
      }
      
      console.log("Joined party:", data);
      onPartyCreated(data);
      toast.success(message || 'Você entrou no grupo!');
      setPartyCode('');
    } catch (err) {
      console.error("Error joining party:", err);
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
        Party de Treino
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto text-center">
        Treine junto com seus amigos e registrem presença em grupo
      </p>
      
      <div className="flex items-center border-b border-border/40 mb-6">
        <button 
          className={`flex-1 py-3 px-1 text-center font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'join' 
              ? 'border-primary text-primary' 
              : 'border-transparent hover:border-border/60'
          }`}
          onClick={() => setActiveTab('join')}
        >
          Entrar em uma Party
        </button>
        <button 
          className={`flex-1 py-3 px-1 text-center font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'create' 
              ? 'border-primary text-primary' 
              : 'border-transparent hover:border-border/60'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Criar nova Party
        </button>
      </div>
      
      {/* Join Party */}
      {activeTab === 'join' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="party-code" className="block text-sm font-medium">
              Código da Party
            </label>
            <div className="flex gap-2">
              <Input
                id="party-code"
                placeholder="Digite o código de 6 dígitos"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 font-mono text-center uppercase"
              />
              <Button 
                onClick={handleJoinParty}
                disabled={loading || !partyCode.trim() || hasCheckedInToday}
              >
                Entrar
              </Button>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Peça o código para o amigo que criou a Party
          </div>
        </div>
      )}
      
      {/* Create Party */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground mb-4">
            Crie uma nova Party e convide seus amigos para treinar juntos. 
            Você receberá um código de 6 dígitos para compartilhar.
          </p>
          
          <Button 
            className="w-full"
            size="lg"
            onClick={handleCreateParty}
            disabled={loading || hasCheckedInToday}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Criar Nova Party
          </Button>
          
          {hasCheckedInToday && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                Você já fez check-in hoje. Não é possível criar ou participar de um grupo.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </>
  );
}
