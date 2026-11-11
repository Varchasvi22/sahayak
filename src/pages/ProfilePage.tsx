import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  INDIAN_STATES_AND_UTS,
  SOCIAL_CATEGORIES,
  EMPLOYMENT_STATUS_OPTIONS,
} from '@/data/constants';
import {
  Save,
  ShieldCheck,
  CheckCircle2,
  User,
  Banknote,
  GraduationCap,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  upsertProfile,
  getLocalOnboarding,
  saveLocalOnboarding,
} from '@/services/profileService';
import { OnboardingFormData, defaultOnboardingValues } from '@/features/onboarding/schema';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>(defaultOnboardingValues);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load from Supabase profile or local storage on mount
  useEffect(() => {
    if (profile) {
      setFormData({
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
      const local = getLocalOnboarding();
      if (local) {
        setFormData(local);
      } else if (user?.user_metadata?.full_name) {
        setFormData((prev) => ({
          ...prev,
          fullName: user.user_metadata.full_name,
        }));
      }
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSavedNotification(null);

    try {
      // 1. Always update local storage
      saveLocalOnboarding(formData);

      // 2. If user is logged in, upsert to Supabase
      if (user) {
        const { error } = await upsertProfile(user.id, formData);
        if (error) {
          throw new Error('Supabase sync error: ' + error.message);
        }
        await refreshProfile();
        setSavedNotification('Profile successfully synchronized to your Supabase account!');
      } else {
        setSavedNotification('Profile saved locally in your browser session.');
      }

      setTimeout(() => setSavedNotification(null), 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMessage(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="eligible">Profile Settings</Badge>
            <span className="text-xs text-slate-500 font-medium">
              {user ? 'Cloud Sync Active (PostgreSQL RLS)' : 'Local Session Mode'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Applicant Demographics & Attributes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Updating your profile parameters automatically re-runs deterministic eligibility evaluation across all schemes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Save Notification Banner */}
      {savedNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-civic-emerald shrink-0" />
          <div>
            <strong>{savedNotification}</strong> Deterministic eligibility engine re-evaluated your profile parameters.
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <strong>Error saving profile:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Reassurance Banner */}
      <div className="p-4 bg-white border border-civic-border rounded-xl flex items-center gap-3 text-xs text-slate-600 shadow-subtle">
        <ShieldCheck className="w-5 h-5 text-civic-emerald shrink-0" />
        <div>
          <strong>Zero-Aadhaar Data Minimization:</strong> We do not store biometric numbers or Aadhaar records.
          These parameters are stored securely under PostgreSQL Row Level Security (RLS) linked only to your account.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal & Geographic */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <User className="w-5 h-5 text-civic-emerald" />
            <div>
              <CardTitle className="text-base">Personal & Geographic Information</CardTitle>
              <CardDescription className="text-xs">
                Residency and age boundaries dictate eligibility for state and age-restricted schemes.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <Input
                  label="Age (Years)"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 0 })}
                  min={1}
                  max={120}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                options={[
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'MALE', label: 'Male' },
                  { value: 'TRANSGENDER', label: 'Transgender' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
              <Select
                label="State / Union Territory"
                value={formData.stateOfResidence}
                onChange={(e) => setFormData({ ...formData, stateOfResidence: e.target.value })}
                options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
              />
              <Input
                label="District"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>

            <Select
              label="Residence Area Type"
              value={formData.residenceArea}
              onChange={(e) => setFormData({ ...formData, residenceArea: e.target.value as any })}
              options={[
                { value: 'RURAL', label: 'Rural (Gram Panchayat / Village)' },
                { value: 'URBAN', label: 'Urban (Municipality / Metropolitan)' },
                { value: 'SEMI_URBAN', label: 'Semi-Urban (Town / Nagar Panchayat)' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Section 2: Socio-Economic */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Banknote className="w-5 h-5 text-civic-emerald" />
            <div>
              <CardTitle className="text-base">Socio-Economic Profile</CardTitle>
              <CardDescription className="text-xs">
                Used to compute income limit rules and community reservations.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Annual Family Income (₹)"
                type="number"
                value={formData.annualFamilyIncome}
                onChange={(e) =>
                  setFormData({ ...formData, annualFamilyIncome: Number(e.target.value) || 0 })
                }
                helperText="Total income from all sources before tax."
              />
              <Select
                label="Social Category / Community"
                value={formData.socialCategory}
                onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value as any })}
                options={SOCIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
            </div>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasBplCard}
                onChange={(e) => setFormData({ ...formData, hasBplCard: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
              />
              <span className="text-xs font-medium text-slate-800">
                My family holds an active NFSA BPL / Antyodaya (AAY) Ration Card
              </span>
            </label>
          </CardContent>
        </Card>

        {/* Section 3: Education & Occupation */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <GraduationCap className="w-5 h-5 text-civic-emerald" />
            <div>
              <CardTitle className="text-base">Education & Vocation</CardTitle>
              <CardDescription className="text-xs">
                Essential for student scholarships, farmer subsidies, and unemployment allowances.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Student Status"
                value={formData.isStudent ? 'YES' : 'NO'}
                onChange={(e) => setFormData({ ...formData, isStudent: e.target.value === 'YES' })}
                options={[
                  { value: 'YES', label: 'Enrolled Student' },
                  { value: 'NO', label: 'Not a Student' },
                ]}
              />
              <Select
                label="Highest Education Level"
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as any })}
                options={[
                  { value: 'BELOW_10TH', label: 'Below 10th' },
                  { value: 'CLASS_10_PASS', label: 'Class 10 Pass' },
                  { value: 'CLASS_12_PASS', label: 'Class 12 Pass' },
                  { value: 'DIPLOMA', label: 'Diploma / Polytechnic' },
                  { value: 'GRADUATE', label: 'Bachelor’s Degree' },
                  { value: 'POST_GRADUATE', label: 'Master’s Degree' },
                  { value: 'DOCTORATE', label: 'Doctorate / PhD' },
                ]}
              />
              <Select
                label="Employment Status"
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                options={EMPLOYMENT_STATUS_OPTIONS.map((e) => ({ value: e.value, label: e.label }))}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ownsAgriculturalLand}
                  onChange={(e) =>
                    setFormData({ ...formData, ownsAgriculturalLand: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                />
                <span className="text-xs font-medium text-slate-800">
                  Owns cultivable agricultural land in family name (qualifies for PM-Kisan)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDifferentlyAbled}
                  onChange={(e) =>
                    setFormData({ ...formData, isDifferentlyAbled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                />
                <span className="text-xs font-medium text-slate-800">
                  Person with disability (Divyangjan / holder of UDID certificate)
                </span>
              </label>

              {formData.isDifferentlyAbled && (
                <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Input
                    label="Disability Percentage (%)"
                    type="number"
                    value={formData.disabilityPercentage ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        disabilityPercentage: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    min={0}
                    max={100}
                  />
                  <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer text-xs mt-6">
                    <input
                      type="checkbox"
                      checked={formData.hasUdidCard}
                      onChange={(e) => setFormData({ ...formData, hasUdidCard: e.target.checked })}
                      className="rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                    />
                    <span>Holds issued UDID card</span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Parameters'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
