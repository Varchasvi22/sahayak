import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Fetch a citizen's profile by their auth UUID
 */
export async function getProfile(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in getProfile:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Update demographic attributes on a citizen's profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in updateProfile:', err.message);
    return { data: null, error: err };
  }
}
