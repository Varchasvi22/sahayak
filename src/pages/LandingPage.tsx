import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Modular Landing Sections
import { AboutSection } from '@/components/landing/AboutSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { BeneficiaryCategoriesSection } from '@/components/landing/BeneficiaryCategoriesSection';
import { TrustSection } from '@/components/landing/TrustSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f8f6] via-civic-sand to-white border-b border-civic-border py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-civic-emerald text-xs font-semibold border border-emerald-200/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Government Welfare Discovery & Application Readiness</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Discover Welfare Schemes You Qualify For. <br className="hidden sm:inline" />
              <span className="text-civic-emerald">Get Document-Ready to Apply.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sahayak bridges the gap between official Indian welfare schemes and eligible citizens.
              Check potential eligibility in 2 minutes, get explainable rules, and prepare an airtight document checklist.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/onboarding" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto px-8 shadow-sm hover:shadow"
                >
                  Find Schemes for Me
                </Button>
              </Link>
              <Link to="/schemes" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<Compass className="w-5 h-5 text-slate-600" />}
                  className="w-full sm:w-auto px-6 border-slate-300 hover:bg-slate-50"
                >
                  Explore Verified Directory
                </Button>
              </Link>
            </div>

            {/* Key Trust Badges */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-civic-emerald flex items-center justify-center">
                  <Lock className="w-3 h-3" />
                </div>
                <span>Zero-Aadhaar Privacy Commitment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-civic-emerald flex items-center justify-center">
                  <Award className="w-3 h-3" />
                </div>
                <span>100% Deterministic Rule Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-civic-emerald flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span>Direct Verified `.gov.in` Portals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section (5-Stage Pipeline) */}
      <HowItWorksSection />

      {/* 3. Beneficiary Categories Section */}
      <BeneficiaryCategoriesSection />

      {/* 4. About Sahayak Section */}
      <AboutSection />

      {/* 5. Trust & Source-Verification Section */}
      <TrustSection />

      {/* 6. Geographic Coverage Distinction Banner */}
      <section className="py-14 bg-civic-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>Geographic Scope Architecture</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Software Coverage vs. Curated Verified Database
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sahayak’s software engine is architected to support all <strong>28 Indian States and 8 Union Territories</strong>.
                To maintain 100% factual accuracy, our database is actively populated with verified central and state schemes with direct gazette citations.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/onboarding">
                <Button variant="primary" size="md">
                  Check My State's Eligibility
                </Button>
              </Link>
              <Link to="/schemes">
                <Button variant="outline" size="md" className="border-slate-600 text-white hover:bg-slate-800">
                  Browse All Schemes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
