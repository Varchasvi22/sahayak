import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type SavedSchemeRow = Database['public']['Tables']['saved_schemes']['Row'];

const LOCAL_SAVED_KEY = 'sahayak_saved_schemes_draft';

/**
 * Get locally bookmarked scheme IDs for guest sessions
 */
export function getLocalSavedSchemeIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_SAVED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

/**
 * Toggle locally bookmarked scheme ID
 */
export function toggleLocalSavedScheme(schemeId: string): { isSaved: boolean; allIds: string[] } {
  try {
    const current = getLocalSavedSchemeIds();
    let updated: string[];
    let isSaved: boolean;
    if (current.includes(schemeId)) {
      updated = current.filter((id) => id !== schemeId);
      isSaved = false;
    } else {
      updated = [...current, schemeId];
      isSaved = true;
    }
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sahayak:saved_schemes_changed', { detail: { allIds: updated } }));
    return { isSaved, allIds: updated };
  } catch {
    return { isSaved: false, allIds: [] };
  }
}

/**
 * Fetch all saved scheme IDs for the current citizen (cloud or guest)
 */
export async function getSavedSchemeIds(userId?: string | null): Promise<string[]> {
  if (!userId || !isSupabaseConfigured) {
    return getLocalSavedSchemeIds();
  }

  try {
    const { data, error } = await supabase
      .from('saved_schemes')
      .select('scheme_id')
      .eq('user_id', userId);

    if (error) throw error;
    const cloudIds = (data || []).map((row) => row.scheme_id);

    // Merge with any local guest saves
    const localIds = getLocalSavedSchemeIds();
    const merged = Array.from(new Set([...cloudIds, ...localIds]));
    return merged;
  } catch (err: any) {
    console.error('Error fetching saved scheme IDs:', err.message);
    return getLocalSavedSchemeIds();
  }
}

/**
 * Fetch all schemes bookmarked by the citizen with scheme details
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
 * Toggle bookmark for a scheme (handles both Supabase RLS and local draft fallback)
 */
export async function toggleSchemeBookmark(
  schemeId: string,
  userId?: string | null
): Promise<{ isSaved: boolean; error: Error | null }> {
  // Always update local cache so guest experience is instant
  const { isSaved } = toggleLocalSavedScheme(schemeId);

  if (!userId || !isSupabaseConfigured) {
    return { isSaved, error: null };
  }

  try {
    if (isSaved) {
      // User saved the scheme
      const { error } = await supabase.from('saved_schemes').insert({
        user_id: userId,
        scheme_id: schemeId,
      });
      if (error && error.code !== '23505') {
        // Ignore duplicate key error (23505)
        throw error;
      }
    } else {
      // User removed the scheme
      const { error } = await supabase
        .from('saved_schemes')
        .delete()
        .eq('user_id', userId)
        .eq('scheme_id', schemeId);
      if (error) throw error;
    }

    return { isSaved, error: null };
  } catch (err: any) {
    console.error('Error in toggleSchemeBookmark:', err.message);
    return { isSaved, error: err };
  }
}

/**
 * Bookmark a scheme directly
 */
export async function saveScheme(
  userId: string,
  schemeId: string,
  notes?: string
): Promise<{ error: Error | null }> {
  toggleLocalSavedScheme(schemeId);

  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase.from('saved_schemes').insert({
      user_id: userId,
      scheme_id: schemeId,
      notes: notes || null,
    });

    if (error && error.code !== '23505') throw error;
    return { error: null };
  } catch (err: any) {
    console.error('Error in saveScheme:', err.message);
    return { error: err };
  }
}

/**
 * Remove a scheme bookmark directly
 */
export async function removeSavedScheme(
  userId: string,
  schemeId: string
): Promise<{ error: Error | null }> {
  toggleLocalSavedScheme(schemeId);

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
