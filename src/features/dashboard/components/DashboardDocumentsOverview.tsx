import React from 'react';
import { Link } from 'react-router-dom';
import { CrossSchemeReadinessMetrics } from '@/features/documents/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface DashboardDocumentsOverviewProps {
  metrics: CrossSchemeReadinessMetrics;
  schemesCount: number;
}

export const DashboardDocumentsOverview: React.FC<DashboardDocumentsOverviewProps> = ({
  metrics,
  schemesCount,
}) => {
  const {
    totalUniqueRequired,
    availableCount,
    missingCount,
    expiredCount,
    verificationPendingCount,
    completionPercentage,
    highLeverageDocument,
    allUniqueDocuments,
  } = metrics;

  const unfulfilledDocs = allUniqueDocuments
    .filter((d) => d.status !== 'AVAILABLE' && d.status !== 'NOT_APPLICABLE')
    .slice(0, 4);

  return (
    <Card className="shadow-subtle border-civic-border overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-civic-emerald uppercase tracking-wider">
              Document Readiness Overview
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {schemesCount} Scheme{schemesCount !== 1 ? 's' : ''} Analyzed
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Cross-Scheme Certificate Readiness
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deduplicated across all tracked welfare schemes with zero double-counting.
          </p>
        </div>

        <Link to="/checklist" className="shrink-0">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Open Document Vault
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
        {/* Readiness Bar and Metrics */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {completionPercentage}%
              </span>
              <span className="text-xs font-semibold text-civic-emerald">
                {availableCount} of {totalUniqueRequired} unique certificates ready
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {availableCount} Ready
              </span>
              {expiredCount > 0 && (
                <span className="inline-flex items-center gap-1 text-red-800 font-semibold bg-red-100/60 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  {expiredCount} Expired
                </span>
              )}
              {verificationPendingCount > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-100/60 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {verificationPendingCount} Pending
                </span>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
            {availableCount > 0 && (
              <div
                style={{ width: `${(availableCount / totalUniqueRequired) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
            )}
            {verificationPendingCount > 0 && (
              <div
                style={{
                  width: `${(verificationPendingCount / totalUniqueRequired) * 100}%`,
                }}
                className="bg-amber-400 transition-all duration-500"
              />
            )}
            {expiredCount > 0 && (
              <div
                style={{ width: `${(expiredCount / totalUniqueRequired) * 100}%` }}
                className="bg-red-400 transition-all duration-500"
              />
            )}
          </div>
        </div>

        {/* High-Leverage Certificate Recommendation Callout */}
        {highLeverageDocument && (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-civic-emerald text-white flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                    High-Leverage Certificate:
                  </span>
                  <span className="font-bold text-xs text-slate-900">
                    {highLeverageDocument.documentName}
                  </span>
                  <Badge variant="eligible" size="sm">
                    Unlocks {highLeverageDocument.leverageCount} Schemes
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  Required by {highLeverageDocument.linkedSchemes.map((s) => s.schemeName).join(', ')}.
                </p>
              </div>
            </div>

            {highLeverageDocument.howToObtainUrl && (
              <a
                href={highLeverageDocument.howToObtainUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3 h-3" />}>
                  How to Obtain
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Missing Document Summary List */}
        {unfulfilledDocs.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 block">
              Remaining Action Items ({missingCount + expiredCount + verificationPendingCount}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {unfulfilledDocs.map((doc) => (
                <div
                  key={doc.canonicalKey}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{doc.documentName}</span>
                      {doc.status === 'EXPIRED' && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {doc.issuingAuthority} • ~{doc.approxDaysToIssue ?? 14} days
                    </div>
                  </div>

                  <Link to="/checklist" className="shrink-0">
                    <span className="text-[11px] font-bold text-civic-emerald hover:underline">
                      Update
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
