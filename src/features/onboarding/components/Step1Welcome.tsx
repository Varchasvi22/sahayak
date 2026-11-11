import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Step1WelcomeProps {
  onStart: () => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onStart }) => {
  return (
    <Card className="shadow-card border-civic-border">
      <CardHeader className="text-center space-y-3 p-6 sm:p-8 pb-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-civic-navy text-white font-bold flex items-center justify-center text-2xl shadow-xs">
          स
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-civic-emerald text-xs font-semibold border border-emerald-200/80 mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Welfare Eligibility Discovery</span>
        </div>

        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Government Schemes Made for You
        </CardTitle>

        <CardDescription className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Government welfare rules in India are strictly structured around age, income thresholds,
          social categories, and state residence. Sahayak asks only for what is required to evaluate your eligibility.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6 sm:p-8 pt-2">
        {/* Why Sahayak needs your information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-civic-sand border border-civic-border space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-civic-emerald flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Takes 2 Minutes</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              5 concise steps. You do not need to scan or upload certificates right now.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-civic-sand border border-civic-border space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Zero-Aadhaar Guarantee</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              We never request or store your 12-digit Aadhaar number or biometric tokens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-civic-sand border border-civic-border space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Deterministic Logic</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your profile is matched against verified gazette criteria, not unpredictable AI.
            </p>
          </div>
        </div>

        {/* Privacy Commitment Notice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-civic-emerald shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-emerald-900">
              Statutory Data Protection & Non-Commercial Commitment
            </strong>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Sahayak is an independent civic platform. Your profile information is never sold to private marketers
              or insurance third parties. If you choose to save your profile, it is protected by PostgreSQL Row Level Security (RLS).
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            className="w-full justify-center shadow-sm"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Start Eligibility Questionnaire
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
