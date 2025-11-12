import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  trainer_id: string;
  client_id: string;
  title: string;
  description?: string;
  appointment_date: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      trainer:app_users!appointments_trainer_id_fkey(id, name, email, photo_url),
      client:app_users!appointments_client_id_fkey(id, name, email, photo_url)
    `)
    .or(`trainer_id.eq.${userId},client_id.eq.${userId}`)
    .order('appointment_date', { ascending: true });

  return { data, error };
}

export async function getUpcomingAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      trainer:app_users!appointments_trainer_id_fkey(id, name, email, photo_url),
      client:app_users!appointments_client_id_fkey(id, name, email, photo_url)
    `)
    .or(`trainer_id.eq.${userId},client_id.eq.${userId}`)
    .gte('appointment_date', new Date().toISOString())
    .in('status', ['pending', 'confirmed'])
    .order('appointment_date', { ascending: true })
    .limit(5);

  return { data, error };
}

export async function createAppointment(appointment: {
  trainer_id: string;
  client_id: string;
  title: string;
  description?: string;
  appointment_date: string;
  duration_minutes?: number;
  location?: string;
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single();

  return { data, error };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single();

  return { data, error };
}

export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>
) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single();

  return { data, error };
}

export async function deleteAppointment(appointmentId: string) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  return { error };
}
