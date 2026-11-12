import React, { useState } from 'react';
import { TaskRow, TaskInsert } from '@/services/taskService';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import {
  CheckCircle2,
  Circle,
  Calendar,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';

interface PendingTasksCardProps {
  tasks: TaskRow[];
  onToggleTask: (taskId: string, isCompleted: boolean) => Promise<void>;
  onCreateTask: (task: TaskInsert) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const PendingTasksCard: React.FC<PendingTasksCardProps> = ({
  tasks,
  onToggleTask,
  onCreateTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newSchemeId, setNewSchemeId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'PENDING') return t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    await onCreateTask({
      task_description: newTaskDesc.trim(),
      scheme_id: newSchemeId || null,
      due_date: newDueDate || null,
      status: 'PENDING',
      stage: 'DOCUMENT_PREPARATION',
      user_id: 'local_user',
    });

    setNewTaskDesc('');
    setNewSchemeId('');
    setNewDueDate('');
    setIsAdding(false);
  };

  const getSchemeName = (schemeId?: string | null) => {
    if (!schemeId) return null;
    const found = VERIFIED_SCHEMES.find((s) => s.id === schemeId);
    return found?.short_title || found?.official_name || schemeId;
  };

  const getStageLabel = (stage?: string | null) => {
    switch (stage) {
      case 'DOCUMENT_PREPARATION':
        return 'Doc Prep';
      case 'PORTAL_REGISTRATION':
        return 'Registration';
      case 'FORM_SUBMISSION':
        return 'Submission';
      case 'DISBURSEMENT_AND_TRACKING':
        return 'Disbursement';
      default:
        return 'Action';
    }
  };

  return (
    <Card className="shadow-subtle border-civic-border overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-civic-emerald uppercase tracking-wider">
              Task Tracker
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {pendingCount} Pending Action{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Application Milestones & Deadlines
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('PENDING')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'PENDING'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'COMPLETED'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Task
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4 space-y-3">
        {/* Inline Add Task Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-xl border border-civic-emerald/50 bg-emerald-50/40 space-y-3 animate-in fade-in"
          >
            <div className="text-xs font-bold text-slate-800">
              New Application Action Milestone
            </div>

            <input
              type="text"
              placeholder="e.g. Collect Fee Receipt from College Accounts Section"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              required
              className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={newSchemeId}
                onChange={(e) => setNewSchemeId(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              >
                <option value="">Link to Scheme (Optional)</option>
                {VERIFIED_SCHEMES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.short_title || s.official_name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Task
              </Button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-dashed rounded-xl">
            {filter === 'PENDING'
              ? 'No pending tasks! All scheduled milestones are complete.'
              : 'No completed tasks recorded yet.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'COMPLETED';
              const schemeName = getSchemeName(task.scheme_id);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id, !isDone)}
                      className="mt-0.5 text-slate-400 hover:text-civic-emerald transition-colors shrink-0"
                      title={isDone ? 'Reopen task' : 'Mark task complete'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div
                        className={`text-xs sm:text-sm font-semibold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.task_description}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {getStageLabel(task.stage)}
                        </span>

                        {schemeName && (
                          <span className="text-civic-navy font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {schemeName}
                          </span>
                        )}

                        {task.due_date && (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Deadline: {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    {task.portal_url && (
                      <a
                        href={task.portal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-civic-navy hover:bg-slate-100 transition-colors"
                        title="Open portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
