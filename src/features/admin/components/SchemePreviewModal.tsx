/**
 * SAHAYAK Scheme Preview Modal
 *
 * Previews official scheme presentation (Card & Detail views) before publishing
 * so administrators can review accuracy, gazette sources, and layout.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  CheckCircle2,
  FileCheck2,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { SchemeFormData } from '../types';

interface SchemePreviewModalProps {
  scheme: SchemeFormData;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish?: () => void;
}

export const SchemePreviewModal: React.FC<SchemePreviewModalProps> = ({
  scheme,
  isOpen,
  onClose,
  onConfirmPublish,
}) => {
  const [viewMode, setViewMode] = useState<'CARD' | 'DETAIL'>('DETAIL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Badge variant="eligible">Publication Preview</Badge>
            <span className="text-xs text-slate-500 font-medium">
              Citizen View Simulation (No changes saved until confirmed)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('DETAIL')}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === 'DETAIL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detail View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CARD')}
                className={`px-3 py-1 rounded-md transition-all ${
                  viewMode === 'CARD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Card View
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {viewMode === 'CARD' ? (
            /* Card View Preview */
            <div className="max-w-md mx-auto py-8">
              <p className="text-xs text-slate-500 text-center mb-3">
                How this scheme appears in the <strong>Scheme Discovery Directory</strong>:
              </p>
              <Card className="p-5 space-y-4 border-slate-200 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'}>
                      {scheme.government_level}
                    </Badge>
                    {scheme.applicable_region && (
                      <Badge variant="neutral">{scheme.applicable_region}</Badge>
                    )}
                  </div>
                  <Badge variant={scheme.is_active ? 'eligible' : 'neutral'}>
                    {scheme.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {scheme.official_name}
                  </h3>
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    {scheme.short_title} • {scheme.department_name}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {scheme.description}
                  </p>
                </div>

                {scheme.financial_benefit_amount && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Up to ₹{scheme.financial_benefit_amount.toLocaleString('en-IN')}/year</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified: {scheme.last_verified_at}
                  </span>
                  <span className="text-slate-500 font-semibold text-xs">View Details →</span>
                </div>
              </Card>
            </div>
          ) : (
            /* Detail View Preview */
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'}>
                    {scheme.government_level} SCHEME
                  </Badge>
                  {scheme.applicable_region && (
                    <Badge variant="neutral" className="bg-slate-800 text-slate-200 border-slate-700">
                      {scheme.applicable_region}
                    </Badge>
                  )}
                  <Badge variant="eligible" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    Status: {scheme.status}
                  </Badge>
                  <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Last verified: {scheme.last_verified_at}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {scheme.official_name}
                </h1>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {scheme.department_name}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {scheme.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={scheme.official_application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                  >
                    <span>Apply on {scheme.official_portal_name || 'Official Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Benefits Section */}
              <Card className="p-5 space-y-2 border-emerald-100 bg-emerald-50/30">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Scheme Benefits</span>
                </div>
                {scheme.financial_benefit_amount && (
                  <p className="text-xs font-semibold text-emerald-900">
                    Financial Assistance: ₹{scheme.financial_benefit_amount.toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {scheme.benefits}
                </p>
              </Card>

              {/* Eligibility Rules Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Deterministic Eligibility Criteria ({scheme.rules.length})
                  </h3>
                </div>

                {scheme.rules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No eligibility rules configured yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {scheme.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{rule.label}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {rule.logical_relationship}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {rule.field} {rule.operator} {JSON.stringify(rule.expected_value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Required Documents Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Required Certificates & Documents ({scheme.documents.length})
                </h3>

                {scheme.documents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No documents required.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {scheme.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{doc.document_name}</span>
                          <Badge variant={doc.is_mandatory ? 'eligible' : 'neutral'} className="text-[10px] py-0">
                            {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Authority: {doc.issuing_authority || 'Revenue Authority / Tehsildar'}
                        </p>
                        {doc.validity_period && (
                          <p className="text-[11px] text-slate-400">Validity: {doc.validity_period}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Official Sources Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Verified Gazette & Guideline References ({scheme.sources.length})
                </h4>
                <div className="space-y-1">
                  {scheme.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/60"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Badge variant="neutral" className="text-[10px] py-0 font-mono">
                          {src.source_type}
                        </Badge>
                        <a
                          href={src.official_source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline truncate"
                        >
                          {src.official_source_url}
                        </a>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2">
                        Checked: {src.last_checked_date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            Current Status:{' '}
            <Badge variant={scheme.publication_status === 'VERIFIED' ? 'eligible' : 'neutral'}>
              {scheme.publication_status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close Preview
            </Button>
            {onConfirmPublish && scheme.publication_status !== 'VERIFIED' && (
              <Button variant="primary" size="sm" onClick={onConfirmPublish} leftIcon={<ShieldCheck className="w-4 h-4" />}>
                Approve & Publish to Citizens
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
