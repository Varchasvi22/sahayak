import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { INDIAN_STATES_AND_UTS, SOCIAL_CATEGORIES, EMPLOYMENT_STATUS_OPTIONS } from '@/data/constants';
import { Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="eligible">Profile Settings</Badge>
            <span className="text-xs text-slate-500 font-medium">Auto-Syncs with Eligibility Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Applicant Demographics</h1>
          <p className="text-xs text-slate-600 mt-1">
            Updating your profile parameters will automatically re-run rule evaluation across all schemes.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
          Save Profile Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal & Geographic Information</CardTitle>
          <CardDescription>
            Your state and district determine eligibility for state-specific schemes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name (for display only)" placeholder="Priya Sharma" />
            <Input label="Date of Birth" type="date" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="State / Union Territory"
              options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
            />
            <Input label="District" placeholder="e.g. Varanasi" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Socio-Economic & Employment Profile</CardTitle>
          <CardDescription>
            Used strictly for deterministic welfare rule calculations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Annual Family Income (₹)" type="number" placeholder="200000" />
            <Select
              label="Social Category"
              options={SOCIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
            <Select
              label="Employment Status"
              options={EMPLOYMENT_STATUS_OPTIONS.map((e) => ({ value: e.value, label: e.label }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Live profile saving via Supabase RLS will be wired in <strong>Phase 2</strong>.
      </div>
    </div>
  );
};
