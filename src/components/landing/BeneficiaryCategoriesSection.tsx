import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Tractor,
  HeartHandshake,
  Users2,
  Home,
  Accessibility,
  Briefcase,
  HeartPulse,
  ArrowRight,
} from 'lucide-react';

export const BeneficiaryCategoriesSection: React.FC = () => {
  const categories = [
    {
      key: 'STUDENTS',
      title: 'Students & Scholarships',
      desc: 'Post-matric scholarships, merit awards, fee concessions, and hostel allowances across central and state boards.',
      icon: GraduationCap,
      sampleScheme: 'Post-Matric SC/ST/OBC Scholarship',
    },
    {
      key: 'FARMERS',
      title: 'Farmers & Agriculture',
      desc: 'Direct cash assistance, input subsidies, crop insurance (PMFBY), irrigation support, and solar pump grants.',
      icon: Tractor,
      sampleScheme: 'PM-Kisan Samman Nidhi',
    },
    {
      key: 'WOMEN',
      title: 'Women & Entrepreneurs',
      desc: 'Small savings initiatives, maternity benefits (PMMVY), micro-credit for SHGs, and business grants.',
      icon: HeartHandshake,
      sampleScheme: 'Sukanya Samriddhi Yojana',
    },
    {
      key: 'SENIOR_CITIZENS',
      title: 'Senior Citizens & Pensions',
      desc: 'Guaranteed old-age pensions, unorganized worker pension funds (APY), subsidized geriatric healthcare.',
      icon: Users2,
      sampleScheme: 'Atal Pension Yojana',
    },
    {
      key: 'LOW_INCOME',
      title: 'Low-Income Households',
      desc: 'Pucca housing assistance (PMAY-G / PMAY-U), NFSA food security, and subsidized utility connections.',
      icon: Home,
      sampleScheme: 'Pradhan Mantri Awas Yojana',
    },
    {
      key: 'PERSONS_WITH_DISABILITIES',
      title: 'Divyangjan / Differently Abled',
      desc: 'UDID-backed monthly pensions, assistive device distribution, reservation quotas, and special education allowances.',
      icon: Accessibility,
      sampleScheme: 'Divyangjan Welfare Grants',
    },
    {
      key: 'EMPLOYMENT_SEEKERS',
      title: 'Unemployed Youth & Skilling',
      desc: 'Monthly unemployment support (e.g., Yuva Nidhi), skill development stipends, and apprenticeship schemes.',
      icon: Briefcase,
      sampleScheme: 'State Yuva Nidhi & PMKVY',
    },
    {
      key: 'HEALTHCARE',
      title: 'Healthcare Beneficiaries',
      desc: 'Cashless tertiary hospitalization up to ₹5 Lakh per family per year and critical illness emergency funds.',
      icon: HeartPulse,
      sampleScheme: 'Ayushman Bharat PM-JAY',
    },
  ];

  return (
    <section id="categories" className="py-20 bg-white border-b border-civic-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
              <span>Tailored Welfare Portfolios</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Schemes Designed for Every Life Stage
            </h2>
            <p className="text-sm text-slate-600">
              Government schemes are formulated around specific socio-economic categories.
              Select your group to explore verified schemes.
            </p>
          </div>

          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-civic-emerald hover:text-emerald-700 transition-colors"
          >
            <span>View All Curated Schemes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={`/schemes?category=${cat.key}`}
                className="group flex flex-col justify-between bg-civic-sand border border-civic-border rounded-xl p-5 hover:border-civic-emerald/50 hover:bg-white transition-all shadow-subtle hover:shadow-card"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-civic-border text-civic-emerald flex items-center justify-center mb-4 group-hover:bg-civic-emerald group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-civic-emerald transition-colors">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-civic-border/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[170px]">
                    e.g. {cat.sampleScheme}
                  </span>
                  <span className="font-semibold text-civic-emerald group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
