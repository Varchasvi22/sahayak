import React from 'react';
import { Link } from 'react-router-dom';
import { ProfileCompletenessResult } from '../dashboardUtils';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileCompletenessCardProps {
  completeness: ProfileCompletenessResult;
}

export const ProfileCompletenessCard: React.FC<ProfileCompletenessCardProps> = ({
  completeness,
}) => {
  const { percentage, missingFields, isComplete } = completeness;

  if (isComplete) {
    return (
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">
              Profile 100% Complete & Verified
            </h4>
            <p className="text-[11px] text-emerald-800">
              All 10 core eligibility parameters are present for automated statutory matching.
            </p>
          </div>
        </div>
        <Link to="/profile">
          <span className="text-xs font-semibold text-civic-emerald hover:underline">
            Review Details
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl shadow-subtle space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Applicant Profile is {percentage}% Complete
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                {missingFields.length} Attribute{missingFields.length !== 1 ? 's' : ''} Missing
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Sahayak never guesses missing parameters. Add missing details to unlock verified eligibility evaluations.
            </p>
          </div>
        </div>

        <Link to="/onboarding" className="shrink-0">
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Complete Profile
          </Button>
        </Link>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-amber-200">
        <div
          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Missing attributes chips */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Unfilled for Evaluation:
        </span>
        {missingFields.map((field) => (
          <span
            key={field.key}
            title={field.reason}
            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-amber-300 shadow-2xs"
          >
            {field.label}
          </span>
        ))}
      </div>
    </div>
  );
};
