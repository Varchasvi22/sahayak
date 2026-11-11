import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import { BENEFICIARY_CATEGORIES, INDIAN_STATES_AND_UTS } from '@/data/constants';
import {
  Search,
  Calendar,
  Building2,
  ExternalLink,
  BookmarkCheck,
  RotateCcw,
  Sparkles,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

export const SchemesExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('ALL');
    setSelectedCategory('ALL');
    setSelectedState('ALL');
  };

  const filteredSchemes = useMemo(() => {
    return VERIFIED_SCHEMES.filter((scheme) => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = scheme.official_name.toLowerCase().includes(query);
        const matchesShort = scheme.short_title.toLowerCase().includes(query);
        const matchesDept = scheme.department_name.toLowerCase().includes(query);
        const matchesDesc = scheme.brief_description.toLowerCase().includes(query);
        if (!matchesName && !matchesShort && !matchesDept && !matchesDesc) return false;
      }
      // Gov level
      if (selectedLevel !== 'ALL' && scheme.government_level !== selectedLevel) {
        return false;
      }
      // Category
      if (selectedCategory !== 'ALL' && scheme.beneficiary_category !== selectedCategory) {
        return false;
      }
      // State
      if (selectedState !== 'ALL') {
        if (scheme.government_level === 'STATE' && scheme.state_or_ut !== selectedState) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedLevel, selectedCategory, selectedState]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="central">Verified Civic Database</Badge>
            <span className="text-xs text-slate-500 font-medium">
              100% Sourced from Official Gazette & Ministry Portals
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Government Welfare Scheme Directory
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Browse verified welfare schemes across Central and State Governments.
            Every record displays verified rules, required documentation, and direct links to official application portals.
          </p>
        </div>

        <Link to="/onboarding" className="shrink-0">
          <Button variant="primary" size="md" rightIcon={<Sparkles className="w-4 h-4" />}>
            Match with My Profile
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-civic-border rounded-xl p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-civic-emerald" />
            <span>Faceted Filter Engine</span>
          </div>
          {(searchQuery || selectedLevel !== 'ALL' || selectedCategory !== 'ALL' || selectedState !== 'ALL') && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-civic-emerald flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by name, ministry, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Government Levels' },
              { value: 'CENTRAL', label: 'Central Schemes Only' },
              { value: 'STATE', label: 'State Schemes Only' },
            ]}
          />

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Beneficiary Categories' },
              ...BENEFICIARY_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
            ]}
          />

          <Select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            options={[
              { value: 'ALL', label: 'All States & UTs' },
              ...INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing <strong>{filteredSchemes.length}</strong> verified government schemes
        </span>
        <span className="text-[11px] text-slate-400">
          Sorted by: Ministry Verification Priority
        </span>
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className="flex flex-col justify-between hover:border-civic-emerald/50 shadow-subtle hover:shadow-card transition-all"
            >
              <CardHeader className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'}>
                      {scheme.government_level}
                    </Badge>
                    {scheme.state_or_ut && (
                      <Badge variant="state">{scheme.state_or_ut}</Badge>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave(scheme.id)}
                    className="text-slate-400 hover:text-slate-800 transition-colors"
                    title={savedIds.includes(scheme.id) ? 'Remove Bookmark' : 'Save Scheme'}
                  >
                    <BookmarkCheck
                      className={`w-4 h-4 ${
                        savedIds.includes(scheme.id) ? 'text-civic-emerald fill-civic-emerald' : ''
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                    {scheme.official_name}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{scheme.department_name}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {scheme.brief_description}
                </p>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Benefit Pill */}
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs">
                  <span className="font-semibold text-emerald-900">Primary Benefit: </span>
                  <span className="text-emerald-800">
                    {scheme.financial_benefit_amount
                      ? `${formatINR(scheme.financial_benefit_amount)} benefit`
                      : 'Non-cash subsidy / coverage'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Verified: {scheme.last_verified_at}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{scheme.required_document_keys.length} Docs Required</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <Link to={`/schemes/${scheme.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details & Audit
                    </Button>
                  </Link>
                  <a
                    href={scheme.official_application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                    title={`Open official portal: ${scheme.official_portal_name}`}
                  >
                    <Button variant="civic" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Portal
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Schemes Matched Your Filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or broadening your State/Category selections.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
