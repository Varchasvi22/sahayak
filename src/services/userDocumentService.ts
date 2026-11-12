import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { UserDocumentItem } from '@/features/documents/types';
import {
  mapDbStatusToDomain,
  mapDomainStatusToDb,
} from '@/features/documents/crossSchemeIntelligence';

export type UserDocumentRow = Database['public']['Tables']['user_documents']['Row'];
export type UserDocumentInsert = Database['public']['Tables']['user_documents']['Insert'];

const LOCAL_STORAGE_VAULT_KEY = 'sahayak_user_documents_vault';

/**
 * Fetch a citizen's document vault records directly from Supabase
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
 * Record or update document readiness status in user vault in Supabase
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
 * Delete a document readiness record in Supabase
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

// ---------------------------------------------------------------------------
// High-Level Domain Service Functions with LocalStorage Resiliency
// ---------------------------------------------------------------------------

/**
 * Get stored local documents for guests or offline mode
 */
function getLocalDocuments(): UserDocumentItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_VAULT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Set stored local documents
 */
function setLocalDocuments(items: UserDocumentItem[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_VAULT_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not persist documents to localStorage', e);
  }
}

/**
 * Fetch unified document items for a user (from DB if logged in, else LocalStorage)
 */
export async function fetchUserDocumentItems(
  userId?: string | null
): Promise<UserDocumentItem[]> {
  const localItems = getLocalDocuments();

  if (!userId || !isSupabaseConfigured) {
    return localItems;
  }

  try {
    const { data, error } = await getUserDocuments(userId);
    if (error || !data) {
      return localItems;
    }

    const domainItems: UserDocumentItem[] = data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      canonicalKey: row.canonical_key,
      documentName: row.document_name,
      status: mapDbStatusToDomain(row.availability_status),
      issuedDate: row.issued_date,
      expiryDate: row.expiry_date,
      documentReferenceMasked: row.document_reference_masked,
      notes: row.notes,
      updatedAt: row.updated_at,
    }));

    // Cache locally as backup
    setLocalDocuments(domainItems);
    return domainItems;
  } catch (err) {
    console.warn('Falling back to local documents cache:', err);
    return localItems;
  }
}

/**
 * Save or update a unified document item
 */
export async function saveUserDocumentItem(
  item: UserDocumentItem,
  userId?: string | null
): Promise<{ success: boolean; item: UserDocumentItem; error?: Error }> {
  // 1. Update local storage first for snappy UI
  const localItems = getLocalDocuments();
  const existingIdx = localItems.findIndex((d) => d.canonicalKey === item.canonicalKey);
  const now = new Date().toISOString();
  const updatedItem: UserDocumentItem = {
    ...item,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    localItems[existingIdx] = updatedItem;
  } else {
    localItems.push(updatedItem);
  }
  setLocalDocuments(localItems);

  // 2. Persist to Supabase if authenticated
  if (userId && isSupabaseConfigured) {
    try {
      const payload: UserDocumentInsert = {
        user_id: userId,
        canonical_key: item.canonicalKey,
        document_name: item.documentName,
        availability_status: mapDomainStatusToDb(item.status),
        issued_date: item.issuedDate || null,
        expiry_date: item.expiryDate || null,
        document_reference_masked: item.documentReferenceMasked || null,
        notes: item.notes || null,
      };

      const { data, error } = await upsertUserDocument(payload);
      if (error) {
        return { success: false, item: updatedItem, error };
      }
      if (data) {
        updatedItem.id = data.id;
        updatedItem.userId = data.user_id;
      }
    } catch (err: any) {
      return { success: false, item: updatedItem, error: err };
    }
  }

  return { success: true, item: updatedItem };
}

/**
 * Delete a document item from vault
 */
export async function removeUserDocumentItem(
  canonicalKey: string,
  userId?: string | null
): Promise<{ success: boolean; error?: Error }> {
  const localItems = getLocalDocuments().filter((d) => d.canonicalKey !== canonicalKey);
  setLocalDocuments(localItems);

  if (userId && isSupabaseConfigured) {
    const { error } = await deleteUserDocument(userId, canonicalKey);
    if (error) {
      return { success: false, error };
    }
  }

  return { success: true };
}
