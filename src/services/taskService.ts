import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

export type TaskRow = Database['public']['Tables']['application_tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['application_tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['application_tasks']['Update'];

const LOCAL_STORAGE_TASKS_KEY = 'sahayak_user_application_tasks';

/**
 * Default starter tasks seed when a user has no tasks yet
 */
const DEFAULT_STARTER_TASKS: TaskRow[] = [
  {
    id: 'task-starter-1',
    user_id: 'local_user',
    scheme_id: 'sch-post-matric-sc',
    task_description: 'Renew Income Certificate at Tehsildar / e-District Portal',
    stage: 'DOCUMENT_PREPARATION',
    status: 'PENDING',
    due_date: '2026-11-25',
    portal_url: 'https://edistrict.up.gov.in',
    acknowledgment_number: null,
    created_at: '2026-11-01T10:00:00.000Z',
    completed_at: null,
  },
  {
    id: 'task-starter-2',
    user_id: 'local_user',
    scheme_id: 'sch-pm-kisan',
    task_description: 'Verify Aadhaar-Bank Seeding via NPCI DBT Mapper',
    stage: 'PORTAL_REGISTRATION',
    status: 'COMPLETED',
    due_date: '2026-11-15',
    portal_url: 'https://myaadhaar.uidai.gov.in',
    acknowledgment_number: null,
    created_at: '2026-11-02T10:00:00.000Z',
    completed_at: '2026-11-08T14:30:00.000Z',
  },
  {
    id: 'task-starter-3',
    user_id: 'local_user',
    scheme_id: 'sch-post-matric-sc',
    task_description: 'Collect College Bonafide Certificate & Current Term Fee Receipt',
    stage: 'DOCUMENT_PREPARATION',
    status: 'PENDING',
    due_date: '2026-11-28',
    portal_url: null,
    acknowledgment_number: null,
    created_at: '2026-11-05T10:00:00.000Z',
    completed_at: null,
  },
  {
    id: 'task-starter-4',
    user_id: 'local_user',
    scheme_id: 'sch-post-matric-sc',
    task_description: 'Submit Online Application on National Scholarship Portal (NSP)',
    stage: 'FORM_SUBMISSION',
    status: 'PENDING',
    due_date: '2026-12-15',
    portal_url: 'https://scholarships.gov.in',
    acknowledgment_number: null,
    created_at: '2026-11-06T10:00:00.000Z',
    completed_at: null,
  },
];

function getLocalTasks(): TaskRow[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (!raw) return DEFAULT_STARTER_TASKS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STARTER_TASKS;
  }
}

function setLocalTasks(tasks: TaskRow[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
    window.dispatchEvent(
      new CustomEvent('sahayak:tasks_changed', { detail: { tasks } })
    );
  } catch (err) {
    console.warn('Could not save tasks to localStorage', err);
  }
}

/**
 * Fetch application milestones and tasks for a citizen
 */
export async function getUserTasks(
  userId?: string | null
): Promise<{ data: TaskRow[]; error: Error | null }> {
  const localList = getLocalTasks();

  if (!userId || !isSupabaseConfigured) {
    return { data: localList, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('application_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      // If DB has no tasks yet, return local tasks
      return { data: localList, error: null };
    }

    setLocalTasks(data);
    return { data, error: null };
  } catch (err: any) {
    console.warn('Error in getUserTasks from Supabase, using local fallback:', err.message);
    return { data: localList, error: null };
  }
}

/**
 * Create a new application milestone task
 */
export async function createTask(
  task: TaskInsert,
  userId?: string | null
): Promise<{ data: TaskRow | null; error: Error | null }> {
  const now = new Date().toISOString();
  const newTask: TaskRow = {
    id: task.id || `task-${Date.now()}`,
    user_id: userId || 'local_user',
    scheme_id: task.scheme_id || null,
    task_description: task.task_description,
    stage: task.stage || 'DOCUMENT_PREPARATION',
    status: task.status || 'PENDING',
    due_date: task.due_date || null,
    portal_url: task.portal_url || null,
    acknowledgment_number: task.acknowledgment_number || null,
    created_at: now,
    completed_at: task.status === 'COMPLETED' ? now : null,
  };

  const current = getLocalTasks();
  const updated = [newTask, ...current];
  setLocalTasks(updated);

  if (userId && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('application_tasks')
        .insert({
          ...task,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.warn('Could not insert task to Supabase:', err.message);
    }
  }

  return { data: newTask, error: null };
}

/**
 * Toggle task completion status
 */
export async function toggleTaskComplete(
  taskId: string,
  isCompleted: boolean,
  userId?: string | null
): Promise<{ error: Error | null }> {
  const current = getLocalTasks();
  const now = new Date().toISOString();

  const updated = current.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: (isCompleted ? 'COMPLETED' : 'PENDING') as TaskRow['status'],
        completed_at: isCompleted ? now : null,
      };
    }
    return t;
  });

  setLocalTasks(updated);

  if (userId && isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('application_tasks')
        .update({
          status: isCompleted ? 'COMPLETED' : 'PENDING',
          completed_at: isCompleted ? now : null,
        })
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.warn('Could not update task in Supabase:', err.message);
    }
  }

  return { error: null };
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED',
  userId?: string | null
): Promise<{ error: Error | null }> {
  return toggleTaskComplete(taskId, status === 'COMPLETED', userId);
}

/**
 * Record an official application reference / acknowledgment number
 */
export async function recordTaskAcknowledgment(
  taskId: string,
  acknowledgmentNumber: string,
  userId?: string | null
): Promise<{ error: Error | null }> {
  const current = getLocalTasks();
  const updated = current.map((t) =>
    t.id === taskId ? { ...t, acknowledgment_number: acknowledgmentNumber } : t
  );
  setLocalTasks(updated);

  if (userId && isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('application_tasks')
        .update({ acknowledgment_number: acknowledgmentNumber })
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.warn('Could not update acknowledgment in Supabase:', err.message);
    }
  }

  return { error: null };
}

/**
 * Delete a milestone task
 */
export async function deleteTask(
  taskId: string,
  userId?: string | null
): Promise<{ error: Error | null }> {
  const current = getLocalTasks();
  const updated = current.filter((t) => t.id !== taskId);
  setLocalTasks(updated);

  if (userId && isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('application_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.warn('Could not delete task from Supabase:', err.message);
    }
  }

  return { error: null };
}
