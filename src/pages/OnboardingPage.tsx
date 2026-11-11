import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import {
  INDIAN_STATES_AND_UTS,
  SOCIAL_CATEGORIES,
  EMPLOYMENT_STATUS_OPTIONS,
} from '@/data/constants';
import {
  ShieldCheck,
  User,
  Banknote,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Demographics
    age: '20',
    gender: 'FEMALE',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    area: 'URBAN',
    // Step 2: Socio-Economic
    annualIncome: '180000',
    category: 'SC',
    hasBplCard: false,
    // Step 3: Education & Occupation
    isStudent: true,
    educationLevel: 'GRADUATE',
    employmentStatus: 'STUDENT',
    ownsAgriLand: false,
    isDifferentlyAbled: false,
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFinish = () => {
    // Routes to dashboard with live matching schemes
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-civic-emerald text-xs font-semibold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>2-Minute Eligibility Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Government Schemes Tailored to You
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          We evaluate your profile against verified criteria. No Aadhaar numbers or certificate uploads needed.
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white border border-civic-border rounded-xl p-4 shadow-subtle">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Location & Demographics', icon: User },
            { num: 2, label: 'Socio-Economic Profile', icon: Banknote },
            { num: 3, label: 'Education & Vocation', icon: GraduationCap },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-civic-emerald text-white'
                      : isCurrent
                      ? 'bg-civic-navy text-white ring-4 ring-slate-100'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {s.num}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Form Card */}
      <Card className="shadow-card border-civic-border">
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Basic Demographics</CardTitle>
              <CardDescription>
                Welfare schemes have specific age ranges and state-level residency guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Age (Years)"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  min={1}
                  max={120}
                />
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'MALE', label: 'Male' },
                    { value: 'TRANSGENDER', label: 'Transgender' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="State or Union Territory of Residence"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
                />
                <Input
                  label="District"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Varanasi / Bengaluru"
                />
              </div>

              <Select
                label="Residence Area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                options={[
                  { value: 'RURAL', label: 'Rural (Gram Panchayat / Village)' },
                  { value: 'URBAN', label: 'Urban (Municipality / Municipal Corporation)' },
                  { value: 'SEMI_URBAN', label: 'Semi-Urban / Nagar Panchayat' },
                ]}
              />
            </CardContent>
          </>
        )}

        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Socio-Economic Profile</CardTitle>
              <CardDescription>
                Income thresholds and social categories determine financial entitlement tiers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Estimated Annual Family Income (₹)"
                type="number"
                value={formData.annualIncome}
                onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                helperText="Total income from all sources before tax. Many scholarships set limits at ₹2,50,000."
              />

              <Select
                label="Social Category / Community"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={SOCIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                helperText="SC/ST/OBC categories qualify for specific affirmative welfare schemes."
              />

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasBplCard}
                    onChange={(e) => setFormData({ ...formData, hasBplCard: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      Does your family hold a BPL or Antyodaya (AAY) Ration Card?
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unlocks heavily subsidized housing (PMAY) and universal health cover (Ayushman Bharat).
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Step 3: Education & Occupation</CardTitle>
              <CardDescription>
                Helps match scholarships, farmer subsidies, and unemployment allowances.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Are you currently an enrolled student?"
                  value={formData.isStudent ? 'YES' : 'NO'}
                  onChange={(e) => setFormData({ ...formData, isStudent: e.target.value === 'YES' })}
                  options={[
                    { value: 'YES', label: 'Yes, Enrolled in College / School' },
                    { value: 'NO', label: 'No, Not Currently a Student' },
                  ]}
                />
                <Select
                  label="Highest Education Level"
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  options={[
                    { value: 'BELOW_10TH', label: 'Below 10th' },
                    { value: 'CLASS_10_PASS', label: 'Class 10 Pass (SSLC)' },
                    { value: 'CLASS_12_PASS', label: 'Class 12 Pass (HSC)' },
                    { value: 'DIPLOMA', label: 'Polytechnic / Diploma' },
                    { value: 'GRADUATE', label: 'Bachelor’s Degree (Graduate)' },
                    { value: 'POST_GRADUATE', label: 'Master’s / Post Graduate' },
                  ]}
                />
              </div>

              <Select
                label="Current Occupation / Employment Status"
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                options={EMPLOYMENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ownsAgriLand}
                    onChange={(e) => setFormData({ ...formData, ownsAgriLand: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    My family owns cultivable agricultural land (qualifies for PM-Kisan)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDifferentlyAbled}
                    onChange={(e) => setFormData({ ...formData, isDifferentlyAbled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    I am a person with a disability (Divyangjan / hold UDID card)
                  </span>
                </label>
              </div>
            </CardContent>
          </>
        )}

        {/* Stepper Controls */}
        <div className="p-6 border-t border-civic-border bg-slate-50/50 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" size="sm" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : (
            <span className="text-xs text-slate-400">Step 1 of 3</span>
          )}

          {currentStep < 3 ? (
            <Button variant="primary" size="sm" onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleFinish}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-civic-emerald hover:bg-emerald-700"
            >
              Run Eligibility Check
            </Button>
          )}
        </div>
      </Card>

      {/* Reassurance Banner */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
        <ShieldCheck className="w-4 h-4 text-civic-emerald" />
        <span>Your answers are evaluated deterministically. You can edit parameters anytime in Profile.</span>
      </div>
    </div>
  );
};
