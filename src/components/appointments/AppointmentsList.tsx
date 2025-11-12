import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User, Check, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAppointments, updateAppointmentStatus, deleteAppointment } from '@/lib/supabase/appointments';
import { Skeleton } from '@/components/ui/skeleton';

interface AppointmentsListProps {
  userId: string;
  userRole: string;
  refreshTrigger?: number;
}

export function AppointmentsList({ userId, userRole, refreshTrigger }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [userId, refreshTrigger]);

  const loadAppointments = async () => {
    setIsLoading(true);
    const { data, error } = await getAppointments(userId);
    
    if (error) {
      toast.error('Erro ao carregar consultas');
      console.error(error);
    } else {
      setAppointments(data || []);
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: any) => {
    const { error } = await updateAppointmentStatus(appointmentId, newStatus);
    
    if (error) {
      toast.error('Erro ao atualizar status');
      console.error(error);
    } else {
      toast.success('Status atualizado com sucesso');
      loadAppointments();
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    const { error } = await deleteAppointment(appointmentId);
    
    if (error) {
      toast.error('Erro ao excluir consulta');
      console.error(error);
    } else {
      toast.success('Consulta excluída');
      loadAppointments();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmado', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
      completed: { label: 'Concluído', variant: 'outline' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const isTrainer = userRole === 'personal' || userRole === 'admin';

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma consulta agendada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const isAppointmentTrainer = appointment.trainer_id === userId;
        const otherPerson = isAppointmentTrainer ? appointment.client : appointment.trainer;
        
        return (
          <Card key={appointment.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{appointment.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    {isAppointmentTrainer ? 'Cliente' : 'Personal Trainer'}: {otherPerson?.name || otherPerson?.email}
                  </CardDescription>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {appointment.description && (
                  <p className="text-sm text-muted-foreground">{appointment.description}</p>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  <Clock className="h-4 w-4 text-primary ml-4" />
                  <span className="font-medium">
                    {format(new Date(appointment.appointment_date), 'HH:mm')} ({appointment.duration_minutes} min)
                  </span>
                </div>
                
                {appointment.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{appointment.location}</span>
                  </div>
                )}
                
                {appointment.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Observações:</p>
                    <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                  </div>
                )}
                
                {/* Actions */}
                {appointment.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    {isTrainer ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar Consulta
                      </Button>
                    )}
                  </div>
                )}
                
                {appointment.status === 'confirmed' && isTrainer && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como Concluída
                    </Button>
                  </div>
                )}
                
                {isTrainer && appointment.status !== 'completed' && (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(appointment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
