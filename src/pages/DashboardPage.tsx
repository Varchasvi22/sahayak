import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="eligible">Application Readiness Command Center</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Citizen Readiness Overview
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Track your progress from demographic eligibility to document readiness and official submission.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Overall Readiness</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">75%</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> High
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Across 4 eligible schemes</p>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Potentially Eligible</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">4</span>
              <span className="text-xs font-medium text-blue-600">Schemes</span>
            </div>
            <p className="text-[11px] text-slate-400">Est. ₹24,000+ total annual benefit</p>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4 space-y-1">
            <span className="text-xs font-semibold text-slate-500">Documents Needed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">1</span>
              <span className="text-xs font-medium text-amber-600">Pending Action</span>
            </div>
            <p className="text-[11px] text-slate-400">Ration Card pending renewal</p>
          </CardHeader>
        </Card>
      </div>

      {/* Readiness Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next Recommended Step</CardTitle>
          <CardDescription>
            High-impact action to move your application readiness to 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-bold text-amber-900">
                Action Required: Update NFSA / BPL Ration Card
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Your Ayushman Bharat application is blocked solely by a missing Ration Card record.
                Once obtained, your readiness for Ayushman Bharat jumps to 100%.
              </p>
            </div>
            <Link to="/vault">
              <Button size="sm" variant="outline">
                Open Vault
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Personalized action plans and live readiness scores will be calculated in <strong>Phase 4</strong>.
            </span>
            <Link to="/schemes">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review Eligible Schemes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
