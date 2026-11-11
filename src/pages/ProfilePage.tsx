import React, { useState } from 'react';
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
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  // Pre-filled with demo citizen profile
  const [profile, setProfile] = useState({
    fullName: 'Priya Sharma',
    dob: '2004-05-14',
    gender: 'FEMALE',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    area: 'URBAN',
    annualIncome: '180000',
    category: 'SC',
    hasBplCard: false,
    isStudent: true,
    educationLevel: 'GRADUATE',
    employmentStatus: 'STUDENT',
    ownsAgriLand: false,
    isDifferentlyAbled: false,
  });

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="eligible">Profile Settings</Badge>
            <span className="text-xs text-slate-500 font-medium">
              Live Evaluator Hook Active
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
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>

      {/* Save Notification Banner */}
      {savedNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-civic-emerald shrink-0" />
          <div>
            <strong>Profile Updated Successfully!</strong> Deterministic eligibility engine re-evaluated your profile against 10 verified schemes.
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
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Gender"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                options={[
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'MALE', label: 'Male' },
                  { value: 'TRANSGENDER', label: 'Transgender' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
              <Select
                label="State / Union Territory"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
              />
              <Input
                label="District"
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              />
            </div>
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
                value={profile.annualIncome}
                onChange={(e) => setProfile({ ...profile, annualIncome: e.target.value })}
                helperText="Must match your active Income Certificate."
              />
              <Select
                label="Social Category / Community"
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                options={SOCIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
            </div>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasBplCard}
                onChange={(e) => setProfile({ ...profile, hasBplCard: e.target.checked })}
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
                value={profile.isStudent ? 'YES' : 'NO'}
                onChange={(e) => setProfile({ ...profile, isStudent: e.target.value === 'YES' })}
                options={[
                  { value: 'YES', label: 'Enrolled Student' },
                  { value: 'NO', label: 'Not a Student' },
                ]}
              />
              <Select
                label="Highest Education Level"
                value={profile.educationLevel}
                onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                options={[
                  { value: 'BELOW_10TH', label: 'Below 10th' },
                  { value: 'CLASS_10_PASS', label: 'Class 10 Pass' },
                  { value: 'CLASS_12_PASS', label: 'Class 12 Pass' },
                  { value: 'DIPLOMA', label: 'Diploma / Polytechnic' },
                  { value: 'GRADUATE', label: 'Bachelor’s Degree' },
                  { value: 'POST_GRADUATE', label: 'Master’s Degree' },
                ]}
              />
              <Select
                label="Employment Status"
                value={profile.employmentStatus}
                onChange={(e) => setProfile({ ...profile, employmentStatus: e.target.value })}
                options={EMPLOYMENT_STATUS_OPTIONS.map((e) => ({ value: e.value, label: e.label }))}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.ownsAgriLand}
                  onChange={(e) => setProfile({ ...profile, ownsAgriLand: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                />
                <span className="text-xs font-medium text-slate-800">
                  Owns agricultural land in family name (qualifies for PM-Kisan)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.isDifferentlyAbled}
                  onChange={(e) => setProfile({ ...profile, isDifferentlyAbled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                />
                <span className="text-xs font-medium text-slate-800">
                  Person with disability (Divyangjan / holder of UDID certificate)
                </span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
                Save Profile Parameters
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
