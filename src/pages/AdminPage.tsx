import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus } from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral">Curator Console</Badge>
            <span className="text-xs text-slate-500 font-medium">Scheme Verification Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Scheme Data Integrity Panel
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Review, verify, and publish real-world welfare schemes with official government links.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Draft New Scheme
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Active Curated Schemes</span>
          <p className="text-2xl font-bold text-slate-900">10</p>
          <p className="text-[11px] text-emerald-600">All 10 verified within 7 days</p>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Canonical Documents</span>
          <p className="text-2xl font-bold text-slate-900">12</p>
          <p className="text-[11px] text-slate-400">Universal taxonomy mapped</p>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 font-medium">Verification Status</span>
          <p className="text-2xl font-bold text-emerald-700">100% OK</p>
          <p className="text-[11px] text-slate-400">Zero unverified records published</p>
        </Card>
      </div>

      <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Admin scheme curation and verification workflow is planned for <strong>Phase 5</strong>.
      </div>
    </div>
  );
};
