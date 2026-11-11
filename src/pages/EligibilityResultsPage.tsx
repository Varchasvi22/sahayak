import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  evaluateSchemeEligibility,
  SchemeEvaluationResult,
} from '@/features/eligibility';
import { getSchemes, getSchemeDetail, SchemeRow } from '@/services/schemeService';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalOnboarding } from '@/services/profileService';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Scale,
  Edit2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export const EligibilityResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useAuth();
  const localDraft = getLocalOnboarding();

  const [allSchemes, setAllSchemes] = useState<SchemeRow[]>([]);
  const [selectedSchemeSlug, setSelectedSchemeSlug] = useState<string>(
    searchParams.get('scheme') || ''
  );
  const [evaluationResult, setEvaluationResult] = useState<SchemeEvaluationResult | null>(null);
  const [currentScheme, setCurrentScheme] = useState<SchemeRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Formulate applicant profile input from live auth profile or local onboarding draft
  const applicantProfile = useMemo(() => {
    if (profile) {
      return {
        fullName: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        stateOfResidence: profile.state_of_residence,
        district: profile.district,
        residenceArea: profile.residence_area,
        annualFamilyIncome: profile.annual_family_income,
        socialCategory: profile.social_category,
        educationLevel: profile.education_level,
        isStudent: profile.is_student,
        employmentStatus: profile.employment_status,
        ownsAgriculturalLand: profile.owns_agricultural_land,
        hasBplCard: profile.has_bpl_card,
        isDifferentlyAbled: profile.is_differently_abled,
        disabilityPercentage: profile.disability_percentage,
        hasUdidCard: (profile.additional_attributes as any)?.has_udid_card,
      };
    }
    if (localDraft) {
      return {
        fullName: localDraft.fullName,
        age: localDraft.age,
        gender: localDraft.gender,
        stateOfResidence: localDraft.stateOfResidence,
        district: localDraft.district,
        residenceArea: localDraft.residenceArea,
        annualFamilyIncome: localDraft.annualFamilyIncome,
        socialCategory: localDraft.socialCategory,
        educationLevel: localDraft.educationLevel,
        isStudent: localDraft.isStudent,
        employmentStatus: localDraft.employmentStatus,
        ownsAgriculturalLand: localDraft.ownsAgriculturalLand,
        hasBplCard: localDraft.hasBplCard,
        isDifferentlyAbled: localDraft.isDifferentlyAbled,
        disabilityPercentage: localDraft.disabilityPercentage,
        hasUdidCard: localDraft.hasUdidCard,
      };
    }
    return {
      fullName: 'Guest Applicant',
      age: 21,
      gender: 'FEMALE',
      stateOfResidence: 'Uttar Pradesh',
      district: 'Varanasi',
      annualFamilyIncome: 180000,
      socialCategory: 'SC',
      educationLevel: 'GRADUATE',
      isStudent: true,
      employmentStatus: 'STUDENT',
      ownsAgriculturalLand: false,
      hasBplCard: false,
      isDifferentlyAbled: false,
    };
  }, [profile, localDraft]);

  // Load all schemes on mount
  useEffect(() => {
    async function loadSchemes() {
      const res = await getSchemes();
      setAllSchemes(res.data);
      if (res.data.length > 0 && !selectedSchemeSlug) {
        setSelectedSchemeSlug(res.data[0].slug);
      }
    }
    loadSchemes();
  }, [selectedSchemeSlug]);

  // Run deterministic evaluation on selected scheme
  useEffect(() => {
    async function evaluateSelected() {
      if (!selectedSchemeSlug) return;
      setIsLoading(true);

      const detailRes = await getSchemeDetail(selectedSchemeSlug);
      if (detailRes.data) {
        setCurrentScheme(detailRes.data.scheme);
        const evalRes = evaluateSchemeEligibility(
          detailRes.data.scheme.id,
          detailRes.data.rules,
          applicantProfile,
          detailRes.data.scheme.official_name
        );
        setEvaluationResult(evalRes);
      }
      setIsLoading(false);
    }

    evaluateSelected();
  }, [selectedSchemeSlug, applicantProfile]);

  const handleSchemeChange = (slug: string) => {
    setSelectedSchemeSlug(slug);
    setSearchParams({ scheme: slug });
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Deterministic Eligibility Evaluation Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Auditing applicant parameters against official gazette rules. No speculative AI decisions.
          </p>
        </div>

        <Link to="/profile">
          <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
            Adjust Profile Parameters
          </Button>
        </Link>
      </div>

      {/* 2. Scheme Switcher Dropdown */}
      <Card className="p-4 bg-white border-civic-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Scale className="w-4 h-4 text-civic-emerald" />
            <span>Select Target Government Scheme for Audit:</span>
          </div>
          <select
            value={selectedSchemeSlug}
            onChange={(e) => handleSchemeChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-civic-emerald"
          >
            {allSchemes.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.short_title || s.official_name} ({s.government_level})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* 3. Loading State */}
      {isLoading && (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-civic-emerald" />
          <p className="text-xs text-slate-500">Evaluating statutory eligibility conditions...</p>
        </div>
      )}

      {/* 4. Tri-State Overall Status Banner */}
      {!isLoading && evaluationResult && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border transition-all ${
            evaluationResult.status === 'POTENTIALLY_ELIGIBLE'
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : evaluationResult.status === 'INSUFFICIENT_INFORMATION'
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : 'bg-red-50/80 border-red-300 text-red-950'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {evaluationResult.status === 'POTENTIALLY_ELIGIBLE' ? (
                <CheckCircle2 className="w-8 h-8 text-civic-emerald shrink-0" />
              ) : evaluationResult.status === 'INSUFFICIENT_INFORMATION' ? (
                <HelpCircle className="w-8 h-8 text-amber-600 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
              )}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    evaluationResult.status === 'POTENTIALLY_ELIGIBLE'
                      ? 'eligible'
                      : evaluationResult.status === 'INSUFFICIENT_INFORMATION'
                      ? 'unknown'
                      : 'notEligible'
                  }
                  size="md"
                >
                  {evaluationResult.status.replace(/_/g, ' ')}
                </Badge>
                {currentScheme?.applicable_region && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/80 border">
                    {currentScheme.applicable_region} Domicile
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight pt-1">
                {evaluationResult.status === 'POTENTIALLY_ELIGIBLE'
                  ? 'You Potentially Meet All Verified Criteria!'
                  : evaluationResult.status === 'INSUFFICIENT_INFORMATION'
                  ? 'Additional Information Required to Verify Eligibility'
                  : 'You Do Not Currently Meet Statutory Criteria'}
              </h2>

              <p className="text-xs sm:text-sm leading-relaxed pt-1 text-slate-700">
                {evaluationResult.summary}
              </p>

              {/* Action Buttons inside Banner */}
              <div className="pt-3 flex flex-wrap gap-2">
                {evaluationResult.status === 'POTENTIALLY_ELIGIBLE' && currentScheme && (
                  <Link to="/checklist">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Generate Application Checklist
                    </Button>
                  </Link>
                )}
                {evaluationResult.status === 'INSUFFICIENT_INFORMATION' && (
                  <Link to="/profile">
                    <Button variant="primary" size="sm" rightIcon={<Edit2 className="w-4 h-4" />}>
                      Provide Missing Information
                    </Button>
                  </Link>
                )}
                {currentScheme && (
                  <Link to={`/schemes/${currentScheme.slug}`}>
                    <Button variant="outline" size="sm" className="bg-white">
                      View Official Scheme Details
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Engine Integrity Assurance Notice */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-civic-emerald shrink-0" />
        <span>
          <strong>Zero-Inference Guarantee:</strong> Sahayak does not guess or assume missing caste, income, or disability parameters. Missing data is strictly classified as unverified.
        </span>
      </div>

      {/* 6. Condition-by-Condition Audit Cards */}
      {!isLoading && evaluationResult && (
        <Card className="shadow-subtle border-civic-border p-6 space-y-6">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Rule-by-Rule Deterministic Evaluation Audit
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Detailed condition trace showing applicant actual values versus statutory thresholds.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAILED CONDITIONS */}
            {evaluationResult.failedConditions.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Failed Conditions ({evaluationResult.failedConditions.length})</span>
                </span>
                {evaluationResult.failedConditions.map((cond) => (
                  <div
                    key={cond.ruleId}
                    className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-red-950">
                        {cond.label}
                      </span>
                      <Badge variant="notEligible" size="sm">
                        FAILED
                      </Badge>
                    </div>
                    <p className="text-xs text-red-800 leading-relaxed">
                      {cond.explanation}
                    </p>
                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      Rule: {cond.field} {cond.operator} {JSON.stringify(cond.expectedValue)} • Actual: {JSON.stringify(cond.actualValue)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* UNKNOWN / MISSING CONDITIONS */}
            {evaluationResult.unknownConditions.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Missing Information ({evaluationResult.unknownConditions.length})</span>
                </span>
                {evaluationResult.unknownConditions.map((cond) => (
                  <div
                    key={cond.ruleId}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-amber-950">
                        {cond.label}
                      </span>
                      <Badge variant="unknown" size="sm">
                        UNKNOWN
                      </Badge>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {cond.explanation}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">Field: {cond.field}</span>
                      <Link to="/profile" className="font-bold text-civic-emerald hover:underline inline-flex items-center gap-1">
                        <span>Update in Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PASSED CONDITIONS */}
            {evaluationResult.passedConditions.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-civic-emerald" />
                  <span>Passed Conditions ({evaluationResult.passedConditions.length})</span>
                </span>
                {evaluationResult.passedConditions.map((cond) => (
                  <div
                    key={cond.ruleId}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-emerald-950">
                        {cond.label}
                      </span>
                      <Badge variant="eligible" size="sm">
                        PASSED
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {cond.explanation}
                    </p>
                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      Rule: {cond.field} {cond.operator} {JSON.stringify(cond.expectedValue)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NOT APPLICABLE CONDITIONS */}
            {evaluationResult.notApplicableConditions.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Not Applicable Conditions ({evaluationResult.notApplicableConditions.length})
                </span>
                {evaluationResult.notApplicableConditions.map((cond) => (
                  <div
                    key={cond.ruleId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1"
                  >
                    <div className="font-semibold text-slate-700">{cond.label}</div>
                    <p className="text-[11px] text-slate-500">{cond.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
