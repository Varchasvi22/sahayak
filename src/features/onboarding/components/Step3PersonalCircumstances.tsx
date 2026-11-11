import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { OnboardingFormData } from '../schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EMPLOYMENT_STATUS_OPTIONS, BENEFICIARY_CATEGORIES } from '@/data/constants';
import { formatINR } from '@/lib/utils';
import { ArrowRight, ArrowLeft, Banknote, Check } from 'lucide-react';

interface Step3PersonalCircumstancesProps {
  form: UseFormReturn<OnboardingFormData>;
  onNext: () => void;
  onBack: () => void;
}

export const Step3PersonalCircumstances: React.FC<Step3PersonalCircumstancesProps> = ({
  form,
  onNext,
  onBack,
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const selectedCategories = watch('beneficiaryCategories') || [];
  const currentIncome = watch('annualFamilyIncome') || 0;

  const toggleCategory = (catKey: string) => {
    if (selectedCategories.includes(catKey)) {
      if (selectedCategories.length > 1) {
        setValue(
          'beneficiaryCategories',
          selectedCategories.filter((k) => k !== catKey),
          { shouldValidate: true }
        );
      }
    } else {
      setValue('beneficiaryCategories', [...selectedCategories, catKey], {
        shouldValidate: true,
      });
    }
  };

  return (
    <Card className="shadow-card border-civic-border">
      <CardHeader className="space-y-1 p-6 sm:p-8 pb-4">
        <div className="flex items-center gap-2 text-civic-emerald text-xs font-bold uppercase tracking-wider">
          <Banknote className="w-4 h-4" />
          <span>Stage 2 of 4 • Personal & Socio-Economic Circumstances</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
          Your Education, Vocation & Income
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-600">
          Welfare grants are designed for specific income brackets and educational or occupational pursuits.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6 sm:p-8 pt-2">
        {/* Education Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Highest Completed Education Level"
            {...register('educationLevel')}
            error={errors.educationLevel?.message}
            options={[
              { value: 'BELOW_10TH', label: 'Below Class 10' },
              { value: 'CLASS_10_PASS', label: 'Class 10 Pass (SSLC / Matric)' },
              { value: 'CLASS_12_PASS', label: 'Class 12 Pass (HSC / Intermediate)' },
              { value: 'DIPLOMA', label: 'Polytechnic / Technical Diploma' },
              { value: 'GRADUATE', label: 'Bachelor’s Degree (Graduate)' },
              { value: 'POST_GRADUATE', label: 'Master’s Degree / Professional' },
              { value: 'DOCTORATE', label: 'Doctorate / PhD' },
            ]}
          />

          <Select
            label="Current Employment / Vocational Status"
            {...register('employmentStatus')}
            error={errors.employmentStatus?.message}
            options={EMPLOYMENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        {/* Student Status Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isStudent')}
              className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Are you currently an enrolled student in a school, college, or university?
              </span>
              <span className="text-slate-500">
                Unlocks post-matric scholarships, fee reimbursements, and hostel stipends.
              </span>
            </div>
          </label>
        </div>

        {/* Annual Family Income */}
        <div className="space-y-1.5">
          <Input
            label="Estimated Annual Household Income (₹)"
            type="number"
            {...register('annualFamilyIncome')}
            error={errors.annualFamilyIncome?.message}
            helperText={`Current estimate: ${formatINR(Number(currentIncome) || 0)} per year from all sources before tax.`}
          />
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-900 leading-relaxed">
            <strong>Why income is critical:</strong> Most government welfare initiatives operate with statutory income ceilings.
            For instance, Central Post-Matric Scholarships cap income at ₹2,50,000/year, while Ayushman Bharat uses SECC poverty thresholds.
          </div>
        </div>

        {/* Primary Beneficiary Focus Categories (Multi-select) */}
        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium text-slate-700">
            Which Welfare Areas Are Most Relevant to You? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BENEFICIARY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-civic-emerald text-emerald-950 font-semibold ring-1 ring-emerald-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{cat.label}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? 'bg-civic-emerald text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
          {errors.beneficiaryCategories && (
            <p className="text-xs text-red-600 font-medium">{errors.beneficiaryCategories.message}</p>
          )}
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-civic-border flex items-center justify-between">
          <Button variant="outline" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button variant="primary" size="md" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Continue to Additional Eligibility
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
