import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EvaluationStatus } from '@/types/scheme.types';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  FileCheck2,
  ShieldAlert,
} from 'lucide-react';

export const EligibilityResultsPage: React.FC = () => {
  // Demo Evaluation State (can toggle to see all 3 states)
  const [evaluationState, setEvaluationState] = useState<EvaluationStatus>('POTENTIALLY_ELIGIBLE');

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>

      {/* State Switcher for UI Demonstration */}
      <div className="bg-white border border-civic-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-700">Preview Engine State:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={evaluationState === 'POTENTIALLY_ELIGIBLE' ? 'primary' : 'outline'}
            onClick={() => setEvaluationState('POTENTIALLY_ELIGIBLE')}
          >
            Potentially Eligible
          </Button>
          <Button
            size="sm"
            variant={evaluationState === 'INSUFFICIENT_INFORMATION' ? 'primary' : 'outline'}
            onClick={() => setEvaluationState('INSUFFICIENT_INFORMATION')}
          >
            Insufficient Info
          </Button>
          <Button
            size="sm"
            variant={evaluationState === 'NOT_ELIGIBLE' ? 'danger' : 'outline'}
            onClick={() => setEvaluationState('NOT_ELIGIBLE')}
          >
            Not Eligible
          </Button>
        </div>
      </div>

      {/* Tri-State Banner */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border ${
          evaluationState === 'POTENTIALLY_ELIGIBLE'
            ? 'bg-status-eligibleBg border-status-eligibleBorder text-status-eligible'
            : evaluationState === 'INSUFFICIENT_INFORMATION'
            ? 'bg-status-unknownBg border-status-unknownBorder text-status-unknown'
            : 'bg-status-notEligibleBg border-status-notEligibleBorder text-status-notEligible'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {evaluationState === 'POTENTIALLY_ELIGIBLE' ? (
              <CheckCircle2 className="w-8 h-8 text-status-eligible" />
            ) : evaluationState === 'INSUFFICIENT_INFORMATION' ? (
              <HelpCircle className="w-8 h-8 text-status-unknown" />
            ) : (
              <XCircle className="w-8 h-8 text-status-notEligible" />
            )}
          </div>
          <div className="space-y-1">
            <Badge
              variant={
                evaluationState === 'POTENTIALLY_ELIGIBLE'
                  ? 'eligible'
                  : evaluationState === 'INSUFFICIENT_INFORMATION'
                  ? 'unknown'
                  : 'notEligible'
              }
              size="md"
            >
              {evaluationState.replace(/_/g, ' ')}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {evaluationState === 'POTENTIALLY_ELIGIBLE'
                ? 'You Potentially Meet All Official Criteria!'
                : evaluationState === 'INSUFFICIENT_INFORMATION'
                ? 'Additional Information Needed to Confirm Eligibility'
                : 'You Do Not Currently Meet the Eligibility Criteria'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1 max-w-2xl">
              {evaluationState === 'POTENTIALLY_ELIGIBLE'
                ? 'Based on your reported income (₹1,80,000), Scheduled Caste category, and student status, you qualify for the Post-Matric Scholarship for SC Students.'
                : evaluationState === 'INSUFFICIENT_INFORMATION'
                ? 'Your profile does not state whether your family holds cultivable agricultural land. We cannot evaluate PM-Kisan without this information.'
                : 'This scheme requires the beneficiary to be female and under 10 years of age. Your recorded age is 20.'}
            </p>
          </div>
        </div>
      </div>

      {/* Strict Engine Guarantee Alert */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Rule Engine Integrity:</strong> Evaluated by pure mathematical logic. Missing information is never assumed to be a pass.
        </span>
      </div>

      {/* Explainable Condition Audit Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Explainable Condition Breakdown
          </h2>
          <p className="text-xs text-slate-500">
            A transparent audit of every single requirement checked by our engine.
          </p>
        </div>

        {/* 1. Passed Conditions */}
        <Card className="border-emerald-200">
          <CardHeader className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-civic-emerald" />
              <CardTitle className="text-sm text-emerald-950 font-bold">
                Passed Conditions (3 Criteria Met)
              </CardTitle>
            </div>
            <Badge variant="eligible" size="sm">
              PASSED
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              {
                rule: 'Annual family income must not exceed ₹2,50,000',
                userVal: '₹1,80,000 / year',
                status: 'Met (₹70,000 below threshold)',
              },
              {
                rule: 'Must belong to Scheduled Caste (SC) category',
                userVal: 'SC (Scheduled Caste)',
                status: 'Met',
              },
              {
                rule: 'Must be actively enrolled in a post-matric recognized institution',
                userVal: 'Enrolled in Bachelor of Science',
                status: 'Met',
              },
            ].map((c, i) => (
              <div key={i} className="p-3 bg-white border border-slate-200/80 rounded-lg flex items-start justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{c.rule}</span>
                  <span className="text-slate-500 text-[11px]">Your profile value: {c.userVal}</span>
                </div>
                <span className="font-bold text-civic-emerald shrink-0">{c.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 2. Failed Conditions */}
        {evaluationState === 'NOT_ELIGIBLE' && (
          <Card className="border-red-200">
            <CardHeader className="bg-red-50/50 p-4 border-b border-red-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-sm text-red-950 font-bold">
                  Disqualifying Conditions (1 Clause Failed)
                </CardTitle>
              </div>
              <Badge variant="notEligible" size="sm">
                FAILED
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-white border border-red-200 rounded-lg flex items-start justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Age must be less than or equal to 10 years at time of account opening
                  </span>
                  <span className="text-slate-500 text-[11px]">Your profile value: 20 Years</span>
                </div>
                <span className="font-bold text-red-700 shrink-0">Age Limit Exceeded</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Unknown / Missing Information */}
        {evaluationState === 'INSUFFICIENT_INFORMATION' && (
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50/50 p-4 border-b border-amber-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-sm text-amber-950 font-bold">
                  Missing Information (1 Item Required)
                </CardTitle>
              </div>
              <Badge variant="unknown" size="sm">
                UNKNOWN
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-white border border-amber-200 rounded-lg flex items-start justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Cultivable agricultural landholding ownership status
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Status: Not provided in your onboarding questionnaire
                  </span>
                </div>
                <Link to="/profile">
                  <Button size="sm" variant="outline" className="border-amber-400 text-amber-900 hover:bg-amber-50">
                    Update in Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Step Action CTA */}
      <div className="p-6 bg-white border border-civic-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {evaluationState === 'POTENTIALLY_ELIGIBLE'
              ? 'Next Step: Check Document Readiness'
              : 'Next Step: Refine Your Profile'}
          </h3>
          <p className="text-xs text-slate-500">
            {evaluationState === 'POTENTIALLY_ELIGIBLE'
              ? 'Verify that you have all mandatory certificates in hand before visiting the official portal.'
              : 'Complete your missing parameters to uncover additional eligible schemes.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/vault">
            <Button variant="primary" size="md" rightIcon={<FileCheck2 className="w-4 h-4" />}>
              Open Document Checklist
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
