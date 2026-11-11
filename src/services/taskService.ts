import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type TaskRow = Database['public']['Tables']['application_tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['application_tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['application_tasks']['Update'];

/**
 * Fetch application milestones and tasks for a citizen
 */
export async function getUserTasks(
  userId: string
): Promise<{ data: TaskRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('application_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('Error in getUserTasks:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Create a new application milestone task
 */
export async function createTask(
  task: TaskInsert
): Promise<{ data: TaskRow | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('application_tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in createTask:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Update task status (e.g. COMPLETED)
 */
export async function updateTaskStatus(
  taskId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('application_tasks')
      .update({
        status,
        completed_at: status === 'COMPLETED' ? new Date().toISOString() : null,
      })
      .eq('id', taskId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error('Error in updateTaskStatus:', err.message);
    return { error: err };
  }
}

/**
 * Record an official application reference / acknowledgment number
 */
export async function recordTaskAcknowledgment(
  taskId: string,
  acknowledgmentNumber: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase
      .from('application_tasks')
      .update({ acknowledgment_number: acknowledgmentNumber })
      .eq('id', taskId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error('Error in recordTaskAcknowledgment:', err.message);
    return { error: err };
  }
}
