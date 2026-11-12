import React from 'react';
import { CrossSchemeReadinessMetrics } from '../types';
import { CheckCircle2, AlertCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DocumentReadinessMeterProps {
  metrics: CrossSchemeReadinessMetrics;
  schemesCount: number;
}

export const DocumentReadinessMeter: React.FC<DocumentReadinessMeterProps> = ({
  metrics,
  schemesCount,
}) => {
  const {
    totalUniqueRequired,
    availableCount,
    missingCount,
    expiredCount,
    verificationPendingCount,
    completionPercentage,
  } = metrics;

  return (
    <div className="bg-white border border-civic-border rounded-2xl p-5 sm:p-6 shadow-subtle space-y-5">
      {/* Top Header & Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-civic-emerald uppercase tracking-wider">
              Cross-Scheme Readiness Engine
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {schemesCount} Scheme{schemesCount !== 1 ? 's' : ''} Analyzed
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Certificate & Document Readiness
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Calculated across {totalUniqueRequired} unique required certificates with zero double-counting.
          </p>
        </div>

        <div className="flex items-baseline gap-2 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <span className="text-3xl font-extrabold text-civic-navy tracking-tight">
            {completionPercentage}%
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Ready to Submit
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/80">
          {availableCount > 0 && (
            <div
              style={{ width: `${(availableCount / totalUniqueRequired) * 100}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`${availableCount} Available`}
            />
          )}
          {verificationPendingCount > 0 && (
            <div
              style={{
                width: `${(verificationPendingCount / totalUniqueRequired) * 100}%`,
              }}
              className="bg-amber-400 transition-all duration-500"
              title={`${verificationPendingCount} In Progress`}
            />
          )}
          {expiredCount > 0 && (
            <div
              style={{ width: `${(expiredCount / totalUniqueRequired) * 100}%` }}
              className="bg-red-400 transition-all duration-500"
              title={`${expiredCount} Expired`}
            />
          )}
          {missingCount > 0 && (
            <div
              style={{ width: `${(missingCount / totalUniqueRequired) * 100}%` }}
              className="bg-slate-200 transition-all duration-500"
              title={`${missingCount} Missing`}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>0%</span>
          <span>{availableCount} of {totalUniqueRequired} certificates ready</span>
          <span>100%</span>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xl font-bold text-emerald-950">{availableCount}</div>
            <div className="text-[11px] font-semibold text-emerald-800">Available in Hand</div>
            <div className="text-[10px] text-emerald-600">Valid & unexpired</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xl font-bold text-amber-950">{verificationPendingCount}</div>
            <div className="text-[11px] font-semibold text-amber-800">In Verification</div>
            <div className="text-[10px] text-amber-600">Pending at Tehsildar</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xl font-bold text-red-950">{expiredCount}</div>
            <div className="text-[11px] font-semibold text-red-800">Needs Renewal</div>
            <div className="text-[10px] text-red-600">Expired validity</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xl font-bold text-slate-800">{missingCount}</div>
            <div className="text-[11px] font-semibold text-slate-700">Missing / Unheld</div>
            <div className="text-[10px] text-slate-500">Requires application</div>
          </div>
        </div>
      </div>

      {/* Statutory Eligibility vs Document Readiness Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Civic Guarantee:</span> Document readiness is distinct from statutory eligibility. Documents verify your claim once legal qualifications (age, income, residency) are satisfied. Sahayak evaluates both dimensions independently.
        </div>
      </div>
    </div>
  );
};
