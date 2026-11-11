import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { OnboardingFormData } from '@/features/onboarding/schema';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const LOCAL_ONBOARDING_KEY = 'sahayak_onboarding_draft';

/**
 * Fetch a citizen's profile by their auth UUID
 */
export async function getProfile(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    const local = getLocalOnboarding();
    if (local) {
      return {
        data: {
          id: userId,
          full_name: local.fullName,
          date_of_birth: local.dateOfBirth || null,
          age: local.age,
          gender: local.gender,
          state_of_residence: local.stateOfResidence,
          district: local.district,
          residence_area: local.residenceArea,
          annual_family_income: local.annualFamilyIncome,
          social_category: local.socialCategory,
          employment_status: local.employmentStatus,
          occupation: local.employmentStatus,
          education_level: local.educationLevel,
          is_student: local.isStudent,
          is_differently_abled: local.isDifferentlyAbled,
          disability_percentage: local.disabilityPercentage ?? null,
          has_bpl_card: local.hasBplCard,
          owns_agricultural_land: local.ownsAgriculturalLand,
          additional_attributes: {
            beneficiary_categories: local.beneficiaryCategories,
            has_udid_card: local.hasUdidCard,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in getProfile:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Upsert demographic attributes to Supabase profiles
 */
export async function upsertProfile(
  userId: string,
  formData: OnboardingFormData
): Promise<{ data: Profile | null; error: Error | null }> {
  // Always persist to local cache as immediate backup
  saveLocalOnboarding(formData);

  if (!isSupabaseConfigured) {
    return {
      data: {
        id: userId,
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth || null,
        age: formData.age,
        gender: formData.gender,
        state_of_residence: formData.stateOfResidence,
        district: formData.district,
        residence_area: formData.residenceArea,
        annual_family_income: formData.annualFamilyIncome,
        social_category: formData.socialCategory,
        employment_status: formData.employmentStatus,
        occupation: formData.employmentStatus,
        education_level: formData.educationLevel,
        is_student: formData.isStudent,
        is_differently_abled: formData.isDifferentlyAbled,
        disability_percentage: formData.disabilityPercentage ?? null,
        has_bpl_card: formData.hasBplCard,
        owns_agricultural_land: formData.ownsAgriculturalLand,
        additional_attributes: {
          beneficiary_categories: formData.beneficiaryCategories,
          has_udid_card: formData.hasUdidCard,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    };
  }

  try {
    const profilePayload: ProfileInsert = {
      id: userId,
      full_name: formData.fullName,
      date_of_birth: formData.dateOfBirth || null,
      age: formData.age,
      gender: formData.gender,
      state_of_residence: formData.stateOfResidence,
      district: formData.district,
      residence_area: formData.residenceArea,
      annual_family_income: formData.annualFamilyIncome,
      social_category: formData.socialCategory,
      employment_status: formData.employmentStatus,
      occupation: formData.employmentStatus,
      education_level: formData.educationLevel,
      is_student: formData.isStudent,
      is_differently_abled: formData.isDifferentlyAbled,
      disability_percentage: formData.disabilityPercentage ?? null,
      has_bpl_card: formData.hasBplCard,
      owns_agricultural_land: formData.ownsAgriculturalLand,
      additional_attributes: {
        beneficiary_categories: formData.beneficiaryCategories,
        has_udid_card: formData.hasUdidCard,
      },
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in upsertProfile:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Update demographic attributes on a citizen's profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error in updateProfile:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Local draft storage utilities
 */
export function saveLocalOnboarding(data: OnboardingFormData): void {
  try {
    localStorage.setItem(LOCAL_ONBOARDING_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save onboarding to localStorage:', err);
  }
}

export function getLocalOnboarding(): OnboardingFormData | null {
  try {
    const raw = localStorage.getItem(LOCAL_ONBOARDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingFormData;
  } catch {
    return null;
  }
}

export function clearLocalOnboarding(): void {
  try {
    localStorage.removeItem(LOCAL_ONBOARDING_KEY);
  } catch {}
}
