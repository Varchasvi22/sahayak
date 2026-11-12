/**
 * SAHAYAK Scheme Audit Log Drawer
 *
 * Displays a chronological, tamper-resistant trail of all modifications,
 * reviewer approvals, and status transitions for a scheme.
 */

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  X,
  History,
  ShieldCheck,
  User,
  Clock,
} from 'lucide-react';
import { SchemeAuditLogRow } from '../types';
import { getSchemeAuditLogs } from '../adminService';

interface AuditLogDrawerProps {
  schemeId: string;
  schemeTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  schemeId,
  schemeTitle,
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<SchemeAuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && schemeId) {
      setLoading(true);
      getSchemeAuditLogs(schemeId).then((data) => {
        setLogs(data);
        setLoading(false);
      });
    }
  }, [isOpen, schemeId]);

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'SCHEME_CREATED':
        return <Badge variant="eligible">Created</Badge>;
      case 'SCHEME_UPDATED':
        return <Badge variant="neutral">Updated</Badge>;
      case 'PUBLICATION_STATUS_CHANGED':
        return <Badge variant="central">Status Shift</Badge>;
      case 'SCHEME_DEACTIVATED':
        return <Badge variant="notEligible" className="bg-rose-100 text-rose-800 border-rose-200">Deactivated</Badge>;
      case 'SCHEME_REACTIVATED':
        return <Badge variant="eligible">Reactivated</Badge>;
      default:
        return <Badge variant="neutral">{action}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scheme Audit Trail</h3>
              <p className="text-xs text-slate-500 truncate max-w-sm">{schemeTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400 space-y-2">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
              <p>Loading verified audit entries...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No Historical Mutations</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                This record remains in its baseline gazette state. All subsequent modifications will be appended here with cryptographic timestamps.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 space-y-1.5">
                  {/* Timeline Dot */}
                  <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />

                  <div className="flex items-center justify-between gap-2">
                    {getActionBadge(log.action)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {log.change_summary}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>
                      Actor: <strong>{log.performed_by_name}</strong>
                      {log.performed_by_email && ` (${log.performed_by_email})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Audit integrity compliant with MeitY Gazette Guidelines
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
