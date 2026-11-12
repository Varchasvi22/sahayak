import React from 'react';
import { AggregatedDocumentRequirement, CanonicalDocumentStatus } from '../types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  ExternalLink,
  Layers,
  Calendar,
  KeyRound,
  Edit3,
} from 'lucide-react';

interface DocumentChecklistCardProps {
  document: AggregatedDocumentRequirement;
  onStatusChange: (canonicalKey: string, newStatus: CanonicalDocumentStatus) => void;
  onOpenEditModal: (document: AggregatedDocumentRequirement) => void;
}

export const DocumentChecklistCard: React.FC<DocumentChecklistCardProps> = ({
  document,
  onStatusChange,
  onOpenEditModal,
}) => {
  const getBadgeVariant = (status: CanonicalDocumentStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'eligible';
      case 'NEEDS_VERIFICATION':
        return 'unknown';
      case 'EXPIRED':
        return 'notEligible';
      case 'MISSING':
      case 'NOT_APPLICABLE':
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: CanonicalDocumentStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available in Hand';
      case 'NEEDS_VERIFICATION':
        return 'In Verification';
      case 'EXPIRED':
        return 'Needs Renewal';
      case 'MISSING':
        return 'Missing';
      case 'NOT_APPLICABLE':
        return 'Not Applicable';
    }
  };

  return (
    <Card className="flex flex-col justify-between hover:border-civic-emerald/50 shadow-subtle hover:shadow-card transition-all">
      <CardHeader className="p-5 pb-3 space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {document.canonicalKey}
            </span>
            {document.leverageCount > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <Layers className="w-3 h-3 text-teal-600" />
                Shared by {document.leverageCount} Schemes
              </span>
            )}
          </div>

          <Badge variant={getBadgeVariant(document.status)} size="sm">
            {getStatusLabel(document.status)}
          </Badge>
        </div>

        {/* Title and Authority */}
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {document.documentName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Issuing Authority: <strong className="text-slate-700">{document.issuingAuthority}</strong>
          </p>
        </div>

        {/* Linked Schemes */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">
            Required by Schemes ({document.linkedSchemes.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {document.linkedSchemes.map((scheme) => (
              <span
                key={scheme.schemeId}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {scheme.schemeName}
              </span>
            ))}
          </div>
        </div>

        {/* Expiry Warning or Notes */}
        {document.isExpiredAutoDetected && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <span>⚠️</span>
            <span>Validity period expired on <strong>{document.expiryDate}</strong>. Renewal required.</span>
          </div>
        )}

        {document.notes && (
          <div className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-md border border-slate-100">
            "{document.notes}"
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3">
        {/* Metadata info */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Turnaround: {document.approxDaysToIssue ?? 14} days</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Validity: {document.validityPeriod}</span>
          </div>

          {document.documentReferenceMasked && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              <KeyRound className="w-3 h-3 text-slate-400" />
              <span>{document.documentReferenceMasked}</span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Quick status selector */}
          <div className="flex-1 min-w-[170px] max-w-[210px]">
            <select
              value={document.status}
              onChange={(e) =>
                onStatusChange(document.canonicalKey, e.target.value as CanonicalDocumentStatus)
              }
              className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
            >
              <option value="AVAILABLE">✓ Available in Hand</option>
              <option value="NEEDS_VERIFICATION">⏳ Applied / In Verification</option>
              <option value="EXPIRED">⚠️ Needs Renewal</option>
              <option value="MISSING">✕ Missing / Not Held</option>
              <option value="NOT_APPLICABLE">⊘ Not Applicable</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {document.howToObtainUrl && (
              <a
                href={document.howToObtainUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-civic-emerald font-semibold inline-flex items-center gap-1 hover:underline shrink-0"
              >
                <span>How to Obtain</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenEditModal(document)}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
              className="text-xs text-slate-700 hover:text-slate-900"
            >
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
