import React from 'react';
import { ShieldCheck, FileCheck, Landmark, Lock, Check } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-20 bg-civic-sand border-b border-civic-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-civic-border rounded-2xl p-8 sm:p-12 shadow-subtle">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-civic-emerald" />
              <span>Public Integrity & Security Commitments</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Built on Principles of Zero-Compromise Trust
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Civic technology must protect the vulnerable. We treat data privacy and factual accuracy
              as non-negotiable architectural requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-xl bg-civic-sand border border-civic-border">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-civic-emerald flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero-Aadhaar Storage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never prompt for or store your 12-digit Aadhaar number, biometric tokens, or physical card scans.
                We only record your self-reported document availability status.
              </p>
              <ul className="text-[11px] text-slate-500 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-civic-emerald" />
                  <span>No UIDAI biometric data held</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-civic-emerald" />
                  <span>Encrypted PostgreSQL Row Level Security</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 p-6 rounded-xl bg-civic-sand border border-civic-border">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Official Source Links</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every scheme is anchored directly to its official Ministry website (`.gov.in` or `.nic.in`)
                and verified gazette guidelines. We never invent requirements or deadlines.
              </p>
              <ul className="text-[11px] text-slate-500 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Timestamps for every verified rule</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Zero affiliate links or third-party brokers</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 p-6 rounded-xl bg-civic-sand border border-civic-border">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Deterministic Rule Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eligibility is evaluated using pure mathematical logic (AND, OR, income thresholds).
                We never allow generative AI to hallucinate whether an applicant qualifies.
              </p>
              <ul className="text-[11px] text-slate-500 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Explainable passed & failed audit trail</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Missing info never defaults to pass</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
