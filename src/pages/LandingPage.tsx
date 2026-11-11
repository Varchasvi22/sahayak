import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 border-b border-slate-200/60 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold border border-emerald-300 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Civic Welfare Discovery & Readiness Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Unlock the Government Benefits You Deserve.
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed">
              Don’t let missing documents or complicated rules stand between you and your rights.
              Sahayak guides you from <strong>potential eligibility</strong> to complete <strong>application readiness</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link to="/onboarding" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto">
                  Check My Eligibility Now
                </Button>
              </Link>
              <Link to="/schemes" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" leftIcon={<Compass className="w-5 h-5" />} className="w-full sm:w-auto">
                  Explore Verified Schemes
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero-Aadhaar Storage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Rule Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Official Portal Links Only</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Differentiator Flow */}
      <section className="py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Beyond Scheme Discovery: The Readiness Journey
            </h2>
            <p className="text-sm text-slate-600">
              Finding a scheme is only 20% of the battle. Sahayak prepares you for the other 80%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Potential Eligibility',
                desc: 'Our deterministic rule engine matches your profile against income, age, category, and state criteria.',
              },
              {
                step: '02',
                title: 'Understand Why',
                desc: 'Get an explainable audit: see every passed rule, every failed condition, and any missing details.',
              },
              {
                step: '03',
                title: 'Document Vault',
                desc: 'Track certificates once. Sahayak detects missing paperwork and tells you where to get them.',
              },
              {
                step: '04',
                title: 'Cross-Scheme Math',
                desc: 'Discover high-leverage documents that unlock 3, 4, or 5 schemes at the exact same time.',
              },
              {
                step: '05',
                title: 'Apply with Confidence',
                desc: 'Follow step-by-step milestones with direct links to official government submission portals.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded w-fit mb-3">
                    STEP {item.step}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geographic Scope & Database Notice */}
      <section className="py-12 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="central">Geographic Coverage</Badge>
                <span className="text-xs text-slate-500 font-medium">
                  All 28 States & 8 Union Territories Supported
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Curated, Verified Welfare Database
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Sahayak prioritizes data integrity over fake volume. Our engine supports every Indian state,
                and our database is continuously populated with verified Central and State government schemes
                with official sources.
              </p>
            </div>
            <Link to="/schemes">
              <Button variant="civic" size="md">
                Browse Curated Schemes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
