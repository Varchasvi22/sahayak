/**
 * SAHAYAK Admin Authentication & Role Gate
 *
 * Verifies that the active session holds administrative credentials.
 * Provides live role toggling for testing authorized vs unauthorized access.
 */

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, ShieldCheck, UserCog, Lock } from 'lucide-react';
import { AdminUser } from '../types';
import { DEFAULT_ADMINS } from '../adminService';

interface AdminAuthGateProps {
  currentUser: AdminUser | null;
  onSwitchUser: (user: AdminUser | null) => void;
  children: React.ReactNode;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  currentUser,
  onSwitchUser,
  children,
}) => {
  const isAuthorized = Boolean(currentUser && currentUser.isVerifiedAdmin);

  return (
    <div className="space-y-6">
      {/* Top Administrative Governance Toolbar */}
      <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <UserCog className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
                Governance Security Gateway
              </span>
              {isAuthorized ? (
                <Badge variant="eligible" className="text-[10px] py-0 px-1.5">
                  Authorized Session
                </Badge>
              ) : (
                <Badge variant="unknown" className="text-[10px] py-0 px-1.5 bg-amber-500/20 text-amber-300 border-amber-500/40">
                  Public Citizen Mode
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAuthorized
                ? `Logged in as ${currentUser?.name} (${currentUser?.role}) — ${currentUser?.department}`
                : 'Browsing as Unauthenticated Citizen (Read-Only public catalog)'}
            </p>
          </div>
        </div>

        {/* Demo Role Switcher to test authorized vs unauthorized access */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Test Role:</span>
          <button
            type="button"
            onClick={() => onSwitchUser(DEFAULT_ADMINS.SUPER_ADMIN)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              currentUser?.role === 'SUPER_ADMIN'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => onSwitchUser(DEFAULT_ADMINS.CURATOR)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              currentUser?.role === 'REVIEWER'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Gazette Reviewer
          </button>
          <button
            type="button"
            onClick={() => onSwitchUser(null)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              !currentUser
                ? 'bg-red-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Public Citizen (Unauthorized)
          </button>
        </div>
      </div>

      {/* Access Denied Shield for Unauthorized Users */}
      {!isAuthorized ? (
        <Card className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 border-rose-200 bg-rose-50/40 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>HTTP 403 Forbidden • Administrative Boundary</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Administrative Authorization Required
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Modifying official government welfare criteria, statutory rules, and gazette source links
              is restricted to authorized state and central nodal officers.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-rose-100 text-left text-xs space-y-2 max-w-md mx-auto text-slate-600">
            <p className="font-semibold text-slate-800">Security Architecture:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Database Row-Level Security (RLS) blocks unauthorized mutations.</li>
              <li>Server-side token verification inspects authenticated claims.</li>
              <li>Zero public access to draft, unpublished, or archived records.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSwitchUser(DEFAULT_ADMINS.SUPER_ADMIN)}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Sign In as Authorized Administrator
            </Button>
          </div>
        </Card>
      ) : (
        children
      )}
    </div>
  );
};
