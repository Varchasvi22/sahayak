import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { env } from './env';

/**
 * Indicates whether a real Supabase backend has been configured in .env
 */
export const isSupabaseConfigured = Boolean(
  env.VITE_SUPABASE_URL &&
    !env.VITE_SUPABASE_URL.includes('placeholder.supabase.co') &&
    env.VITE_SUPABASE_ANON_KEY &&
    env.VITE_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
);

/**
 * Typed Supabase client singleton
 * RLS policies ensure authenticated citizens can only read/write their authorized records
 */
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
