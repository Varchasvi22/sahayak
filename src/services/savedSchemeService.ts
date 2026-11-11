import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type SavedSchemeRow = Database['public']['Tables']['saved_schemes']['Row'];

/**
 * Fetch all schemes bookmarked by the citizen
 */
export async function getSavedSchemes(
  userId: string
): Promise<{ data: (SavedSchemeRow & { schemes: Database['public']['Tables']['schemes']['Row'] | null })[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('saved_schemes')
      .select('*, schemes(*)')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return { data: (data as any) || [], error: null };
  } catch (err: any) {
    console.error('Error in getSavedSchemes:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Bookmark a scheme
 */
export async function saveScheme(
  userId: string,
  schemeId: string,
  notes?: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('saved_schemes')
      .insert({
        user_id: userId,
        scheme_id: schemeId,
        notes: notes || null,
      });

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error('Error in saveScheme:', err.message);
    return { error: err };
  }
}

/**
 * Remove a scheme bookmark
 */
export async function removeSavedScheme(
  userId: string,
  schemeId: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('saved_schemes')
      .delete()
      .eq('user_id', userId)
      .eq('scheme_id', schemeId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error('Error in removeSavedScheme:', err.message);
    return { error: err };
  }
}
