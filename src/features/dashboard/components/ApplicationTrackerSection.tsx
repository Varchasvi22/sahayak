import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SchemeApplicationTrackerItem,
  ApplicationPreparationStatus,
  TRACKER_STATUS_LABELS,
} from '@/services/applicationTrackerService';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ExternalLink,
  FileCheck2,
  CheckCircle2,
  Layers,
  ArrowRight,
  KeyRound,
  X,
} from 'lucide-react';

interface ApplicationTrackerSectionProps {
  trackers: SchemeApplicationTrackerItem[];
  onStatusChange: (
    schemeId: string,
    newStatus: ApplicationPreparationStatus,
    details?: { acknowledgmentNumber?: string; notes?: string }
  ) => Promise<void>;
}

export const ApplicationTrackerSection: React.FC<ApplicationTrackerSectionProps> = ({
  trackers,
  onStatusChange,
}) => {
  const [selectedSchemeForAck, setSelectedSchemeForAck] =
    useState<SchemeApplicationTrackerItem | null>(null);
  const [ackInput, setAckInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const handleSelectStatus = async (
    item: SchemeApplicationTrackerItem,
    status: ApplicationPreparationStatus
  ) => {
    if (status === 'APPLIED' && !item.acknowledgmentNumber) {
      // Prompt for acknowledgment number when moving to APPLIED
      setSelectedSchemeForAck(item);
      setAckInput('');
      setNotesInput(item.notes || '');
      return;
    }

    await onStatusChange(item.schemeId, status);
  };

  const handleSaveAckModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeForAck) return;

    await onStatusChange(selectedSchemeForAck.schemeId, 'APPLIED', {
      acknowledgmentNumber: ackInput.trim() || undefined,
      notes: notesInput.trim() || undefined,
    });

    setSelectedSchemeForAck(null);
  };

  return (
    <Card className="shadow-subtle border-civic-border overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-civic-emerald uppercase tracking-wider">
              Application Tracker
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {trackers.length} Active Scheme{trackers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Application Preparation Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track individual schemes through structured verification stages. Statuses are never automated—you stay in full control.
          </p>
        </div>

        <Link to="/schemes" className="shrink-0">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Add Schemes to Pipeline
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
        {trackers.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-slate-50 border border-dashed rounded-xl">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                No Schemes Currently Tracked
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                Bookmark eligible welfare initiatives from the directory to start tracking your document collection and application submission.
              </p>
            </div>
            <Link to="/schemes">
              <Button variant="primary" size="sm">
                Explore Verified Schemes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {trackers.map((item) => {
              const meta = TRACKER_STATUS_LABELS[item.status] || {
                label: item.status,
                description: '',
                stepNumber: 1,
                variant: 'neutral' as const,
              };

              return (
                <div
                  key={item.schemeId}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/schemes/${item.schemeSlug}`}
                          className="text-sm sm:text-base font-bold text-slate-900 hover:text-civic-emerald transition-colors"
                        >
                          {item.schemeName}
                        </Link>
                        {item.governmentLevel && (
                          <Badge
                            variant={item.governmentLevel === 'CENTRAL' ? 'central' : 'state'}
                            size="sm"
                          >
                            {item.governmentLevel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.departmentName || 'Government Welfare Department'}
                      </p>
                    </div>

                    {/* Status Pill and Selector */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Stage {meta.stepNumber} of 6
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {meta.description}
                        </span>
                      </div>

                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleSelectStatus(
                            item,
                            e.target.value as ApplicationPreparationStatus
                          )
                        }
                        className="text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-emerald cursor-pointer"
                      >
                        <option value="DISCOVERED">1. Discovered</option>
                        <option value="REVIEWING_ELIGIBILITY">2. Reviewing Eligibility</option>
                        <option value="COLLECTING_DOCUMENTS">3. Collecting Documents</option>
                        <option value="READY_TO_APPLY">4. Ready to Apply</option>
                        <option value="APPLIED">5. Submitted / Applied</option>
                        <option value="COMPLETED">6. Benefit Disbursed</option>
                        <option value="CLOSED">✕ Closed / Ineligible</option>
                      </select>
                    </div>
                  </div>

                  {/* Submission details or notes */}
                  {item.acknowledgmentNumber && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-mono">
                      <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Application Reference / Acknowledgment ID:{' '}
                        <strong>{item.acknowledgmentNumber}</strong>
                      </span>
                      {item.submittedAt && (
                        <span className="text-[11px] text-emerald-700 ml-auto font-sans">
                          Submitted on {new Date(item.submittedAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Links */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/checklist`}
                        className="font-semibold text-civic-emerald hover:underline inline-flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>View Document Checklist</span>
                      </Link>

                      <Link
                        to={`/eligibility-results?scheme=${item.schemeSlug}`}
                        className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Eligibility Audit</span>
                      </Link>
                    </div>

                    {item.officialApplicationUrl && (
                      <a
                        href={item.officialApplicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-civic-navy font-bold inline-flex items-center gap-1 hover:underline"
                      >
                        <span>Launch Official Portal</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Acknowledgment Recording Modal */}
      {selectedSchemeForAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Record Official Submission
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSchemeForAck(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are updating <strong>{selectedSchemeForAck.schemeName}</strong> status to{' '}
              <strong>Submitted / Applied</strong>. Record your official receipt or acknowledgment number for tracking:
            </p>

            <form onSubmit={handleSaveAckModal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Acknowledgment / Application ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NSP-2026-UP-884920 or APP/2026/8812"
                  value={ackInput}
                  onChange={(e) => setAckInput(e.target.value)}
                  className="w-full text-xs font-mono py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-emerald"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Submission Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Submitted online via NSP, physical verification copy handed to college nodal officer"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-emerald"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setSelectedSchemeForAck(null)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm Submission
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
