import React from 'react';
import { Link } from 'react-router-dom';
import { RecommendedSchemeCardData } from '../dashboardUtils';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookmarkCheck,
  Bookmark,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';

interface RecommendedSchemesSectionProps {
  schemes: RecommendedSchemeCardData[];
  savedSchemeIds: string[];
  onToggleSave: (schemeId: string) => Promise<void>;
}

export const RecommendedSchemesSection: React.FC<RecommendedSchemesSectionProps> = ({
  schemes,
  savedSchemeIds,
  onToggleSave,
}) => {
  const getMatchBadge = (status: RecommendedSchemeCardData['matchStatus']) => {
    switch (status) {
      case 'POTENTIALLY_ELIGIBLE':
        return (
          <Badge variant="eligible" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Potentially Eligible
          </Badge>
        );
      case 'INSUFFICIENT_INFORMATION':
        return (
          <Badge variant="unknown" size="sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            Needs Info
          </Badge>
        );
      case 'NOT_ELIGIBLE':
        return (
          <Badge variant="notEligible" size="sm">
            <XCircle className="w-3 h-3 mr-1" />
            Not Eligible
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-civic-emerald uppercase tracking-wider">
              Profile-Matched Schemes
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Recommended Welfare Schemes
          </h2>
          <p className="text-xs text-slate-500">
            Evaluated deterministically against statutory rules using your profile data.
          </p>
        </div>

        <Link to="/schemes" className="text-xs font-semibold text-civic-emerald hover:underline">
          Browse Directory ({schemes.length} Evaluated)
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schemes.slice(0, 6).map((scheme) => {
          const isSaved = savedSchemeIds.includes(scheme.id);

          return (
            <Card
              key={scheme.id}
              className="flex flex-col justify-between hover:border-civic-emerald/50 shadow-subtle hover:shadow-card transition-all"
            >
              <CardHeader className="p-5 pb-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {getMatchBadge(scheme.matchStatus)}
                    <Badge
                      variant={scheme.governmentLevel === 'CENTRAL' ? 'central' : 'state'}
                      size="sm"
                    >
                      {scheme.governmentLevel}
                    </Badge>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleSave(scheme.id)}
                    className="text-slate-400 hover:text-civic-emerald transition-colors p-1"
                    title={isSaved ? 'Remove from saved' : 'Save scheme'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-civic-emerald fill-civic-emerald/20" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div>
                  <Link
                    to={`/schemes/${scheme.slug}`}
                    className="text-base font-bold text-slate-900 hover:text-civic-emerald transition-colors leading-snug line-clamp-2"
                  >
                    {scheme.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {scheme.departmentName}
                  </p>
                </div>

                {scheme.financialBenefitAmount > 0 && (
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                    {formatINR(scheme.financialBenefitAmount)} / yr Financial Benefit
                  </div>
                )}

                {/* Match Reason Text */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {scheme.matchReason}
                </p>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3">
                {/* Document readiness meter for this scheme */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3 text-slate-400" />
                      Document Readiness
                    </span>
                    <span className="font-bold text-slate-800">
                      {scheme.documentReadinessPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${scheme.documentReadinessPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/eligibility-results?scheme=${scheme.slug}`}
                    className="text-xs font-semibold text-civic-navy hover:underline"
                  >
                    Rule Audit
                  </Link>

                  <Link to={`/schemes/${scheme.slug}`}>
                    <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
