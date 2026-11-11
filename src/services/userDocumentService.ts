import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type UserDocumentRow = Database['public']['Tables']['user_documents']['Row'];
export type UserDocumentInsert = Database['public']['Tables']['user_documents']['Insert'];

/**
 * Fetch a citizen's document vault records
 */
export async function getUserDocuments(
  userId: string
): Promise<{ data: UserDocumentRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('Error in getUserDocuments:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Record or update document readiness status in user vault
 */
export async function upsertUserDocument(
  doc: UserDocumentInsert
): Promise<{ data: UserDocumentRow | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('user_documents')
      .upsert(doc, { onConflict: 'user_id,canonical_key' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in upsertUserDocument:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Delete a document readiness record
 */
export async function deleteUserDocument(
  userId: string,
  canonicalKey: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('user_documents')
      .delete()
      .eq('user_id', userId)
      .eq('canonical_key', canonicalKey);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error('Error in deleteUserDocument:', err.message);
    return { error: err };
  }
}
