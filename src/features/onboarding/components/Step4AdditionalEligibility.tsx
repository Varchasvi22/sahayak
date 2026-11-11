import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { OnboardingFormData } from '../schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SOCIAL_CATEGORIES } from '@/data/constants';
import { ArrowRight, ArrowLeft, ShieldAlert, Accessibility, Tractor, Info, Lock } from 'lucide-react';

interface Step4AdditionalEligibilityProps {
  form: UseFormReturn<OnboardingFormData>;
  onNext: () => void;
  onBack: () => void;
}

export const Step4AdditionalEligibility: React.FC<Step4AdditionalEligibilityProps> = ({
  form,
  onNext,
  onBack,
}) => {
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const isDifferentlyAbled = watch('isDifferentlyAbled');
  const employmentStatus = watch('employmentStatus');
  const isFarmer = employmentStatus === 'FARMER';

  return (
    <Card className="shadow-card border-civic-border">
      <CardHeader className="space-y-1 p-6 sm:p-8 pb-4">
        <div className="flex items-center gap-2 text-civic-emerald text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Stage 3 of 4 • Additional Scheme-Specific Eligibility</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
          Statutory Categories & Special Eligibility
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-600">
          These criteria unlock specialized welfare programs, affirmative action quotas, and disability pensions.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6 sm:p-8 pt-2">
        {/* Social Category with Privacy Explanation */}
        <div className="space-y-2">
          <Select
            label="Social Category / Community"
            {...register('socialCategory')}
            error={errors.socialCategory?.message}
            options={SOCIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Why community category is requested:</strong> Under Indian central and state welfare laws,
              affirmative action (e.g. 100% Post-Matric Tuition Waivers for SC/ST, and OBC fee concessions) is statutory.
              Your answer is encrypted and never used for non-welfare purposes.
            </div>
          </div>
        </div>

        {/* NFSA BPL Ration Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('hasBplCard')}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Does your household possess an active BPL, Antyodaya (AAY), or NFSA Priority Ration Card?
              </span>
              <span className="text-slate-500 mt-0.5 block">
                Directly qualifies your family for Ayushman Bharat (₹5 Lakh annual health cover) and subsidized housing under PMAY.
              </span>
            </div>
          </label>
        </div>

        {/* Agricultural Landholding (Conditional emphasis for Farmers/Rural) */}
        <div className={`p-4 rounded-xl border transition-all ${
          isFarmer ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('ownsAgriculturalLand')}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5 text-civic-emerald" />
                <span>Does your family own cultivable agricultural land?</span>
              </span>
              <span className="text-slate-500 mt-0.5 block">
                Mandatory legal requirement for PM-Kisan Samman Nidhi (₹6,000/year direct transfer).
              </span>
            </div>
          </label>
        </div>

        {/* Disability / Divyangjan (Conditional Input) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isDifferentlyAbled')}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-civic-emerald" />
                <span>Are you a person with a benchmark disability (Divyangjan)?</span>
              </span>
              <span className="text-slate-500 mt-0.5 block">
                Unlocks statutory disability pensions, assistive aid allocations, and academic fee remissions.
              </span>
            </div>
          </label>

          {/* Conditional sub-questions when disability is checked */}
          {isDifferentlyAbled && (
            <div className="pl-7 pt-2 space-y-3 border-t border-slate-200 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Disability Percentage (%) (Optional)"
                  type="number"
                  placeholder="e.g. 40"
                  {...register('disabilityPercentage')}
                  error={errors.disabilityPercentage?.message}
                  helperText="Benchmark schemes in India typically require 40% or higher."
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Do you hold a Unique Disability ID (UDID) Card?
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-300 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      {...register('hasUdidCard')}
                      className="rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                    />
                    <span>Yes, I have an issued Swavlamban UDID card</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Aadhaar Non-Collection Assurance */}
        <div className="p-3 bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Zero-Aadhaar Reminder:</strong> Sahayak does not collect Aadhaar numbers, biometric scans, or bank passwords.
          </span>
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-civic-border flex items-center justify-between">
          <Button variant="outline" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button variant="primary" size="md" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Review My Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
