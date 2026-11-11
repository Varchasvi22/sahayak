import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { OnboardingFormData } from '../schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { INDIAN_STATES_AND_UTS } from '@/data/constants';
import { ArrowRight, ArrowLeft, User, Info } from 'lucide-react';

interface Step2BasicInfoProps {
  form: UseFormReturn<OnboardingFormData>;
  onNext: () => void;
  onBack: () => void;
}

export const Step2BasicInfo: React.FC<Step2BasicInfoProps> = ({ form, onNext, onBack }) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = form;

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobStr = e.target.value;
    setValue('dateOfBirth', dobStr);
    if (dobStr) {
      const birthDate = new Date(dobStr);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 1 && calculatedAge <= 120) {
        setValue('age', calculatedAge, { shouldValidate: true });
      }
    }
  };

  return (
    <Card className="shadow-card border-civic-border">
      <CardHeader className="space-y-1 p-6 sm:p-8 pb-4">
        <div className="flex items-center gap-2 text-civic-emerald text-xs font-bold uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>Stage 1 of 4 • Basic Demographics</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
          Where Do You Live & Who Are You?
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-600">
          Welfare schemes are administered at both Central and State levels, with specific geographic eligibility boundaries.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6 sm:p-8 pt-2">
        {/* Full Name */}
        <Input
          label="Your Full Name"
          placeholder="e.g. Priya Sharma"
          {...register('fullName')}
          error={errors.fullName?.message}
          helperText="Used strictly to address you on your application readiness checklist."
        />

        {/* Date of Birth & Age Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date of Birth (Optional)"
            type="date"
            {...register('dateOfBirth')}
            onChange={handleDobChange}
            error={errors.dateOfBirth?.message}
            helperText="Entering your birth date automatically computes your current age."
          />
          <Input
            label="Current Age (Years)"
            type="number"
            {...register('age')}
            error={errors.age?.message}
            helperText="Certain schemes (like APY: 18-40, SSY: <10) have strict age brackets."
          />
        </div>

        {/* Gender */}
        <Select
          label="Gender"
          {...register('gender')}
          error={errors.gender?.message}
          options={[
            { value: 'FEMALE', label: 'Female (Qualifies for women entrepreneurship & Beti Bachao schemes)' },
            { value: 'MALE', label: 'Male' },
            { value: 'TRANSGENDER', label: 'Transgender / Non-binary' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />

        {/* State of Residence */}
        <Select
          label="State or Union Territory of Residence"
          {...register('stateOfResidence')}
          error={errors.stateOfResidence?.message}
          options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
          helperText="Select your permanent residential jurisdiction to match state-specific schemes."
        />

        {/* District & Area Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="District of Residence"
            placeholder="e.g. Varanasi / Mysuru / Patna"
            {...register('district')}
            error={errors.district?.message}
          />
          <Select
            label="Residence Area Type"
            {...register('residenceArea')}
            error={errors.residenceArea?.message}
            options={[
              { value: 'RURAL', label: 'Rural (Gram Panchayat / Village Area)' },
              { value: 'URBAN', label: 'Urban (Municipality / Metropolitan)' },
              { value: 'SEMI_URBAN', label: 'Semi-Urban (Town / Nagar Panchayat)' },
            ]}
          />
        </div>

        {/* Why we ask this banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-civic-emerald shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why we ask for location:</strong> Many schemes (e.g. Pradhan Mantri Awas Yojana - Gramin vs. Urban)
            apply exclusively to specific geographic regions or require state domicile proofs.
          </p>
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-civic-border flex items-center justify-between">
          <Button variant="outline" size="md" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button variant="primary" size="md" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Continue to Personal Circumstances
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
