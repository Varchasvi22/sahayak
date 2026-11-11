import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';

export type SchemeRow = Database['public']['Tables']['schemes']['Row'];
export type CategoryRow = Database['public']['Tables']['scheme_categories']['Row'];
export type EligibilityRuleRow = Database['public']['Tables']['eligibility_rules']['Row'];
export type SchemeDocumentRow = Database['public']['Tables']['scheme_documents']['Row'];
export type SchemeSourceRow = Database['public']['Tables']['scheme_sources']['Row'];

export interface SchemeFilterOptions {
  level?: 'ALL' | 'CENTRAL' | 'STATE';
  categoryId?: string;
  region?: string;
  searchQuery?: string;
}

/**
 * Fetch active schemes with optional faceted filters
 */
export async function getSchemes(
  filters?: SchemeFilterOptions
): Promise<{ data: SchemeRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    // Graceful offline fallback using verified dataset
    let result = VERIFIED_SCHEMES.map((s) => ({
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
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.official_name.toLowerCase().includes(q) ||
          s.short_title.toLowerCase().includes(q) ||
          s.department_name.toLowerCase().includes(q)
      );
    }

    return { data: result, error: null };
  }

  try {
    let query = supabase
      .from('schemes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.level && filters.level !== 'ALL') {
      query = query.eq('government_level', filters.level);
    }
    if (filters?.categoryId && filters.categoryId !== 'ALL') {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.region && filters.region !== 'ALL') {
      query = query.or(`applicable_region.is.null,applicable_region.eq.${filters.region}`);
    }
    if (filters?.searchQuery) {
      query = query.ilike('official_name', `%${filters.searchQuery}%`);
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
 * Fetch a single scheme by its unique URL slug
 */
export async function getSchemeBySlug(
  slug: string
): Promise<{ data: SchemeRow | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    const s = VERIFIED_SCHEMES.find((item) => item.slug === slug) || VERIFIED_SCHEMES[0];
    return {
      data: {
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
      },
      error: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in getSchemeBySlug:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Fetch scheme categories for filtering
 */
export async function getSchemeCategories(): Promise<{ data: CategoryRow[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: [
        { id: 'STUDENTS', name: 'Students & Scholarships', description: null, icon_name: 'GraduationCap', display_order: 1, created_at: '' },
        { id: 'FARMERS', name: 'Farmers & Agriculture', description: null, icon_name: 'Tractor', display_order: 2, created_at: '' },
        { id: 'WOMEN', name: 'Women & Entrepreneurs', description: null, icon_name: 'HeartHandshake', display_order: 3, created_at: '' },
        { id: 'SENIOR_CITIZENS', name: 'Senior Citizens & Pensions', description: null, icon_name: 'Users2', display_order: 4, created_at: '' },
        { id: 'HEALTHCARE', name: 'Healthcare & Medical Assistance', description: null, icon_name: 'HeartPulse', display_order: 5, created_at: '' },
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
