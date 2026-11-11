import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Supabase client instance configured with public anon key
 * RLS policies ensure users only access their authorized data
 */
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);
