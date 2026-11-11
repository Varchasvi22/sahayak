import React from 'react';
import { ShieldCheck, Target, CheckCircle2, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white border-b border-civic-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-civic-emerald text-xs font-semibold border border-emerald-200">
              <Target className="w-3.5 h-3.5" />
              <span>Public Mission</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Bridging the Last-Mile Welfare Gap for 1.4 Billion Citizens.
            </h2>

            <p className="text-base text-slate-600 leading-relaxed">
              Every year, thousands of crores in budgeted welfare support go unclaimed.
              The barrier is rarely lack of intention—it is <strong>information asymmetry</strong>,
              opaque official eligibility rules, and fragmented documentation requirements.
            </p>

            <p className="text-base text-slate-600 leading-relaxed">
              <strong>Sahayak</strong> was engineered to solve this specific structural problem.
              We do not treat welfare discovery as a simple search catalog. We provide citizens with a
              transparent, explainable preparation system that guides an applicant from initial curiosity
              to an airtight, document-ready application.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-civic-sand border border-civic-border">
                <CheckCircle2 className="w-5 h-5 text-civic-emerald shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero Hallucination</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Rule evaluations run on deterministic logic—never on unpredictable AI guesswork.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-civic-sand border border-civic-border">
                <ShieldCheck className="w-5 h-5 text-civic-emerald shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero-Aadhaar Collection</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    We track document availability without storing your sensitive 12-digit Aadhaar numbers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Principles Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-civic-navy to-slate-900 text-white shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Civic-Tech Architectural Guarantee
                </span>
              </div>

              <h3 className="text-xl font-bold">
                Why Citizens & Community Workers Trust Sahayak
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="pb-3 border-b border-slate-700/60">
                  <strong className="text-white block text-sm mb-1">
                    1. Verified Official Sources
                  </strong>
                  Every scheme record is linked to its official gazette notification, ministry department, and `.gov.in` portal.
                </div>

                <div className="pb-3 border-b border-slate-700/60">
                  <strong className="text-white block text-sm mb-1">
                    2. Cross-Scheme Document Intelligence
                  </strong>
                  Upload readiness status once. If one certificate unlocks 4 different schemes, Sahayak tells you immediately.
                </div>

                <div>
                  <strong className="text-white block text-sm mb-1">
                    3. Actionable CSC Prep
                  </strong>
                  Know exactly what papers to carry before visiting your local Common Service Centre (CSC) or Tehsildar office.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
