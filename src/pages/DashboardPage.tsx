import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import {
  TrendingUp,
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  User,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Demo Citizen State
  const [citizen] = useState({
    name: 'Priya Sharma',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    category: 'SC (Scheduled Caste)',
    status: 'Student (Bachelor of Science)',
    annualIncome: 180000,
  });

  // Recommended schemes based on profile
  const recommendedSchemes = [
    {
      ...VERIFIED_SCHEMES[2], // Post Matric Scholarship SC
      matchStatus: 'POTENTIALLY_ELIGIBLE' as const,
      matchReason: 'Matches Category (SC), Student status, and Income < ₹2.5L',
      documentReadiness: 80,
    },
    {
      ...VERIFIED_SCHEMES[1], // Ayushman Bharat
      matchStatus: 'INSUFFICIENT_INFORMATION' as const,
      matchReason: 'Requires NFSA BPL Ration card status confirmation',
      documentReadiness: 66,
    },
    {
      ...VERIFIED_SCHEMES[3], // Sukanya Samriddhi
      matchStatus: 'NOT_ELIGIBLE' as const,
      matchReason: 'Age exceeds 10 years requirement',
      documentReadiness: 100,
    },
  ];

  const [savedSchemes, setSavedSchemes] = useState<string[]>([
    'sch-post-matric-sc',
  ]);

  const toggleSave = (id: string) => {
    setSavedSchemes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Applicant Profile Summary Banner */}
      <div className="bg-white border border-civic-border rounded-2xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-civic-navy text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-xs">
            प्रि
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{citizen.name}</h1>
              <Badge variant="eligible" size="sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Profile Active & Verified</span>
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-medium text-slate-800">{citizen.district}, {citizen.state}</span>
              <span>•</span>
              <span>{citizen.category}</span>
              <span>•</span>
              <span>{citizen.status}</span>
              <span>•</span>
              <span className="font-semibold text-civic-emerald">
                Family Income: {formatINR(citizen.annualIncome)}/yr
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/profile">
            <Button variant="outline" size="sm" leftIcon={<User className="w-4 h-4" />}>
              Edit Profile
            </Button>
          </Link>
          <Link to="/schemes">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Find More Schemes
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics & Readiness Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Meter */}
        <Card className="border-l-4 border-l-civic-emerald">
          <CardHeader className="p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Application Readiness
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">75%</span>
              <span className="text-xs font-semibold text-civic-emerald flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> High
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-civic-emerald h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              3 of 4 required certificates ready
            </p>
          </CardHeader>
        </Card>

        {/* Financial Benefits */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Annual Value Unlocked
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">₹45,000+</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-3">
              Direct Benefit Transfer + fee waivers
            </p>
          </CardHeader>
        </Card>

        {/* Schemes Matched */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Eligible Schemes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">2</span>
              <span className="text-xs font-medium text-slate-500">Qualified</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-3">
              1 scheme needs more info
            </p>
          </CardHeader>
        </Card>

        {/* Action Items */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Missing Certificates
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700">1</span>
              <span className="text-xs font-semibold text-amber-600">Action Needed</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-3">
              Income cert requires annual renewal
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* 3. Missing Document Alert Card (High Leverage) */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-900">
              High-Leverage Document Action: Renew Income Certificate
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              Your previous Income Certificate has expired. Renewing it at your local Tehsildar office
              or UP e-District portal brings your <strong>Post-Matric Scholarship</strong> readiness to <strong>100%</strong>.
            </p>
          </div>
        </div>
        <Link to="/vault" className="shrink-0">
          <Button variant="outline" size="sm" className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100">
            Open Document Vault
          </Button>
        </Link>
      </div>

      {/* 4. Two-Column Layout: Recommended Schemes vs. Tasks & Saved */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Matched Schemes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Welfare Schemes Matching Your Profile
              </h2>
              <p className="text-xs text-slate-500">
                Evaluated deterministically against income, caste, state, and student criteria.
              </p>
            </div>
            <Link to="/schemes" className="text-xs font-semibold text-civic-emerald hover:underline">
              View All ({VERIFIED_SCHEMES.length})
            </Link>
          </div>

          <div className="space-y-4">
            {recommendedSchemes.map((scheme) => (
              <Card key={scheme.id} className="p-5 flex flex-col justify-between hover:border-civic-emerald/50">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          scheme.matchStatus === 'POTENTIALLY_ELIGIBLE'
                            ? 'eligible'
                            : scheme.matchStatus === 'INSUFFICIENT_INFORMATION'
                            ? 'unknown'
                            : 'notEligible'
                        }
                      >
                        {scheme.matchStatus.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'}>
                        {scheme.government_level}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSave(scheme.id)}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-900"
                    >
                      <BookmarkCheck
                        className={`w-4 h-4 ${
                          savedSchemes.includes(scheme.id) ? 'text-civic-emerald fill-civic-emerald' : ''
                        }`}
                      />
                      <span>{savedSchemes.includes(scheme.id) ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {scheme.official_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {scheme.brief_description}
                    </p>
                  </div>

                  {/* Match Reason Banner */}
                  <div
                    className={`p-2.5 rounded-lg text-xs ${
                      scheme.matchStatus === 'POTENTIALLY_ELIGIBLE'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                        : scheme.matchStatus === 'INSUFFICIENT_INFORMATION'
                        ? 'bg-amber-50 text-amber-800 border border-amber-100'
                        : 'bg-red-50 text-red-800 border border-red-100'
                    }`}
                  >
                    <strong>Evaluation Audit:</strong> {scheme.matchReason}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500">Document Readiness: </span>
                    <strong className="text-slate-900">{scheme.documentReadiness}%</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/schemes/${scheme.slug}`}>
                      <Button variant="outline" size="sm">
                        View Audit Details
                      </Button>
                    </Link>
                    <a
                      href={scheme.official_application_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="civic" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Official Portal
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Pending Tasks & Saved Schemes */}
        <div className="space-y-6">
          {/* Pending Tasks Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Application Milestones</CardTitle>
                <Link to="/tasks" className="text-xs font-semibold text-civic-emerald hover:underline">
                  Manage
                </Link>
              </div>
              <CardDescription className="text-xs">
                Next actionable steps before official portal submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {[
                {
                  title: 'Apply for fresh Income Certificate (Tehsildar / e-District)',
                  due: '18 Nov 2026',
                  done: false,
                },
                {
                  title: 'Collect College Bonafide & Fee Receipt',
                  due: '20 Nov 2026',
                  done: true,
                },
                {
                  title: 'Verify Aadhaar-Bank Seeding via NPCI Portal',
                  due: '15 Nov 2026',
                  done: true,
                },
              ].map((task, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                  <input
                    type="checkbox"
                    defaultChecked={task.done}
                    className="mt-0.5 rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                  />
                  <div className="flex-1">
                    <span className={`font-medium ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Due: {task.due}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Saved Schemes Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Saved Schemes ({savedSchemes.length})</CardTitle>
                <Link to="/saved" className="text-xs font-semibold text-civic-emerald hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {savedSchemes.length > 0 ? (
                savedSchemes.map((id) => {
                  const scheme = VERIFIED_SCHEMES.find((s) => s.id === id);
                  if (!scheme) return null;
                  return (
                    <div key={id} className="p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">
                        {scheme.short_title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Benefit: {formatINR(scheme.financial_benefit_amount || 0)}
                      </div>
                      <Link to={`/schemes/${scheme.slug}`} className="text-[11px] font-semibold text-civic-emerald block pt-1 hover:underline">
                        Review Requirements →
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No saved schemes yet. Click the bookmark icon on any scheme to pin it here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
