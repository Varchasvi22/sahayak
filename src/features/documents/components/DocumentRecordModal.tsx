import React, { useState, useEffect } from 'react';
import { AggregatedDocumentRequirement, CanonicalDocumentStatus, UserDocumentItem } from '../types';
import { Button } from '@/components/ui/Button';
import { X, ShieldAlert, Check, Calendar, KeyRound, ExternalLink, Info } from 'lucide-react';

interface DocumentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: AggregatedDocumentRequirement | null;
  onSave: (updatedItem: UserDocumentItem) => Promise<void>;
}

export const DocumentRecordModal: React.FC<DocumentRecordModalProps> = ({
  isOpen,
  onClose,
  document,
  onSave,
}) => {
  if (!isOpen || !document) return null;

  const [status, setStatus] = useState<CanonicalDocumentStatus>(document.status);
  const [issuedDate, setIssuedDate] = useState<string>(document.issuedDate || '');
  const [expiryDate, setExpiryDate] = useState<string>(document.expiryDate || '');
  const [reference, setReference] = useState<string>(document.documentReferenceMasked || '');
  const [notes, setNotes] = useState<string>(document.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setStatus(document.status);
      setIssuedDate(document.issuedDate || '');
      setExpiryDate(document.expiryDate || '');
      setReference(document.documentReferenceMasked || '');
      setNotes(document.notes || '');
    }
  }, [document]);

  // Check if expiry date is in the past
  const isExpiredDate = expiryDate && new Date(expiryDate) < new Date();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const finalStatus: CanonicalDocumentStatus =
        isExpiredDate && status === 'AVAILABLE' ? 'EXPIRED' : status;

      const item: UserDocumentItem = {
        canonicalKey: document.canonicalKey,
        documentName: document.documentName,
        status: finalStatus,
        issuedDate: issuedDate || null,
        expiryDate: expiryDate || null,
        documentReferenceMasked: reference || null,
        notes: notes || null,
      };

      await onSave(item);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
              {document.canonicalKey}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {document.documentName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Privacy Callout */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Privacy Promise:</span> Sahayak does not collect or store physical document uploads or full Aadhaar numbers. Track certificate availability and validity dates for your own personal checklist.
            </div>
          </div>

          {/* Availability Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Current Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CanonicalDocumentStatus)}
              className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-emerald"
            >
              <option value="AVAILABLE">✓ Available in Hand (Ready for upload)</option>
              <option value="NEEDS_VERIFICATION">⏳ Applied / In Verification</option>
              <option value="EXPIRED">⚠️ Expired (Needs Renewal)</option>
              <option value="MISSING">✕ Missing (Not Yet Applied)</option>
              <option value="NOT_APPLICABLE">⊘ Not Applicable to Me</option>
            </select>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Issue Date (Optional)</span>
              </label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Expiry Date (If applicable)</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
              />
            </div>
          </div>

          {isExpiredDate && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                The selected expiry date has passed. Sahayak will treat this certificate as needing renewal.
              </span>
            </div>
          )}

          {/* Masked Reference */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Masked Reference / Acknowledgement # (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. INC/••••/2026 or SBIN••••1234"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
            />
            <span className="text-[10px] text-slate-400">
              Only enter masked or partial reference numbers for personal recall.
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Personal Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Applied at Taluk office, acknowledgment slip with father"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
            />
          </div>

          {/* Issuing Authority & Guidelines link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Issuing Authority: <strong>{document.issuingAuthority}</strong></span>
            {document.howToObtainUrl && (
              <a
                href={document.howToObtainUrl}
                target="_blank"
                rel="noreferrer"
                className="text-civic-emerald font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Certificate Status'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
