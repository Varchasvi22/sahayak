import React from 'react';
import { OnboardingFormData } from '../schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  BENEFICIARY_CATEGORIES,
  SOCIAL_CATEGORIES,
  EMPLOYMENT_STATUS_OPTIONS,
} from '@/data/constants';
import {
  CheckCircle2,
  ArrowLeft,
  Edit2,
  User,
  Banknote,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface Step5ReviewProps {
  formData: OnboardingFormData;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isAuthenticated: boolean;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  formData,
  onEditStep,
  onSubmit,
  onBack,
  isSubmitting,
  isAuthenticated,
}) => {
  // Label Lookups
  const categoryLabel =
    SOCIAL_CATEGORIES.find((c) => c.value === formData.socialCategory)?.label ||
    formData.socialCategory;

  const employmentLabel =
    EMPLOYMENT_STATUS_OPTIONS.find((e) => e.value === formData.employmentStatus)?.label ||
    formData.employmentStatus;

  const beneficiaryLabels = formData.beneficiaryCategories.map((key) => {
    const found = BENEFICIARY_CATEGORIES.find((b) => b.value === key);
    return found ? found.label : key;
  });

  return (
    <Card className="shadow-card border-civic-border">
      <CardHeader className="space-y-1 p-6 sm:p-8 pb-4">
        <div className="flex items-center gap-2 text-civic-emerald text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Stage 4 of 4 • Final Review & Confirmation</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
          Verify Your Profile Before Discovery
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-600">
          Review the details below. Our deterministic engine will match your profile against
          verified Central and State eligibility rules.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6 sm:p-8 pt-2">
        {/* Section 1: Demographics */}
        <div className="rounded-xl border border-civic-border bg-white p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <User className="w-4 h-4 text-civic-navy" />
              <span>Basic Information & Demographics</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-civic-emerald hover:text-emerald-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Full Name</span>
              <span className="font-semibold text-slate-800">{formData.fullName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Age</span>
              <span className="font-semibold text-slate-800">{formData.age} years</span>
            </div>
            <div>
              <span className="text-slate-400 block">Gender</span>
              <span className="font-semibold text-slate-800 capitalize">
                {formData.gender.toLowerCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">State / UT</span>
              <span className="font-semibold text-slate-800">{formData.stateOfResidence}</span>
            </div>
            <div>
              <span className="text-slate-400 block">District</span>
              <span className="font-semibold text-slate-800">{formData.district}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Residence Area</span>
              <span className="font-semibold text-slate-800 capitalize">
                {formData.residenceArea.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Circumstances */}
        <div className="rounded-xl border border-civic-border bg-white p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Banknote className="w-4 h-4 text-civic-navy" />
              <span>Education, Vocation & Income</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-civic-emerald hover:text-emerald-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Highest Education</span>
              <span className="font-semibold text-slate-800">{formData.educationLevel}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Student Status</span>
              <span className="font-semibold text-slate-800">
                {formData.isStudent ? 'Enrolled Student' : 'Not Enrolled'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Occupation / Status</span>
              <span className="font-semibold text-slate-800">{employmentLabel}</span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-slate-400 block">Annual Household Income</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatINR(Number(formData.annualFamilyIncome) || 0)} / year
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-400 block text-xs mb-1.5">Welfare Focus Areas</span>
            <div className="flex flex-wrap gap-1.5">
              {beneficiaryLabels.map((lbl, idx) => (
                <Badge key={idx} variant="info" size="sm">
                  {lbl}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Statutory Categories */}
        <div className="rounded-xl border border-civic-border bg-white p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldAlert className="w-4 h-4 text-civic-navy" />
              <span>Statutory Categories & Special Eligibility</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-civic-emerald hover:text-emerald-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Social Category</span>
              <span className="font-semibold text-slate-800">{categoryLabel}</span>
            </div>
            <div>
              <span className="text-slate-400 block">BPL / Ration Card</span>
              <span className="font-semibold text-slate-800">
                {formData.hasBplCard ? 'Yes (Holds BPL/AAY Card)' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Agricultural Land</span>
              <span className="font-semibold text-slate-800">
                {formData.ownsAgriculturalLand ? 'Yes (Owns Agri Land)' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Differently Abled (Divyangjan)</span>
              <span className="font-semibold text-slate-800">
                {formData.isDifferentlyAbled
                  ? `Yes (${formData.disabilityPercentage || '40'}%)`
                  : 'No'}
              </span>
            </div>
            {formData.isDifferentlyAbled && (
              <div>
                <span className="text-slate-400 block">UDID Swavlamban Card</span>
                <span className="font-semibold text-slate-800">
                  {formData.hasUdidCard ? 'Yes, Possessed' : 'No'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Account Sync Status Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-civic-emerald" />
            <span>
              {isAuthenticated
                ? 'Saving to your secure Supabase Profile'
                : 'Saving to your local browser session'}
            </span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            {isAuthenticated
              ? 'Your profile is tied to your account and protected by Row Level Security. You can update any answer later in Profile Settings.'
              : 'You are currently not logged in. Your profile answers are safely saved in local storage so you can review eligible schemes immediately. You can sign up or log in anytime to sync.'}
          </p>
        </div>

        {/* Navigation & Submission Controls */}
        <div className="pt-4 border-t border-civic-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Back to Step 4
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            rightIcon={
              isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )
            }
            className="w-full sm:w-auto bg-civic-emerald hover:bg-emerald-700 shadow-sm"
          >
            {isSubmitting ? 'Evaluating Eligibility...' : 'Confirm & Run Scheme Discovery'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
