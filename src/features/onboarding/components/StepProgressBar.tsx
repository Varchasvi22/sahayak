import React from 'react';
import { CheckCircle2, User, Banknote, ShieldAlert, Sparkles, ClipboardCheck } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps,
  onStepClick,
}) => {
  const steps = [
    { num: 1, label: 'Welcome', icon: Sparkles },
    { num: 2, label: 'Basic Info', icon: User },
    { num: 3, label: 'Circumstances', icon: Banknote },
    { num: 4, label: 'Eligibility Details', icon: ShieldAlert },
    { num: 5, label: 'Review & Confirm', icon: ClipboardCheck },
  ];

  const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="bg-white border border-civic-border rounded-2xl p-4 sm:p-5 shadow-subtle space-y-3">
      {/* Top progress metrics */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900 uppercase tracking-wider">
          Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.label}
        </span>
        <span className="font-mono font-semibold text-civic-emerald">
          {percentage}% Complete
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-civic-emerald h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Step Pills (Desktop) */}
      <div className="hidden sm:grid grid-cols-5 gap-2 pt-1">
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          const canClick = isDone && onStepClick;

          return (
            <button
              key={s.num}
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onStepClick(s.num)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                isCurrent
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : isDone
                  ? 'text-civic-emerald hover:bg-emerald-50 cursor-pointer'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isDone
                    ? 'bg-civic-emerald text-white'
                    : isCurrent
                    ? 'bg-civic-navy text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
              </div>
              <span className="text-[11px] truncate leading-tight">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
