import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { CheckCircle2, User, ArrowRight } from 'lucide-react';

interface DashboardWelcomeHeaderProps {
  citizenName: string;
  state: string;
  district: string;
  category: string;
  education: string;
  annualIncome: number | null;
  isCloudSynced: boolean;
}

export const DashboardWelcomeHeader: React.FC<DashboardWelcomeHeaderProps> = ({
  citizenName,
  state,
  district,
  category,
  education,
  annualIncome,
  isCloudSynced,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const initial = (citizenName || 'A').charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-civic-border rounded-2xl p-5 sm:p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-civic-navy text-white font-extrabold flex items-center justify-center text-xl shrink-0 shadow-xs">
          {initial}
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">{getGreeting()},</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {citizenName}
            </h1>
            <Badge variant="eligible" size="sm">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isCloudSynced ? 'Cloud-Synced Vault' : 'Verified Local Session'}</span>
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {district && state && (
              <span className="font-semibold text-slate-800">
                {district}, {state}
              </span>
            )}
            {category && (
              <>
                <span>•</span>
                <span className="font-medium text-slate-700">Category: {category}</span>
              </>
            )}
            {education && (
              <>
                <span>•</span>
                <span className="text-slate-600">{education}</span>
              </>
            )}
            {annualIncome !== null && (
              <>
                <span>•</span>
                <span className="font-semibold text-civic-emerald">
                  Income: {formatINR(annualIncome)}/yr
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
        <Link to="/profile">
          <Button variant="outline" size="sm" leftIcon={<User className="w-4 h-4" />}>
            Edit Profile
          </Button>
        </Link>
        <Link to="/schemes">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Find Schemes
          </Button>
        </Link>
      </div>
    </div>
  );
};
