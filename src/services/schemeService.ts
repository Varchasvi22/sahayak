import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';

export type SchemeRow = Database['public']['Tables']['schemes']['Row'];
export type CategoryRow = Database['public']['Tables']['scheme_categories']['Row'];
export type EligibilityRuleRow = Database['public']['Tables']['eligibility_rules']['Row'];
export type SchemeDocumentRow = Database['public']['Tables']['scheme_documents']['Row'];
export type SchemeSourceRow = Database['public']['Tables']['scheme_sources']['Row'];

export interface SchemeFilterOptions {
  level?: 'ALL' | 'CENTRAL' | 'STATE';
  categoryId?: string;
  region?: string;
  applicantType?: string;
  status?: string;
  searchQuery?: string;
  sortBy?: 'verified_desc' | 'name_asc' | 'name_desc' | 'benefit_desc';
}

export interface SchemeDetailData {
  scheme: SchemeRow;
  category: CategoryRow | null;
  rules: EligibilityRuleRow[];
  documents: SchemeDocumentRow[];
  sources: SchemeSourceRow[];
}

/**
 * Fetch schemes with multi-criteria faceted filters and sorting
 */
export async function getSchemes(
  filters?: SchemeFilterOptions
): Promise<{ data: SchemeRow[]; error: Error | null }> {
  // If Supabase is not configured, fall back to verified dataset with identical filter logic
  if (!isSupabaseConfigured) {
    let result: SchemeRow[] = VERIFIED_SCHEMES.map((s) => ({
      id: s.id,
      slug: s.slug,
      official_name: s.official_name,
      short_title: s.short_title,
      description: s.brief_description,
      benefits: s.detailed_benefits,
      financial_benefit_amount: s.financial_benefit_amount ?? null,
      government_level: s.government_level,
      applicable_region: s.state_or_ut ?? null,
      category_id: s.beneficiary_category,
      department_name: s.department_name,
      official_application_url: s.official_application_url,
      official_portal_name: s.official_portal_name,
      status: s.application_status,
      academic_or_financial_year: s.academic_or_financial_year,
      is_active: s.is_active,
      last_verified_at: s.last_verified_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (filters?.level && filters.level !== 'ALL') {
      result = result.filter((s) => s.government_level === filters.level);
    }
    if (filters?.categoryId && filters.categoryId !== 'ALL') {
      result = result.filter((s) => s.category_id === filters.categoryId);
    }
    if (filters?.region && filters.region !== 'ALL') {
      result = result.filter((s) => !s.applicable_region || s.applicable_region === filters.region);
    }
    if (filters?.status && filters.status !== 'ALL') {
      if (filters.status === 'OPEN') {
        result = result.filter((s) => s.status === 'OPEN' || s.status === 'ALWAYS_ACTIVE');
      } else {
        result = result.filter((s) => s.status === filters.status);
      }
    }
    if (filters?.applicantType && filters.applicantType !== 'ALL') {
      const typeMap: Record<string, string> = {
        STUDENT: 'STUDENTS',
        FARMER: 'FARMERS',
        WOMAN: 'WOMEN',
        SENIOR_CITIZEN: 'SENIOR_CITIZENS',
        DISABILITY: 'PERSONS_WITH_DISABILITIES',
        JOB_SEEKER: 'EMPLOYMENT_SEEKERS',
        LOW_INCOME: 'LOW_INCOME',
      };
      const cat = typeMap[filters.applicantType];
      if (cat) {
        result = result.filter((s) => s.category_id === cat);
      }
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.official_name.toLowerCase().includes(q) ||
          s.short_title.toLowerCase().includes(q) ||
          s.department_name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Sort offline fallback
    if (filters?.sortBy === 'name_asc') {
      result.sort((a, b) => a.official_name.localeCompare(b.official_name));
    } else if (filters?.sortBy === 'name_desc') {
      result.sort((a, b) => b.official_name.localeCompare(a.official_name));
    } else if (filters?.sortBy === 'benefit_desc') {
      result.sort((a, b) => (b.financial_benefit_amount || 0) - (a.financial_benefit_amount || 0));
    } else {
      // verified_desc (default)
      result.sort((a, b) => b.last_verified_at.localeCompare(a.last_verified_at));
    }

    return { data: result, error: null };
  }

  try {
    let query = supabase.from('schemes').select('*').eq('is_active', true);

    // Filter: Government Level
    if (filters?.level && filters.level !== 'ALL') {
      query = query.eq('government_level', filters.level);
    }

    // Filter: Beneficiary Category
    if (filters?.categoryId && filters.categoryId !== 'ALL') {
      query = query.eq('category_id', filters.categoryId);
    }

    // Filter: Applicable Region (State or All-India)
    if (filters?.region && filters.region !== 'ALL') {
      // If filtering by a specific state e.g. 'Karnataka', include Karnataka-specific schemes as well as Central schemes (applicable_region is null)
      query = query.or(`applicable_region.is.null,applicable_region.eq.${filters.region}`);
    }

    // Filter: Status
    if (filters?.status && filters.status !== 'ALL') {
      if (filters.status === 'OPEN') {
        query = query.in('status', ['OPEN', 'ALWAYS_ACTIVE']);
      } else {
        query = query.eq('status', filters.status as any);
      }
    }

    // Filter: Applicant Type
    if (filters?.applicantType && filters.applicantType !== 'ALL') {
      const typeMap: Record<string, string> = {
        STUDENT: 'STUDENTS',
        FARMER: 'FARMERS',
        WOMAN: 'WOMEN',
        SENIOR_CITIZEN: 'SENIOR_CITIZENS',
        DISABILITY: 'PERSONS_WITH_DISABILITIES',
        JOB_SEEKER: 'EMPLOYMENT_SEEKERS',
        LOW_INCOME: 'LOW_INCOME',
      };
      const cat = typeMap[filters.applicantType];
      if (cat) {
        query = query.eq('category_id', cat);
      }
    }

    // Filter: Full-text Search
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim();
      query = query.or(
        `official_name.ilike.%${q}%,short_title.ilike.%${q}%,department_name.ilike.%${q}%,description.ilike.%${q}%`
      );
    }

    // Sorting
    if (filters?.sortBy === 'name_asc') {
      query = query.order('official_name', { ascending: true });
    } else if (filters?.sortBy === 'name_desc') {
      query = query.order('official_name', { ascending: false });
    } else if (filters?.sortBy === 'benefit_desc') {
      query = query.order('financial_benefit_amount', { ascending: false, nullsFirst: false });
    } else {
      // Default: Last verified first
      query = query.order('last_verified_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('Error in getSchemes:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Fetch a single scheme by its URL slug along with all rules, documents, and sources
 */
export async function getSchemeDetail(
  slug: string
): Promise<{ data: SchemeDetailData | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    const s = VERIFIED_SCHEMES.find((item) => item.slug === slug) || VERIFIED_SCHEMES[0];
    const mockScheme: SchemeRow = {
      id: s.id,
      slug: s.slug,
      official_name: s.official_name,
      short_title: s.short_title,
      description: s.brief_description,
      benefits: s.detailed_benefits,
      financial_benefit_amount: s.financial_benefit_amount ?? null,
      government_level: s.government_level,
      applicable_region: s.state_or_ut ?? null,
      category_id: s.beneficiary_category,
      department_name: s.department_name,
      official_application_url: s.official_application_url,
      official_portal_name: s.official_portal_name,
      status: s.application_status,
      academic_or_financial_year: s.academic_or_financial_year,
      is_active: s.is_active,
      last_verified_at: s.last_verified_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockRules: EligibilityRuleRow[] = s.eligibility_rules.conditions.map((rawC, i) => {
      const c = rawC as import('@/types/scheme.types').ConditionRule;
      return {
        id: `rule-${i + 1}`,
        scheme_id: s.id,
        field: c.field,
        operator: c.operator as any,
        expected_value: c.value as any,
        rule_group: 'default',
        logical_relationship: 'AND',
        label: c.label,
        is_mandatory: true,
        created_at: new Date().toISOString(),
      };
    });

    const mockDocs: SchemeDocumentRow[] = s.required_document_keys.map((key) => {
      const uDoc = UNIVERSAL_DOCUMENTS.find((d) => d.canonical_key === key);
      return {
        id: `doc-${key}`,
        scheme_id: s.id,
        canonical_key: key,
        document_name: uDoc?.title || key,
        is_mandatory: true,
        additional_instructions: null,
        issuing_authority: uDoc?.issuing_authority || 'Competent Authority',
        validity_period: uDoc?.validity_period || 'Perpetual',
        how_to_obtain_url: uDoc?.how_to_obtain_url || null,
        approx_days_to_issue: uDoc?.approx_days_to_issue || 7,
        created_at: new Date().toISOString(),
      };
    });

    const mockSources: SchemeSourceRow[] = [
      {
        id: 'source-1',
        scheme_id: s.id,
        official_source_url: s.official_source_url,
        source_type: 'GAZETTE',
        last_checked_date: s.last_verified_at,
        notes: 'Verified via Central Ministry / State Gazette notification',
        created_at: new Date().toISOString(),
      },
    ];

    return {
      data: {
        scheme: mockScheme,
        category: {
          id: s.beneficiary_category,
          name: s.beneficiary_category,
          description: null,
          icon_name: 'FileCheck',
          display_order: 1,
          created_at: '',
        },
        rules: mockRules,
        documents: mockDocs,
        sources: mockSources,
      },
      error: null,
    };
  }

  try {
    // 1. Fetch scheme record
    const { data: scheme, error: schemeErr } = await supabase
      .from('schemes')
      .select('*, scheme_categories(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (schemeErr) throw schemeErr;
    if (!scheme) return { data: null, error: new Error('Scheme not found') };

    const schemeCategory = (scheme as any).scheme_categories as CategoryRow | null;

    // 2. Fetch associated rules, documents, and official sources in parallel
    const [rulesRes, docsRes, sourcesRes] = await Promise.all([
      supabase.from('eligibility_rules').select('*').eq('scheme_id', scheme.id),
      supabase.from('scheme_documents').select('*').eq('scheme_id', scheme.id),
      supabase.from('scheme_sources').select('*').eq('scheme_id', scheme.id),
    ]);

    if (rulesRes.error) console.warn('Could not fetch eligibility rules:', rulesRes.error.message);
    if (docsRes.error) console.warn('Could not fetch scheme documents:', docsRes.error.message);
    if (sourcesRes.error) console.warn('Could not fetch scheme sources:', sourcesRes.error.message);

    return {
      data: {
        scheme,
        category: schemeCategory,
        rules: rulesRes.data || [],
        documents: docsRes.data || [],
        sources: sourcesRes.data || [],
      },
      error: null,
    };
  } catch (err: any) {
    console.error('Error in getSchemeDetail:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Fetch scheme categories for faceted filtering
 */
export async function getSchemeCategories(): Promise<{ data: CategoryRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: [
        { id: 'STUDENTS', name: 'Students & Scholarships', description: null, icon_name: 'GraduationCap', display_order: 1, created_at: '' },
        { id: 'FARMERS', name: 'Farmers & Agriculture', description: null, icon_name: 'Tractor', display_order: 2, created_at: '' },
        { id: 'WOMEN', name: 'Women & Entrepreneurs', description: null, icon_name: 'HeartHandshake', display_order: 3, created_at: '' },
        { id: 'SENIOR_CITIZENS', name: 'Senior Citizens & Pensions', description: null, icon_name: 'Users2', display_order: 4, created_at: '' },
        { id: 'LOW_INCOME', name: 'Low-Income Households', description: null, icon_name: 'Home', display_order: 5, created_at: '' },
        { id: 'PERSONS_WITH_DISABILITIES', name: 'Divyangjan / Differently Abled', description: null, icon_name: 'Accessibility', display_order: 6, created_at: '' },
        { id: 'EMPLOYMENT_SEEKERS', name: 'Unemployed Youth & Skilling', description: null, icon_name: 'Briefcase', display_order: 7, created_at: '' },
        { id: 'HEALTHCARE', name: 'Healthcare & Medical Assistance', description: null, icon_name: 'HeartPulse', display_order: 8, created_at: '' },
      ],
      error: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from('scheme_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('Error in getSchemeCategories:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Fetch deterministic rules associated with a scheme
 */
export async function getSchemeEligibilityRules(
  schemeId: string
): Promise<{ data: EligibilityRuleRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('eligibility_rules')
      .select('*')
      .eq('scheme_id', schemeId);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('Error in getSchemeEligibilityRules:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Fetch required documents associated with a scheme
 */
export async function getSchemeRequiredDocuments(
  schemeId: string
): Promise<{ data: SchemeDocumentRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('scheme_documents')
      .select('*')
      .eq('scheme_id', schemeId);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('Error in getSchemeRequiredDocuments:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Fetch official sources and citations for a scheme
 */
export async function getSchemeSources(
  schemeId: string
): Promise<{ data: SchemeSourceRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('scheme_sources')
      .select('*')
      .eq('scheme_id', schemeId);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('Error in getSchemeSources:', err.message);
    return { data: [], error: err };
  }
}
