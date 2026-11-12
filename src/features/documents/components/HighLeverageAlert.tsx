import React from 'react';
import { AggregatedDocumentRequirement } from '../types';
import { Sparkles, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HighLeverageAlertProps {
  document: AggregatedDocumentRequirement | null;
  completionPercentage: number;
  onOpenUpdateModal?: (doc: AggregatedDocumentRequirement) => void;
}

export const HighLeverageAlert: React.FC<HighLeverageAlertProps> = ({
  document,
  completionPercentage,
  onOpenUpdateModal,
}) => {
  if (completionPercentage === 100) {
    return (
      <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">
              100% Document Ready!
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              All certificates required across your selected welfare schemes are available and valid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-subtle">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-civic-emerald text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
              High-Leverage Recommendation
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-civic-emerald text-white">
              Unlocks {document.leverageCount} Schemes Simultaneously
            </span>
            {document.status === 'EXPIRED' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                Renewal Required
              </span>
            )}
          </div>

          <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
            Obtaining or renewing your <strong>{document.documentName}</strong> ({document.issuingAuthority}) directly advances readiness for:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {document.linkedSchemes.map((scheme) => (
              <span
                key={scheme.schemeId}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/90 text-slate-800 border border-emerald-200 shadow-2xs"
              >
                {scheme.schemeName}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
        {document.howToObtainUrl && (
          <a
            href={document.howToObtainUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex"
          >
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              How to Apply
            </Button>
          </a>
        )}

        {onOpenUpdateModal && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenUpdateModal(document)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Update Status
          </Button>
        )}
      </div>
    </div>
  );
};
