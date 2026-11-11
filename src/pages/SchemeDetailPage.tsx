import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Building2,
  Bot,
  ArrowLeft,
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Schemes</span>
        </Link>
      </div>

      {/* Header Card */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="central">Central Scheme</Badge>
              <Badge variant="eligible">Active Application Window</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last Verified: 10 Nov 2026</span>
            </div>
          </div>

          <CardTitle className="text-2xl sm:text-3xl">
            {slug?.replace(/-/g, ' ').toUpperCase() || 'PM-KISAN SAMMAN NIDHI'}
          </CardTitle>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Ministry of Agriculture & Farmers Welfare</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            Central sector scheme with 100% funding from Government of India to provide income support
            to all landholding farmer families across the country to enable them to take care of expenses related to agriculture and allied activities as well as domestic needs.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://pmkisan.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button variant="civic" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Visit Official Application Portal
              </Button>
            </a>
            <Link to="/assistant">
              <Button variant="outline" leftIcon={<Bot className="w-4 h-4 text-emerald-600" />}>
                Ask AI Assistant
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Explainable Eligibility Audit Preview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Explainable Eligibility Evaluation (Rule Engine)
          </h2>
          <p className="text-xs text-slate-500">
            Transparent breakdown of why a citizen qualifies, fails, or has incomplete information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Passed Conditions (3)</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Meets citizenship, age &gt; 18, and state coverage requirements.
              </p>
            </CardHeader>
          </Card>

          <Card className="border-red-200 bg-red-50/30">
            <CardHeader className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-red-800 text-xs font-bold">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Failed Conditions (0)</span>
              </div>
              <p className="text-[11px] text-red-700">
                No disqualifying factors detected based on current profile.
              </p>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Missing Information (1)</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Landholding status is unverified in your profile questionnaire.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Live rule evaluation and database query for scheme details will be wired in <strong>Phase 3</strong>.
      </div>
    </div>
  );
};
