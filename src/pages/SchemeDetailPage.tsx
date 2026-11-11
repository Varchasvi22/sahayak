import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';
import {
  ExternalLink,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck2,
  Bot,
  ArrowLeft,
  Lock,
  BookmarkCheck,
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'documents'>('overview');
  const [isSaved, setIsSaved] = useState(false);

  // Find scheme from verified database or default to first
  const scheme =
    VERIFIED_SCHEMES.find((s) => s.slug === slug) || VERIFIED_SCHEMES[0];

  // Resolve required documents from taxonomy
  const requiredDocs = UNIVERSAL_DOCUMENTS.filter((doc) =>
    scheme.required_document_keys.includes(doc.canonical_key)
  );

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Top Navigation */}
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
          onClick={() => setIsSaved(!isSaved)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <BookmarkCheck
            className={`w-4 h-4 ${isSaved ? 'text-civic-emerald fill-civic-emerald' : ''}`}
          />
          <span>{isSaved ? 'Saved to Profile' : 'Save Scheme'}</span>
        </button>
      </div>

      {/* Main Header Card */}
      <Card className="shadow-subtle border-civic-border">
        <CardHeader className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'}>
                {scheme.government_level} SCHEME
              </Badge>
              {scheme.state_or_ut && (
                <Badge variant="state">{scheme.state_or_ut}</Badge>
              )}
              <Badge variant="eligible">Active Application Window</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last Gazette Verification: {scheme.last_verified_at}</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {scheme.official_name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium">{scheme.department_name}</span>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
            {scheme.brief_description}
          </p>

          {/* Benefit Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Official Benefit Allotment
              </span>
              <div className="text-lg font-bold text-emerald-950 mt-0.5">
                {scheme.financial_benefit_amount
                  ? formatINR(scheme.financial_benefit_amount) + ' per year'
                  : 'Subsidized Public Service Coverage'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={scheme.official_application_url}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="civic" size="md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                  Apply on {scheme.official_portal_name}
                </Button>
              </a>
              <Link to="/assistant">
                <Button variant="outline" size="md" leftIcon={<Bot className="w-4 h-4 text-civic-emerald" />}>
                  Ask AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-civic-border text-sm font-semibold text-slate-600">
        {[
          { key: 'overview', label: 'Overview & Benefits' },
          { key: 'eligibility', label: 'Eligibility Requirements & Audit' },
          { key: 'documents', label: `Required Documents (${requiredDocs.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 px-5 border-b-2 font-medium transition-all ${
              activeTab === tab.key
                ? 'border-civic-emerald text-civic-emerald font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Detailed Scheme Provisions & Disbursement Mode
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {scheme.detailed_benefits}
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Academic / Financial Cycle: <strong>{scheme.academic_or_financial_year}</strong>
              </div>
              <a
                href={scheme.official_source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-civic-emerald font-semibold hover:underline"
              >
                <span>View Official Gazette PDF / Guidelines</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Eligibility Requirements Audit */}
      {activeTab === 'eligibility' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Deterministic Eligibility Rules
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated against your demographic and socio-economic profile.
                </p>
              </div>
              <Link to="/eligibility-results">
                <Button variant="primary" size="sm">
                  Run Full Audit
                </Button>
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {scheme.eligibility_rules.conditions.map((cond: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-civic-emerald shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-900 block">
                      {cond.label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Rule field: <code className="bg-white px-1 py-0.5 rounded border">{cond.field}</code> ({cond.operator})
                    </span>
                  </div>
                  <Badge variant="eligible" size="sm">
                    Verified Clause
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Required Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mandatory Documentation Checklist
              </h3>
              <p className="text-xs text-slate-500">
                You must hold these certificates before proceeding to the official portal.
              </p>
            </div>
            <Link to="/vault">
              <Button variant="outline" size="sm" leftIcon={<FileCheck2 className="w-4 h-4" />}>
                Check In My Document Vault
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredDocs.map((doc) => (
              <Card key={doc.canonical_key} className="p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {doc.canonical_key}
                    </span>
                    <Badge variant="neutral" size="sm">
                      Mandatory
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Issuer: {doc.issuing_authority}</span>
                  {doc.how_to_obtain_url && (
                    <a
                      href={doc.how_to_obtain_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-civic-emerald font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      <span>How to Get</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* External Portal Security Warning */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-3">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong>Outbound Submission Notice:</strong> All actual welfare disbursements require official submission
          via <strong>{scheme.official_portal_name}</strong> or an authorized government Citizen Service Centre (CSC).
          Sahayak never charges fees, accepts payments, or handles citizen credentials.
        </div>
      </div>
    </div>
  );
};
