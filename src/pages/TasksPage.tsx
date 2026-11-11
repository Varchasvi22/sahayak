import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus } from 'lucide-react';

export const TasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral">Preparation Milestones</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Application Tasks</h1>
          <p className="text-xs text-slate-600 mt-1">
            Track step-by-step milestones: collecting certificates, visiting CSC portals, and recording reference IDs.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Add Custom Task
        </Button>
      </div>

      <div className="space-y-3">
        {[
          {
            title: 'Apply for Income Certificate on e-District Portal',
            scheme: 'Post Matric Scholarship for SC Students',
            due: '18 Nov 2026',
            status: 'PENDING' as const,
          },
          {
            title: 'Verify Aadhaar-Bank Seeding via NPCI Mapper',
            scheme: 'PM-Kisan Samman Nidhi',
            due: '15 Nov 2026',
            status: 'COMPLETED' as const,
          },
        ].map((task, i) => (
          <Card key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked={task.status === 'COMPLETED'}
                className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <h4
                  className={`text-sm font-semibold ${
                    task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-medium text-emerald-700">{task.scheme}</span>
                  <span>•</span>
                  <span>Due: {task.due}</span>
                </div>
              </div>
            </div>
            <Badge variant={task.status === 'COMPLETED' ? 'eligible' : 'unknown'} size="sm">
              {task.status}
            </Badge>
          </Card>
        ))}
      </div>

      <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Interactive task tracking with Supabase sync will be wired in <strong>Phase 4</strong>.
      </div>
    </div>
  );
};
