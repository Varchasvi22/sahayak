import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';
import { DocumentReadinessStatus } from '@/types/document.types';
import {
  FileCheck2,
  Clock,
  Plus,
  ExternalLink,
  FileText,
  RotateCcw,
} from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  // Demo User Documents State
  const [docStatuses, setDocStatuses] = useState<Record<string, DocumentReadinessStatus>>({
    doc_caste_cert: 'AVAILABLE',
    doc_marksheet_10: 'AVAILABLE',
    doc_college_id: 'AVAILABLE',
    doc_bank_passbook: 'AVAILABLE',
    doc_income_cert: 'NEEDS_RENEWAL',
    doc_domicile_cert: 'IN_PROGRESS',
    doc_ration_card: 'NOT_AVAILABLE',
    doc_land_record: 'NOT_AVAILABLE',
    doc_disability_cert: 'NOT_AVAILABLE',
    doc_voter_id: 'AVAILABLE',
  });

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const updateStatus = (key: string, newStatus: DocumentReadinessStatus) => {
    setDocStatuses((prev) => ({ ...prev, [key]: newStatus }));
  };

  const filteredDocs = UNIVERSAL_DOCUMENTS.filter((doc) => {
    const status = docStatuses[doc.canonical_key] || 'NOT_AVAILABLE';
    if (statusFilter === 'ALL') return true;
    return status === statusFilter;
  });

  // Calculate metrics
  const total = UNIVERSAL_DOCUMENTS.length;
  const availableCount = Object.values(docStatuses).filter((s) => s === 'AVAILABLE').length;
  const inProgressCount = Object.values(docStatuses).filter((s) => s === 'IN_PROGRESS').length;
  const renewalCount = Object.values(docStatuses).filter((s) => s === 'NEEDS_RENEWAL').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="eligible">Cross-Scheme Document Intelligence</Badge>
            <span className="text-xs text-slate-500 font-medium">Mapped Across Central & State Schemes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Universal Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track certificate readiness once. Sahayak automatically maps your papers across all eligible welfare initiatives.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Record Missing Document
          </Button>
        </div>
      </div>

      {/* High-Leverage Document Recommendation Banner */}
      <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-civic-emerald text-white flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                High-Leverage Recommendation
              </span>
              <Badge variant="eligible" size="sm">
                Unlocks 4 Schemes
              </Badge>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed max-w-2xl">
              Renewing your <strong>Income Certificate</strong> at your local Tehsildar or e-District portal
              will simultaneously unlock full application readiness for <strong>Post-Matric Scholarship</strong>,
              <strong>Yuva Nidhi</strong>, and <strong>State Fee Waivers</strong>.
            </p>
          </div>
        </div>

        <a
          href="https://services.india.gov.in/service/search?kw=income+certificate"
          target="_blank"
          rel="noreferrer"
          className="shrink-0"
        >
          <Button variant="civic" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
            Apply for Income Cert
          </Button>
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-civic-border rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Available in Hand</span>
          <p className="text-2xl font-bold text-civic-emerald mt-1">{availableCount}</p>
          <span className="text-[10px] text-slate-400">Ready to submit</span>
        </div>

        <div className="p-4 bg-white border border-civic-border rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Application in Progress</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</p>
          <span className="text-[10px] text-slate-400">Pending at Tehsildar/CSC</span>
        </div>

        <div className="p-4 bg-white border border-civic-border rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Needs Renewal</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{renewalCount}</p>
          <span className="text-[10px] text-slate-400">Expired validity</span>
        </div>

        <div className="p-4 bg-white border border-civic-border rounded-xl">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Taxonomy</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
          <span className="text-[10px] text-slate-400">Recognized standard docs</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-civic-border rounded-lg text-xs font-semibold">
          {[
            { key: 'ALL', label: `All (${total})` },
            { key: 'AVAILABLE', label: `Available (${availableCount})` },
            { key: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
            { key: 'NEEDS_RENEWAL', label: `Needs Renewal (${renewalCount})` },
            { key: 'NOT_AVAILABLE', label: 'Not Held' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === tab.key
                  ? 'bg-civic-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {statusFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="text-xs text-civic-emerald flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Show All Documents</span>
          </button>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const currentStatus = docStatuses[doc.canonical_key] || 'NOT_AVAILABLE';
            return (
              <Card
                key={doc.canonical_key}
                className="flex flex-col justify-between hover:border-civic-emerald/50 shadow-subtle hover:shadow-card transition-all"
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {doc.canonical_key}
                    </span>
                    <Badge
                      variant={
                        currentStatus === 'AVAILABLE'
                          ? 'eligible'
                          : currentStatus === 'IN_PROGRESS'
                          ? 'unknown'
                          : currentStatus === 'NEEDS_RENEWAL'
                          ? 'notEligible'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {currentStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Issuing Authority: <strong>{doc.issuing_authority}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.description}
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Est. turnaround: {doc.approx_days_to_issue} days</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      Validity: {doc.validity_period}
                    </span>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex-1 max-w-[190px]">
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          updateStatus(doc.canonical_key, e.target.value as DocumentReadinessStatus)
                        }
                        className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
                      >
                        <option value="AVAILABLE">✓ Available in Hand</option>
                        <option value="IN_PROGRESS">⏳ Applied / In Progress</option>
                        <option value="NEEDS_RENEWAL">⚠️ Needs Renewal</option>
                        <option value="NOT_AVAILABLE">✕ Not Held</option>
                      </select>
                    </div>

                    {doc.how_to_obtain_url && (
                      <a
                        href={doc.how_to_obtain_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-civic-emerald font-semibold inline-flex items-center gap-1 hover:underline shrink-0"
                      >
                        <span>How to Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Documents Found</h3>
          <p className="text-xs text-slate-500">No documents match the selected filter status.</p>
        </Card>
      )}
    </div>
  );
};
