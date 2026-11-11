import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SchemeRow } from '@/services/schemeService';
import { formatINR } from '@/lib/utils';
import {
  BookmarkCheck,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
} from 'lucide-react';

interface SchemeCardProps {
  scheme: SchemeRow;
  isSaved: boolean;
  onToggleSave: (schemeId: string) => void;
  categoryName?: string;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  isSaved,
  onToggleSave,
  categoryName,
}) => {
  // Format verified date
  const formattedDate = scheme.last_verified_at
    ? new Date(scheme.last_verified_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Pending Gazette Audit';

  // Status badge styling and text
  const isVerifiedActive =
    scheme.is_active &&
    (scheme.status === 'ALWAYS_ACTIVE' || scheme.status === 'OPEN');
  const isClosingSoon = scheme.status === 'CLOSING_SOON';
  const isClosed = scheme.status === 'CLOSED';

  return (
    <Card className="flex flex-col justify-between border-civic-border bg-white hover:border-civic-emerald/60 hover:shadow-card transition-all duration-200 group">
      {/* Top Header with Badges & Save Toggle */}
      <div className="p-5 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Government Level Badge */}
            <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'} size="sm">
              {scheme.government_level}
            </Badge>

            {/* Applicable Region Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{scheme.applicable_region ? scheme.applicable_region : 'All-India'}</span>
            </span>

            {/* Beneficiary Category Badge */}
            {categoryName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                {categoryName}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(scheme.id);
            }}
            title={isSaved ? 'Remove from Saved Schemes' : 'Save Scheme for Later'}
            className={`p-1.5 rounded-lg border transition-all ${
              isSaved
                ? 'bg-emerald-50 border-emerald-300 text-civic-emerald'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BookmarkCheck className={`w-4 h-4 ${isSaved ? 'fill-civic-emerald' : ''}`} />
          </button>
        </div>

        {/* Scheme Name & Ministry */}
        <div>
          <Link to={`/schemes/${scheme.slug}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-civic-emerald transition-colors line-clamp-2 leading-snug">
              {scheme.official_name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 line-clamp-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{scheme.department_name}</span>
          </div>
        </div>

        {/* Short Verified Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {scheme.description}
        </p>

        {/* Financial or In-Kind Benefit Callout */}
        {scheme.financial_benefit_amount && (
          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-emerald-900">Official Entitlement</span>
            <span className="font-extrabold text-emerald-950 font-mono text-sm">
              {formatINR(scheme.financial_benefit_amount)}
              <span className="text-[10px] font-normal text-emerald-800 ml-1">
                {scheme.academic_or_financial_year ? `(${scheme.academic_or_financial_year})` : '/ year'}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Verification & Actions Footer */}
      <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3 rounded-b-xl">
        {/* Status & Last Verified Meta */}
        <div className="flex items-center justify-between text-xs">
          {/* Status Badge */}
          {isVerifiedActive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Open & Verified</span>
            </span>
          ) : isClosingSoon ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Closing Soon</span>
            </span>
          ) : isClosed ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Applications Closed</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Gazette Verification Required</span>
            </span>
          )}

          {/* Last Verified Timestamp */}
          <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-civic-emerald" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Link to={`/schemes/${scheme.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full justify-center bg-white hover:bg-slate-100" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Details
            </Button>
          </Link>

          {scheme.official_application_url && (
            <a
              href={scheme.official_application_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0"
              title={`Open ${scheme.official_portal_name || 'Official Portal'}`}
            >
              <Button variant="civic" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Portal
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
