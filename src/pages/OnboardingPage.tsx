import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { INDIAN_STATES_AND_UTS, SOCIAL_CATEGORIES } from '@/data/constants';
import { ArrowRight } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-6 space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="info">Progressive Profiling</Badge>
          <span className="text-xs text-slate-500 font-medium">Step 1 of 3</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Find Schemes That Match You
        </h1>
        <p className="text-sm text-slate-600">
          Answer basic questions to evaluate your eligibility across central and state welfare initiatives.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demographics & Location</CardTitle>
          <CardDescription>
            Eligibility often depends on your resident state, age, and social category.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Your Age" type="number" placeholder="e.g. 21" min={1} max={120} />
            <Select
              label="Gender"
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
              label="State / Union Territory"
              options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
              placeholder="Select your State / UT"
            />
            <Select
              label="Social Category"
              options={SOCIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              placeholder="Select Category"
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Rule engine & multi-step questionnaire will be wired in <strong>Phase 2</strong>.
            </span>
            <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Economic Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
