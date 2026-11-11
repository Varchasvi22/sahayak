import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { INDIAN_STATES_AND_UTS } from '@/data/constants';
import { SchemeCard } from '@/features/schemes/components/SchemeCard';
import {
  getSchemes,
  getSchemeCategories,
  SchemeRow,
  CategoryRow,
  SchemeFilterOptions,
} from '@/services/schemeService';
import {
  getSavedSchemeIds,
  toggleSchemeBookmark,
} from '@/services/savedSchemeService';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalOnboarding } from '@/services/profileService';
import {
  Search,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
  X,
} from 'lucide-react';

export const SchemesExplorePage: React.FC = () => {
  const { user, profile } = useAuth();
  const localDraft = getLocalOnboarding();

  // Citizen Profile Parameters (if available)
  const citizenState = profile?.state_of_residence || localDraft?.stateOfResidence;
  const citizenCategory = profile?.social_category || localDraft?.socialCategory;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'CENTRAL' | 'STATE'>('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedApplicantType, setSelectedApplicantType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'verified_desc' | 'name_asc' | 'name_desc' | 'benefit_desc'>('verified_desc');

  // Matching Profile Toggle
  const [isMatchingProfile, setIsMatchingProfile] = useState(false);

  // Data & Async States
  const [schemes, setSchemes] = useState<SchemeRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Categories & Saved Bookmarks on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const [catRes, savedIds] = await Promise.all([
          getSchemeCategories(),
          getSavedSchemeIds(user?.id),
        ]);
        if (isMounted) {
          if (catRes.data) setCategories(catRes.data);
          setSavedSchemeIds(savedIds);
        }
      } catch (err) {
        console.warn('Initial load warning:', err);
      }
    }

    loadInitial();

    // Listen for saved scheme updates across tabs or components
    const handleSavedChanged = (e: any) => {
      if (e.detail?.allIds) {
        setSavedSchemeIds(e.detail.allIds);
      }
    };
    window.addEventListener('sahayak:saved_schemes_changed', handleSavedChanged);

    return () => {
      isMounted = false;
      window.removeEventListener('sahayak:saved_schemes_changed', handleSavedChanged);
    };
  }, [user]);

  // Fetch Schemes whenever filter parameters change
  const fetchSchemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filterOptions: SchemeFilterOptions = {
      level: selectedLevel,
      categoryId: selectedCategory,
      region: isMatchingProfile && citizenState ? citizenState : selectedState,
      applicantType: selectedApplicantType,
      status: selectedStatus,
      searchQuery: searchQuery,
      sortBy: sortBy,
    };

    const { data, error: fetchErr } = await getSchemes(filterOptions);

    if (fetchErr) {
      setError(fetchErr.message || 'Failed to load welfare schemes from database.');
    } else {
      setSchemes(data);
    }
    setIsLoading(false);
  }, [
    selectedLevel,
    selectedCategory,
    selectedState,
    selectedApplicantType,
    selectedStatus,
    searchQuery,
    sortBy,
    isMatchingProfile,
    citizenState,
  ]);

  useEffect(() => {
    // Debounce search slightly to avoid excessive calls
    const timer = setTimeout(() => {
      fetchSchemes();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchSchemes]);

  // Handle Bookmark Toggle
  const handleToggleSave = async (schemeId: string) => {
    const { isSaved } = await toggleSchemeBookmark(schemeId, user?.id);
    setSavedSchemeIds((prev) =>
      isSaved ? [...prev, schemeId] : prev.filter((id) => id !== schemeId)
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedLevel('ALL');
    setSelectedState('ALL');
    setSelectedApplicantType('ALL');
    setSelectedStatus('ALL');
    setSortBy('verified_desc');
    setIsMatchingProfile(false);
  };

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'ALL') count++;
    if (selectedLevel !== 'ALL') count++;
    if (selectedState !== 'ALL') count++;
    if (selectedApplicantType !== 'ALL') count++;
    if (selectedStatus !== 'ALL') count++;
    if (sortBy !== 'verified_desc') count++;
    if (isMatchingProfile) count++;
    return count;
  }, [
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedState,
    selectedApplicantType,
    selectedStatus,
    sortBy,
    isMatchingProfile,
  ]);

  // Map of category ID to category name for cards
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="central">Verified Civic Database</Badge>
            <span className="text-xs text-slate-500 font-medium">
              100% Sourced from Official Gazette & Ministry Portals
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Government Welfare Scheme Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Search and discover verified welfare schemes across Central and State Governments.
            Every record is linked to statutory gazette orders and official application portals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/onboarding">
            <Button variant="primary" size="md" rightIcon={<Sparkles className="w-4 h-4" />}>
              Match with My Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Profile Match Quick Filter Banner (If citizen location exists) */}
      {citizenState && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-civic-emerald shrink-0" />
            <span>
              Profile detected: <strong>{citizenState}</strong>
              {citizenCategory ? ` • Social Category: ${citizenCategory}` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsMatchingProfile(!isMatchingProfile);
              if (!isMatchingProfile) {
                setSelectedState(citizenState);
              } else {
                setSelectedState('ALL');
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all text-xs inline-flex items-center gap-1.5 ${
              isMatchingProfile
                ? 'bg-civic-emerald text-white border-civic-emerald'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isMatchingProfile ? 'Filtered by Profile (Active)' : 'Filter for My State'}</span>
          </button>
        </div>
      )}

      {/* 3. Comprehensive Filter Toolbar */}
      <div className="bg-white border border-civic-border rounded-2xl p-5 shadow-subtle space-y-4">
        {/* Row 1: Search Bar & Sort Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scheme name, keyword (e.g. PM-Kisan, Ayushman, Scholarship), or department..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-civic-emerald focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-1">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              options={[
                { value: 'verified_desc', label: 'Recently Verified' },
                { value: 'benefit_desc', label: 'Highest Benefit (₹)' },
                { value: 'name_asc', label: 'Name: A to Z' },
                { value: 'name_desc', label: 'Name: Z to A' },
              ]}
            />
          </div>
        </div>

        {/* Row 2: Faceted Selectors (Category, Level, State, Applicant Type, Status) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Category */}
          <Select
            label="Beneficiary Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          {/* Government Level */}
          <Select
            label="Government Level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            options={[
              { value: 'ALL', label: 'All Levels' },
              { value: 'CENTRAL', label: 'Central Government' },
              { value: 'STATE', label: 'State Government' },
            ]}
          />

          {/* Applicable State / Region */}
          <Select
            label="Applicable Region"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              if (isMatchingProfile) setIsMatchingProfile(false);
            }}
            options={[
              { value: 'ALL', label: 'All Regions (India)' },
              ...INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s })),
            ]}
          />

          {/* Applicant Type */}
          <Select
            label="Applicant Type"
            value={selectedApplicantType}
            onChange={(e) => setSelectedApplicantType(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Applicant Types' },
              { value: 'STUDENT', label: 'Students & Scholars' },
              { value: 'FARMER', label: 'Farmers & Cultivators' },
              { value: 'WOMAN', label: 'Women & Girls' },
              { value: 'SENIOR_CITIZEN', label: 'Senior Citizens (60+)' },
              { value: 'DISABILITY', label: 'Persons with Disabilities' },
              { value: 'JOB_SEEKER', label: 'Unemployed Youth' },
              { value: 'LOW_INCOME', label: 'Low-Income Households' },
            ]}
          />

          {/* Scheme Status */}
          <Select
            label="Application Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'OPEN', label: 'Open / Always Active' },
              { value: 'UPCOMING', label: 'Upcoming / Pending Intake' },
              { value: 'CLOSED', label: 'Applications Closed' },
            ]}
          />
        </div>

        {/* Active Filter Count & Reset Row */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold text-slate-800">
              Showing {schemes.length} verified schemes
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-semibold text-civic-emerald hover:text-emerald-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSchemes} className="bg-white">
            Try Again
          </Button>
        </div>
      )}

      {/* 5. Loading State (Shimmer Skeleton Cards) */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                <div className="h-6 w-6 bg-slate-200 rounded-lg"></div>
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
              <div className="h-12 w-full bg-slate-100 rounded"></div>
              <div className="h-10 w-full bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Empty State */}
      {!isLoading && !error && schemes.length === 0 && (
        <Card className="border-dashed border-2 border-slate-300 p-10 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Verified Schemes Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We could not find any government schemes matching your current search query or filter combination.
              Try adjusting your search keywords, region, or category.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear All Filters
          </Button>
        </Card>
      )}

      {/* 7. Schemes Grid Layout */}
      {!isLoading && !error && schemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              isSaved={savedSchemeIds.includes(scheme.id)}
              onToggleSave={handleToggleSave}
              categoryName={categoryMap[scheme.category_id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};
