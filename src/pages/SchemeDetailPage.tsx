import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  getSchemeDetail,
  SchemeDetailData,
} from '@/services/schemeService';
import {
  getSavedSchemeIds,
  toggleSchemeBookmark,
} from '@/services/savedSchemeService';
import { useAuth } from '@/contexts/AuthContext';
import {
  ExternalLink,
  Building2,
  FileCheck2,
  ArrowLeft,
  BookmarkCheck,
  ShieldCheck,
  AlertCircle,
  FileText,
  MapPin,
  Sparkles,
  Link2,
  HelpCircle,
  Scale,
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [detailData, setDetailData] = useState<SchemeDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'documents' | 'procedure' | 'sources'>('overview');

  // Load scheme details from Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      const { data, error: fetchErr } = await getSchemeDetail(slug);

      if (!isMounted) return;

      if (fetchErr || !data) {
        setError(fetchErr?.message || 'Scheme not found in verified database.');
      } else {
        setDetailData(data);
        // Check if saved
        const savedIds = await getSavedSchemeIds(user?.id);
        if (isMounted) {
          setIsSaved(savedIds.includes(data.scheme.id));
        }
      }
      setIsLoading(false);
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [slug, user]);

  const handleToggleSave = async () => {
    if (!detailData) return;
    const { isSaved: nowSaved } = await toggleSchemeBookmark(detailData.scheme.id, user?.id);
    setIsSaved(nowSaved);
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-6 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded"></div>
        <div className="h-64 bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
          <div className="h-10 w-3/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-96 bg-white border border-slate-200 rounded-2xl p-6"></div>
      </div>
    );
  }

  // Error State
  if (error || !detailData) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Scheme Information Unavailable</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {error || 'The requested scheme could not be found or verified in our civic database.'}
          </p>
        </div>
        <Link to="/schemes">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Scheme Directory
          </Button>
        </Link>
      </div>
    );
  }

  const { scheme, category, rules, documents, sources } = detailData;

  const formattedDate = scheme.last_verified_at
    ? new Date(scheme.last_verified_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Pending Gazette Audit';

  const isVerifiedActive =
    scheme.is_active &&
    (scheme.status === 'ALWAYS_ACTIVE' || scheme.status === 'OPEN');

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* 1. Breadcrumb & Bookmark Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Verified Schemes</span>
        </Link>

        <button
          type="button"
          onClick={handleToggleSave}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isSaved
              ? 'bg-emerald-50 border-emerald-300 text-civic-emerald'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookmarkCheck className={`w-4 h-4 ${isSaved ? 'fill-civic-emerald' : ''}`} />
          <span>{isSaved ? 'Saved to My Profile' : 'Save Scheme'}</span>
        </button>
      </div>

      {/* 2. Main Scheme Header Card */}
      <Card className="shadow-subtle border-civic-border overflow-hidden">
        <CardHeader className="space-y-4 p-6 sm:p-8">
          {/* Badge Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'}>
                {scheme.government_level} SCHEME
              </Badge>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{scheme.applicable_region || 'All-India National Coverage'}</span>
              </span>
              {category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {category.name}
                </span>
              )}
              <Badge variant={isVerifiedActive ? 'eligible' : 'unknown'}>
                {isVerifiedActive ? 'Open & Verified' : scheme.status.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Verification Timestamp */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-civic-emerald" />
              <span>Gazette Verified: {formattedDate}</span>
            </div>
          </div>

          {/* Scheme Title & Ministry */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {scheme.official_name}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mt-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium">{scheme.department_name}</span>
            </div>
          </div>

          {/* Short Verified Description */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
            {scheme.description}
          </p>

          {/* Official Benefit Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                Statutory Benefit Allotment
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-mono mt-0.5">
                {scheme.financial_benefit_amount
                  ? formatINR(scheme.financial_benefit_amount)
                  : 'Universal Health / In-Kind Grant'}
                <span className="text-xs font-normal text-emerald-800 ml-2">
                  {scheme.academic_or_financial_year ? `(${scheme.academic_or_financial_year})` : '/ year'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {scheme.official_application_url && (
                <a
                  href={scheme.official_application_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="primary" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                    Apply on Official Portal
                  </Button>
                </a>
              )}
              <Link to="/onboarding">
                <Button variant="outline" size="md" className="bg-white" rightIcon={<Sparkles className="w-4 h-4" />}>
                  Check My Eligibility
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: 'overview', label: 'Overview & Benefits', icon: FileText },
          { key: 'eligibility', label: `Eligibility Criteria (${rules.length})`, icon: Scale },
          { key: 'documents', label: `Required Documents (${documents.length})`, icon: FileCheck2 },
          { key: 'procedure', label: 'Application Steps', icon: HelpCircle },
          { key: 'sources', label: `Official Sources (${sources.length})`, icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-civic-emerald text-civic-emerald'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content */}
      <div className="space-y-6">
        {/* TAB 1: Overview & Benefits */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Detailed Benefits</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {scheme.benefits || scheme.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Program Administration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nodal Ministry / Department</span>
                    <span className="font-semibold text-slate-800">{scheme.department_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Operational Year</span>
                    <span className="font-semibold text-slate-800">
                      {scheme.academic_or_financial_year || 'Current Fiscal Year'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Designated Official Portal</span>
                    <span className="font-semibold text-slate-800">
                      {scheme.official_portal_name || 'National Government Portal'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Operating Status</span>
                    <span className="font-bold text-civic-emerald">
                      {scheme.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Scheme Verification Stamp</h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-civic-emerald" />
                  <span>Gazette Verified Record</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every parameter of this welfare scheme has been verified against published gazette orders,
                  ministry guidelines, and direct Direct Benefit Transfer (DBT) guidelines.
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Last checked: <strong>{formattedDate}</strong>
                </div>
              </div>

              {scheme.official_application_url && (
                <a
                  href={scheme.official_application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full"
                >
                  <Button variant="civic" size="md" className="w-full justify-center" rightIcon={<ExternalLink className="w-4 h-4" />}>
                    Open Official Portal
                  </Button>
                </a>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: Eligibility Criteria (Deterministic Rules) */}
        {activeTab === 'eligibility' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Statutory Eligibility Rules ({rules.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These rules are evaluated deterministically against applicant demographic profiles.
              </p>
            </div>

            {rules.length > 0 ? (
              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-civic-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900">
                        {rule.label || `Eligibility rule on ${rule.field}`}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {rule.field} {rule.operator} {JSON.stringify(rule.expected_value)}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">Mandatory Requirement</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                No specific exclusion criteria found. General central eligibility applies.
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: Required Documents & Application Readiness */}
        {activeTab === 'documents' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mandatory Documentation Checklist ({documents.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Have these certificates and digital tokens ready before accessing the government submission portal.
              </p>
            </div>

            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-civic-emerald/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
                        <FileCheck2 className="w-4 h-4 text-civic-emerald shrink-0" />
                        <span>{doc.document_name}</span>
                      </div>
                      <Badge variant={doc.is_mandatory ? 'eligible' : 'info'} size="sm">
                        {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div>
                        <span className="text-slate-400">Issuing Authority: </span>
                        <span className="font-medium text-slate-800">{doc.issuing_authority}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Typical Validity: </span>
                        <span className="font-medium text-slate-800">{doc.validity_period}</span>
                      </div>
                      {doc.approx_days_to_issue && (
                        <div>
                          <span className="text-slate-400">Estimated Turnaround: </span>
                          <span className="font-medium text-slate-800">
                            ~{doc.approx_days_to_issue} business days
                          </span>
                        </div>
                      )}
                    </div>

                    {doc.how_to_obtain_url && (
                      <div className="pt-2 border-t border-slate-100">
                        <a
                          href={doc.how_to_obtain_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-civic-emerald hover:underline inline-flex items-center gap-1"
                        >
                          <span>Obtain / Verify Online</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                No special certificates required beyond basic identification.
              </div>
            )}
          </Card>
        )}

        {/* TAB 4: Application Procedure */}
        {activeTab === 'procedure' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Application Walkthrough
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Follow these standard procedural guidelines when submitting on the official government website.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-900 block">Step 1: Universal Aadhaar-Bank Seeding</span>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Ensure your bank account is mapped on the NPCI Aadhaar Payment Bridge (APB) mapper.
                  Central and State Direct Benefit Transfers (DBT) require active NPCI mapping.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-900 block">Step 2: Access the Designated Ministry Portal</span>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Navigate to <strong>{scheme.official_portal_name || scheme.official_application_url}</strong>.
                  Never use unverified third-party intermediary services or pay agents for free government welfare applications.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-900 block">Step 3: Registration & Mobile OTP Authentication</span>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Register with your active mobile number. Keep your DigiLocker account active if digital certificate fetch is enabled.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-900 block">Step 4: Submission & Acknowledgment Receipt</span>
                <p className="text-slate-600 leading-relaxed text-xs">
                  After submitting, note down your Application Reference Number / Acknowledgement Number.
                  You can track preparation milestones in your Sahayak Application Tracker.
                </p>
              </div>
            </div>

            {scheme.official_application_url && (
              <div className="pt-2">
                <a
                  href={scheme.official_application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <Button variant="primary" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                    Proceed to {scheme.official_portal_name || 'Official Portal'}
                  </Button>
                </a>
              </div>
            )}
          </Card>
        )}

        {/* TAB 5: Official Sources & Gazette Citations */}
        {activeTab === 'sources' && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Official Sources & Statutory Citations ({sources.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sahayak verifies all scheme information from official Gazette Notifications, Ministry Portals, and operational guidelines.
              </p>
            </div>

            {sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="central" size="sm">{src.source_type}</Badge>
                        <span className="font-bold text-slate-900">
                          {src.notes || 'Official Ministry Citation'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Last audited by civic researchers: <strong>{src.last_checked_date}</strong>
                      </div>
                    </div>

                    <a
                      href={src.official_source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm" className="bg-white" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View Gazette Source
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
                Sourced from Ministry Portal guidelines and national gazette archives.
              </div>
            )}
          </Card>
        )}
      </div>

      {/* 5. Sticky Bottom Action Ribbon */}
      <div className="p-4 bg-white border border-civic-border rounded-2xl shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-civic-sand flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-civic-navy" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Application Readiness Audit
            </span>
            <span className="text-[11px] text-slate-500">
              Run deterministic matching against your profile to verify potential eligibility.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/onboarding" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" rightIcon={<Sparkles className="w-4 h-4" />}>
              Evaluate My Profile
            </Button>
          </Link>
          {scheme.official_application_url && (
            <a
              href={scheme.official_application_url}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="primary" size="sm" className="w-full sm:w-auto" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Official Portal
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
