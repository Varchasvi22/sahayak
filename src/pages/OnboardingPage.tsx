import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  onboardingSchema,
  OnboardingFormData,
  defaultOnboardingValues,
} from '@/features/onboarding/schema';
import { StepProgressBar } from '@/features/onboarding/components/StepProgressBar';
import { Step1Welcome } from '@/features/onboarding/components/Step1Welcome';
import { Step2BasicInfo } from '@/features/onboarding/components/Step2BasicInfo';
import { Step3PersonalCircumstances } from '@/features/onboarding/components/Step3PersonalCircumstances';
import { Step4AdditionalEligibility } from '@/features/onboarding/components/Step4AdditionalEligibility';
import { Step5Review } from '@/features/onboarding/components/Step5Review';
import {
  upsertProfile,
  saveLocalOnboarding,
  getLocalOnboarding,
} from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form with defaults or cached draft
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaultOnboardingValues,
    mode: 'onTouched',
  });

  const { reset, trigger, getValues, handleSubmit } = form;

  // Hydrate from existing profile or local storage draft on mount
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name || '',
        dateOfBirth: profile.date_of_birth || '',
        age: profile.age ?? 21,
        gender: (profile.gender as any) || 'FEMALE',
        stateOfResidence: profile.state_of_residence || 'Uttar Pradesh',
        district: profile.district || '',
        residenceArea: (profile.residence_area as any) || 'URBAN',
        educationLevel: (profile.education_level as any) || 'GRADUATE',
        isStudent: profile.is_student ?? true,
        employmentStatus: (profile.employment_status as any) || 'STUDENT',
        annualFamilyIncome: profile.annual_family_income || 180000,
        beneficiaryCategories:
          (profile.additional_attributes as any)?.beneficiary_categories || ['STUDENTS'],
        socialCategory: (profile.social_category as any) || 'SC',
        hasBplCard: profile.has_bpl_card ?? false,
        ownsAgriculturalLand: profile.owns_agricultural_land ?? false,
        isDifferentlyAbled: profile.is_differently_abled ?? false,
        disabilityPercentage: profile.disability_percentage,
        hasUdidCard: (profile.additional_attributes as any)?.has_udid_card ?? false,
      });
    } else {
      const savedDraft = getLocalOnboarding();
      if (savedDraft) {
        reset(savedDraft);
      } else if (user?.user_metadata?.full_name) {
        reset({
          ...defaultOnboardingValues,
          fullName: user.user_metadata.full_name,
        });
      }
    }
  }, [profile, user, reset]);

  // Step 2 -> Step 3 Validation
  const handleNextFromStep2 = async () => {
    const isValid = await trigger([
      'fullName',
      'dateOfBirth',
      'age',
      'gender',
      'stateOfResidence',
      'district',
      'residenceArea',
    ]);
    if (isValid) {
      saveLocalOnboarding(getValues());
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 3 -> Step 4 Validation
  const handleNextFromStep3 = async () => {
    const isValid = await trigger([
      'educationLevel',
      'isStudent',
      'employmentStatus',
      'annualFamilyIncome',
      'beneficiaryCategories',
    ]);
    if (isValid) {
      saveLocalOnboarding(getValues());
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 4 -> Step 5 Validation
  const handleNextFromStep4 = async () => {
    const isValid = await trigger([
      'socialCategory',
      'hasBplCard',
      'ownsAgriculturalLand',
      'isDifferentlyAbled',
      'disabilityPercentage',
      'hasUdidCard',
    ]);
    if (isValid) {
      saveLocalOnboarding(getValues());
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step Jump from Review Card
  const handleEditStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submission (Step 5 -> Step 6 Dashboard)
  const onFinalSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Always save locally to ensure no loss of progress
      saveLocalOnboarding(data);

      // 2. If citizen is authenticated, upsert directly to Supabase profiles
      if (user) {
        const { error } = await upsertProfile(user.id, data);
        if (error) {
          console.error('Failed to sync profile to Supabase:', error);
          setSubmitError(
            'Saved locally, but could not sync to your cloud account: ' + error.message
          );
        } else {
          await refreshProfile();
        }
      }

      // 3. Step 6: Redirect to the applicant dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Submission unexpected error:', err);
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 space-y-6">
      {/* Progress Bar (Visible on Steps 2 to 5) */}
      {currentStep > 1 && (
        <StepProgressBar
          currentStep={currentStep}
          totalSteps={5}
          onStepClick={(step) => {
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />
      )}

      {/* Error Banner if any */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Notice:</strong>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Step Components */}
      {currentStep === 1 && (
        <Step1Welcome
          onStart={() => {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentStep === 2 && (
        <Step2BasicInfo
          form={form}
          onNext={handleNextFromStep2}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Step3PersonalCircumstances
          form={form}
          onNext={handleNextFromStep3}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && (
        <Step4AdditionalEligibility
          form={form}
          onNext={handleNextFromStep4}
          onBack={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 5 && (
        <Step5Review
          formData={form.getValues()}
          onEditStep={handleEditStep}
          onSubmit={handleSubmit(onFinalSubmit)}
          onBack={() => setCurrentStep(4)}
          isSubmitting={isSubmitting}
          isAuthenticated={!!user}
        />
      )}

      {/* Footer Trust Marker */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 text-center">
        <ShieldCheck className="w-4 h-4 text-civic-emerald shrink-0" />
        <span>
          Deterministic eligibility evaluation • No Aadhaar or confidential banking credentials requested
        </span>
      </div>
    </div>
  );
};
