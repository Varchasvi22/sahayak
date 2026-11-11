import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { BENEFICIARY_CATEGORIES, INDIAN_STATES_AND_UTS } from '@/data/constants';
import { Search, Calendar, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SchemesExplorePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="central">Verified Directory</Badge>
            <span className="text-xs text-slate-500 font-medium">10 Initial Curated Schemes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Government Welfare Schemes
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore verified central and state welfare initiatives with transparent criteria and official application links.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search by scheme name or keyword..."
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Select
          options={[
            { value: 'ALL', label: 'All Government Levels' },
            { value: 'CENTRAL', label: 'Central Schemes' },
            { value: 'STATE', label: 'State Schemes' },
          ]}
          placeholder="Government Level"
        />
        <Select
          options={BENEFICIARY_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          placeholder="Beneficiary Category"
        />
        <Select
          options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
          placeholder="All States & UTs"
        />
      </div>

      {/* Placeholder Scheme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            slug: 'pm-kisan',
            title: 'PM-Kisan Samman Nidhi',
            dept: 'Ministry of Agriculture & Farmers Welfare',
            level: 'CENTRAL' as const,
            category: 'FARMERS',
            benefit: '₹6,000 per year via Direct Benefit Transfer (DBT)',
            verifiedDate: '10 Nov 2026',
          },
          {
            slug: 'ayushman-bharat-pmjay',
            title: 'Ayushman Bharat (PM-JAY)',
            dept: 'National Health Authority',
            level: 'CENTRAL' as const,
            category: 'HEALTHCARE',
            benefit: '₹5,00,000 cashless secondary and tertiary hospitalization',
            verifiedDate: '08 Nov 2026',
          },
          {
            slug: 'post-matric-scholarship-sc',
            title: 'Post Matric Scholarship for SC Students',
            dept: 'Ministry of Social Justice and Empowerment',
            level: 'CENTRAL' as const,
            category: 'STUDENTS',
            benefit: 'Full academic fee waiver plus monthly maintenance allowance',
            verifiedDate: '11 Nov 2026',
          },
        ].map((scheme) => (
          <Card key={scheme.slug} className="flex flex-col justify-between hover:border-emerald-300">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={scheme.level === 'CENTRAL' ? 'central' : 'state'}>
                  {scheme.level}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Verified: {scheme.verifiedDate}</span>
                </div>
              </div>
              <CardTitle className="text-base line-clamp-1">{scheme.title}</CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{scheme.dept}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700">
                <strong>Benefit:</strong> {scheme.benefit}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Link to={`/schemes/${scheme.slug}`}>
                  <Button variant="outline" size="sm">
                    View Details & Audit
                  </Button>
                </Link>
                <Link to="/onboarding">
                  <Button variant="primary" size="sm">
                    Test Eligibility
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Faceted filters, full dataset query, and database integration will be implemented in <strong>Phase 3</strong>.
      </div>
    </div>
  );
};
