import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createAppointment } from '@/lib/supabase/appointments';
import { createNotification } from '@/lib/supabase/notifications';

interface CreateAppointmentFormProps {
  trainerId: string;
  onSuccess: () => void;
}

export function CreateAppointmentForm({ trainerId, onSuccess }: CreateAppointmentFormProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    time: '',
    duration_minutes: 60,
    location: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    // Load clients from trainer's groups
    const { data: groupMembers, error } = await supabase
      .from('group_members')
      .select('user_id, app_users!inner(*)')
      .eq('app_users.role', 'user')
      .neq('user_id', trainerId);

    if (error) {
      console.error('Error loading clients:', error);
      return;
    }

    // Remove duplicates
    const uniqueClients = Array.from(
      new Map(groupMembers.map((gm: any) => [gm.user_id, gm.app_users])).values()
    );
    
    setClients(uniqueClients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !formData.time || !formData.client_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time
      const [hours, minutes] = formData.time.split(':');
      const appointmentDate = new Date(date);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const { data, error } = await createAppointment({
        trainer_id: trainerId,
        client_id: formData.client_id,
        title: formData.title,
        description: formData.description,
        appointment_date: appointmentDate.toISOString(),
        duration_minutes: formData.duration_minutes,
        location: formData.location,
      });

      if (error) throw error;

      // Create notification for client
      await createNotification({
        user_id: formData.client_id,
        title: 'Nova Consulta Agendada',
        message: `Você tem uma nova consulta: ${formData.title} em ${format(appointmentDate, "dd/MM/yyyy 'às' HH:mm")}`,
        type: 'appointment',
        related_id: data.id,
      });

      toast.success('Consulta agendada com sucesso!');
      
      // Reset form
      setFormData({
        client_id: '',
        title: '',
        description: '',
        time: '',
        duration_minutes: 60,
        location: '',
      });
      setDate(undefined);
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao agendar consulta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Nova Consulta</CardTitle>
        <CardDescription>Crie uma consulta com um dos seus clientes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name || client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Avaliação Física"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes da consulta"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                min="15"
                step="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Academia Central"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Agendando...' : 'Agendar Consulta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
