// Re-export everything from the modular structure
export * from './supabase/auth';
export * from './supabase/profiles';
export * from './supabase/checkins';
export * from './supabase/parties';
export * from './supabase/groups';
export * from './supabase/appointments';
export * from './supabase/notifications';

// Re-export supabase client
export { supabase } from '@/integrations/supabase/client';
