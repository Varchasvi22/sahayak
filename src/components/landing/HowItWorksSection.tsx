import React from 'react';
import {
  UserCheck,
  Search,
  FileCheck2,
  ListTodo,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Answer 5 Basic Questions',
      subtitle: 'Demographic Matching',
      desc: 'Tell us your age, state, resident area, and approximate household income. No identity documents required to start.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Deterministic Rule Evaluation',
      subtitle: 'Explainable Evaluation',
      desc: 'Our engine applies strict criteria (AND/OR, income limits, categories) and explains exactly why you qualify or what is missing.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Cross-Scheme Document Vault',
      subtitle: 'Document Intelligence',
      desc: 'Record what documents you hold (Income, Caste, Ration Card). Sahayak finds certificates that unlock multiple schemes at once.',
      icon: FileCheck2,
    },
    {
      num: '04',
      title: 'Personalized Action Plan',
      subtitle: 'Step-by-Step Readiness',
      desc: 'Receive an audit checklist with exact instructions on where to get missing certificates (e-District, CSC, Tehsildar).',
      icon: ListTodo,
    },
    {
      num: '05',
      title: 'Apply on Official Portals',
      subtitle: 'Confident Submission',
      desc: 'Follow direct links to verified `.gov.in` application windows with your complete paper set in hand.',
      icon: ExternalLink,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-civic-sand border-b border-civic-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-civic-emerald text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The 5-Step Differentiator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Sahayak Prepares You for Real Welfare Delivery
          </h2>
          <p className="text-base text-slate-600">
            Finding a scheme takes 2 minutes. Getting your application approved requires preparation.
            Here is how Sahayak guides you from start to finish.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white border border-civic-border rounded-xl p-6 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold font-mono text-civic-emerald bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      STAGE {step.num}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-civic-emerald group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {step.title}
                  </h3>
                  <div className="text-[11px] font-semibold text-civic-emerald mb-2">
                    {step.subtitle}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
