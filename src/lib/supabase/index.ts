
// Re-export all Supabase functionality from a single entry point
export * from './auth';
export * from './profiles';
export * from './checkins';
export * from './parties';
export * from './groups';

// Re-export supabase client
export { supabase } from '@/integrations/supabase/client';
