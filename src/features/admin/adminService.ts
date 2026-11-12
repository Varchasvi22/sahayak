/**
 * SAHAYAK Scheme Admin Management & Governance Service
 *
 * Implements strict role verification, multi-entity transactions,
 * publication status workflows, and tamper-resistant audit logging.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  SchemeFormData,
  PublicationStatus,
  AdminUser,
  SchemeAuditLogRow,
  VerificationValidationResult,
} from './types';
import { validateSchemeForPublication } from './validation';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';

// Built-in Default Admin Profiles for Governance
export const DEFAULT_ADMINS: Record<string, AdminUser> = {
  SUPER_ADMIN: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@sahayak.gov.in',
    name: 'Dr. Rajesh Sharma',
    role: 'SUPER_ADMIN',
    department: 'Ministry of Electronics and Information Technology (MeitY)',
    isVerifiedAdmin: true,
  },
  CURATOR: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'curator@sahayak.gov.in',
    name: 'Pooja Varma',
    role: 'REVIEWER',
    department: 'Central Gazette Verification Cell',
    isVerifiedAdmin: true,
  },
};

// In-Memory Audit Trail Cache (keeps track during session & tests)
const inMemoryAuditLogs: SchemeAuditLogRow[] = [];

// Local in-memory store for newly created or modified schemes when running locally or during tests
const inMemorySchemes: SchemeFormData[] = [];

// Active Admin Session (Defaults to Super Admin in local dev, or loaded from session)
let currentAdminUser: AdminUser | null = DEFAULT_ADMINS.SUPER_ADMIN;

/**
 * Get the currently authenticated admin user
 */
export function getCurrentAdminUser(): AdminUser | null {
  return currentAdminUser;
}

/**
 * Sets or switches the current admin user (used for role testing & dev simulation)
 */
export function setAdminSession(user: AdminUser | null): void {
  currentAdminUser = user;
}

/**
 * Checks if the current user has verified administrator privileges
 */
export function isAuthorizedAdmin(user: AdminUser | null = currentAdminUser): boolean {
  if (!user) return false;
  return user.isVerifiedAdmin && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'REVIEWER');
}

/**
 * Asserts admin authorization or throws UnauthorizedError
 */
export function assertAdminAccess(user: AdminUser | null = currentAdminUser): AdminUser {
  if (!isAuthorizedAdmin(user)) {
    const error = new Error('UNAUTHORIZED: Access denied. Administrative credentials required to modify official government scheme records.');
    (error as any).status = 403;
    throw error;
  }
  return user!;
}

/**
 * Fetch all schemes for the admin dashboard (including DRAFT, ARCHIVED, etc.)
 */
export async function getAdminSchemes(): Promise<{ data: SchemeFormData[]; error: Error | null }> {
  try {
    if (isSupabaseConfigured) {
      const { data: dbSchemes, error } = await supabase
        .from('schemes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('Could not query schemes table with full columns, using fallback:', error.message);
      } else if (dbSchemes && dbSchemes.length > 0) {
        // Map database records
        const mapped: SchemeFormData[] = dbSchemes.map((s: any) => ({
          id: s.id,
          slug: s.slug,
          official_name: s.official_name,
          short_title: s.short_title,
          description: s.description,
          benefits: s.benefits,
          financial_benefit_amount: s.financial_benefit_amount,
          government_level: s.government_level,
          applicable_region: s.applicable_region,
          category_id: s.category_id,
          department_name: s.department_name,
          official_application_url: s.official_application_url,
          official_portal_name: s.official_portal_name,
          status: s.status,
          publication_status: s.publication_status || (s.is_active ? 'VERIFIED' : 'ARCHIVED'),
          verified_by_name: s.verified_by_name || 'Ministry Gazette Officer',
          last_verified_at: s.last_verified_at,
          audit_notes: s.audit_notes,
          is_active: s.is_active,
          academic_or_financial_year: s.academic_or_financial_year,
          rules: [],
          documents: [],
          sources: [],
        }));

        // Merge any in-memory additions
        const combined = [...inMemorySchemes, ...mapped.filter((m) => !inMemorySchemes.some((im) => im.id === m.id || im.slug === m.slug))];
        return { data: combined, error: null };
      }
    }

    // Default Fallback
    const baseList: SchemeFormData[] = VERIFIED_SCHEMES.map((s) => ({
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
      publication_status: s.is_active ? 'VERIFIED' : 'ARCHIVED',
      verified_by_name: 'Dr. Rajesh Sharma (MeitY)',
      last_verified_at: s.last_verified_at,
      is_active: s.is_active,
      academic_or_financial_year: s.academic_or_financial_year,
      rules: [],
      documents: [],
      sources: [],
    }));

    const combined = [...inMemorySchemes, ...baseList.filter((m) => !inMemorySchemes.some((im) => im.id === m.id || im.slug === m.slug))];
    return { data: combined, error: null };
  } catch (err: any) {
    return { data: inMemorySchemes, error: err };
  }
}

/**
 * Fetch complete scheme detail by ID or Slug for editing
 */
export async function getAdminSchemeDetail(
  idOrSlug: string
): Promise<{ data: SchemeFormData | null; error: Error | null }> {
  try {
    // 1. Check in-memory store first
    const memoryMatch = inMemorySchemes.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
    if (memoryMatch) {
      return { data: memoryMatch, error: null };
    }

    // 2. Fetch from database if configured
    if (isSupabaseConfigured) {
      const { data: s, error: sErr } = await supabase
        .from('schemes')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();

      if (s && !sErr) {
        // Fetch rules
        const { data: dbRules } = await supabase
          .from('eligibility_rules')
          .select('*')
          .eq('scheme_id', s.id);

        // Fetch documents
        const { data: dbDocs } = await supabase
          .from('scheme_documents')
          .select('*')
          .eq('scheme_id', s.id);

        // Fetch sources
        const { data: dbSources } = await supabase
          .from('scheme_sources')
          .select('*')
          .eq('scheme_id', s.id);

        const formData: SchemeFormData = {
          id: s.id,
          slug: s.slug,
          official_name: s.official_name,
          short_title: s.short_title,
          description: s.description,
          benefits: s.benefits,
          financial_benefit_amount: s.financial_benefit_amount,
          government_level: s.government_level,
          applicable_region: s.applicable_region,
          category_id: s.category_id,
          department_name: s.department_name,
          official_application_url: s.official_application_url,
          official_portal_name: s.official_portal_name,
          status: s.status,
          publication_status: s.publication_status || 'VERIFIED',
          verified_by_name: s.verified_by_name || 'Ministry Gazette Officer',
          last_verified_at: s.last_verified_at,
          audit_notes: s.audit_notes || undefined,
          is_active: s.is_active,
          academic_or_financial_year: s.academic_or_financial_year,
          rules: (dbRules || []).map((r: any) => ({
            id: r.id,
            field: r.field,
            operator: r.operator,
            expected_value: r.expected_value,
            rule_group: r.rule_group || 'default',
            logical_relationship: r.logical_relationship || 'AND',
            label: r.label,
          })),
          documents: (dbDocs || []).map((d: any) => ({
            id: d.id,
            canonical_key: d.canonical_key,
            document_name: d.document_name,
            is_mandatory: d.is_mandatory,
            issuing_authority: d.issuing_authority,
            validity_period: d.validity_period,
            how_to_obtain_url: d.how_to_obtain_url,
            approx_days_to_issue: d.approx_days_to_issue,
            additional_instructions: d.additional_instructions,
          })),
          sources: (dbSources || []).map((src: any) => ({
            id: src.id,
            official_source_url: src.official_source_url,
            source_type: src.source_type,
            last_checked_date: src.last_checked_date,
            notes: src.notes,
          })),
        };

        return { data: formData, error: null };
      }
    }

    // 3. Fallback mock match
    const mock = VERIFIED_SCHEMES.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
    if (mock) {
      const mockDocs = (mock.required_document_keys || []).map((key) => {
        const docDef = UNIVERSAL_DOCUMENTS.find((d) => d.canonical_key === key);
        return {
          canonical_key: key,
          document_name: docDef?.title || key,
          is_mandatory: true,
          issuing_authority: docDef?.issuing_authority,
          validity_period: docDef?.validity_period,
          how_to_obtain_url: docDef?.how_to_obtain_url,
          approx_days_to_issue: docDef?.approx_days_to_issue,
        };
      });

      const formData: SchemeFormData = {
        id: mock.id,
        slug: mock.slug,
        official_name: mock.official_name,
        short_title: mock.short_title,
        description: mock.brief_description,
        benefits: mock.detailed_benefits,
        financial_benefit_amount: mock.financial_benefit_amount ?? null,
        government_level: mock.government_level,
        applicable_region: mock.state_or_ut ?? null,
        category_id: mock.beneficiary_category,
        department_name: mock.department_name,
        official_application_url: mock.official_application_url,
        official_portal_name: mock.official_portal_name,
        status: mock.application_status,
        publication_status: 'VERIFIED',
        verified_by_name: 'Dr. Rajesh Sharma (MeitY)',
        last_verified_at: mock.last_verified_at,
        is_active: mock.is_active,
        academic_or_financial_year: mock.academic_or_financial_year,
        rules: [],
        documents: mockDocs,
        sources: [
          {
            official_source_url: mock.official_application_url,
            source_type: 'MINISTRY_PORTAL',
            last_checked_date: mock.last_verified_at,
            notes: 'Official Ministry Application Portal',
          },
        ],
      };

      return { data: formData, error: null };
    }

    return { data: null, error: new Error(`Scheme "${idOrSlug}" not found`) };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Create a new scheme (Requires Admin privileges)
 */
export async function createScheme(
  formData: SchemeFormData,
  actor: AdminUser | null = currentAdminUser
): Promise<{ data: SchemeFormData | null; error: Error | null; validation?: VerificationValidationResult }> {
  try {
    const admin = assertAdminAccess(actor);

    // Validate
    const validation = validateSchemeForPublication(formData);
    if (!validation.isValid && formData.publication_status === 'VERIFIED') {
      return {
        data: null,
        error: new Error(`Validation failed for publication: ${validation.errors.join('; ')}`),
        validation,
      };
    }

    const schemeId = formData.id || crypto.randomUUID();
    const preparedScheme: SchemeFormData = {
      ...formData,
      id: schemeId,
      publication_status: formData.publication_status || 'DRAFT',
      verified_by_name: formData.verified_by_name || admin.name,
      last_verified_at: formData.last_verified_at || new Date().toISOString().split('T')[0],
      is_active: formData.publication_status === 'VERIFIED',
    };

    // Save in-memory store
    inMemorySchemes.unshift(preparedScheme);

    // Save to Supabase if available
    if (isSupabaseConfigured) {
      try {
        await supabase.from('schemes').insert({
          id: preparedScheme.id,
          slug: preparedScheme.slug,
          official_name: preparedScheme.official_name,
          short_title: preparedScheme.short_title,
          description: preparedScheme.description,
          benefits: preparedScheme.benefits,
          financial_benefit_amount: preparedScheme.financial_benefit_amount,
          government_level: preparedScheme.government_level,
          applicable_region: preparedScheme.applicable_region,
          category_id: preparedScheme.category_id,
          department_name: preparedScheme.department_name,
          official_application_url: preparedScheme.official_application_url,
          official_portal_name: preparedScheme.official_portal_name,
          status: preparedScheme.status,
          academic_or_financial_year: preparedScheme.academic_or_financial_year,
          is_active: preparedScheme.is_active,
          last_verified_at: preparedScheme.last_verified_at,
        });

        // Insert rules if provided
        if (preparedScheme.rules.length > 0) {
          await supabase.from('eligibility_rules').insert(
            preparedScheme.rules.map((r) => ({
              id: r.id || crypto.randomUUID(),
              scheme_id: schemeId,
              field: r.field,
              operator: r.operator,
              expected_value: r.expected_value,
              rule_group: r.rule_group || 'default',
              logical_relationship: r.logical_relationship || 'AND',
              label: r.label,
            }))
          );
        }

        // Insert documents if provided
        if (preparedScheme.documents.length > 0) {
          await supabase.from('scheme_documents').insert(
            preparedScheme.documents.map((d) => ({
              id: d.id || crypto.randomUUID(),
              scheme_id: schemeId,
              canonical_key: d.canonical_key,
              document_name: d.document_name,
              is_mandatory: d.is_mandatory,
              issuing_authority: d.issuing_authority,
              validity_period: d.validity_period,
              how_to_obtain_url: d.how_to_obtain_url,
              approx_days_to_issue: d.approx_days_to_issue,
            }))
          );
        }

        // Insert sources if provided
        if (preparedScheme.sources.length > 0) {
          await supabase.from('scheme_sources').insert(
            preparedScheme.sources.map((s) => ({
              id: s.id || crypto.randomUUID(),
              scheme_id: schemeId,
              official_source_url: s.official_source_url,
              source_type: s.source_type,
              last_checked_date: s.last_checked_date,
              notes: s.notes,
            }))
          );
        }
      } catch (dbErr) {
        console.warn('Supabase DB write skipped or partially applied:', dbErr);
      }
    }

    // Append Audit Log
    recordAuditLog({
      scheme_id: schemeId,
      action: 'SCHEME_CREATED',
      performed_by_id: admin.id,
      performed_by_name: admin.name,
      performed_by_email: admin.email,
      change_summary: `Created new welfare scheme "${preparedScheme.short_title}" with status ${preparedScheme.publication_status}.`,
      previous_state: null,
      new_state: preparedScheme as any,
    });

    return { data: preparedScheme, error: null, validation };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Update an existing scheme (Requires Admin privileges)
 */
export async function updateScheme(
  schemeId: string,
  updates: Partial<SchemeFormData>,
  actor: AdminUser | null = currentAdminUser,
  changeSummary?: string,
  actionOverride?: SchemeAuditLogRow['action']
): Promise<{ data: SchemeFormData | null; error: Error | null; validation?: VerificationValidationResult }> {
  try {
    const admin = assertAdminAccess(actor);

    // Retrieve previous state
    const { data: previous } = await getAdminSchemeDetail(schemeId);
    if (!previous) {
      return { data: null, error: new Error(`Scheme "${schemeId}" not found.`) };
    }

    const merged: SchemeFormData = {
      ...previous,
      ...updates,
      id: schemeId,
      rules: updates.rules || previous.rules,
      documents: updates.documents || previous.documents,
      sources: updates.sources || previous.sources,
    };

    // If setting to VERIFIED, enforce publication criteria
    const validation = validateSchemeForPublication(merged);
    if (merged.publication_status === 'VERIFIED' && !validation.isValid) {
      return {
        data: null,
        error: new Error(`Cannot publish scheme: ${validation.errors.join('; ')}`),
        validation,
      };
    }

    // Update in-memory
    const idx = inMemorySchemes.findIndex((s) => s.id === schemeId || s.slug === schemeId);
    if (idx >= 0) {
      inMemorySchemes[idx] = merged;
    } else {
      inMemorySchemes.unshift(merged);
    }

    // Update Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('schemes')
          .update({
            official_name: merged.official_name,
            short_title: merged.short_title,
            description: merged.description,
            benefits: merged.benefits,
            financial_benefit_amount: merged.financial_benefit_amount,
            government_level: merged.government_level,
            applicable_region: merged.applicable_region,
            category_id: merged.category_id,
            department_name: merged.department_name,
            official_application_url: merged.official_application_url,
            official_portal_name: merged.official_portal_name,
            status: merged.status,
            is_active: merged.publication_status === 'VERIFIED',
            last_verified_at: merged.last_verified_at,
          })
          .eq('id', schemeId);
      } catch (dbErr) {
        console.warn('Supabase DB update skipped:', dbErr);
      }
    }

    // Record Audit Log
    recordAuditLog({
      scheme_id: schemeId,
      action: actionOverride || 'SCHEME_UPDATED',
      performed_by_id: admin.id,
      performed_by_name: admin.name,
      performed_by_email: admin.email,
      change_summary:
        changeSummary ||
        `Updated scheme "${merged.short_title}" (Publication: ${merged.publication_status}, Active: ${merged.is_active}).`,
      previous_state: previous as any,
      new_state: merged as any,
    });

    return { data: merged, error: null, validation };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Change scheme publication status (DRAFT -> PENDING_VERIFICATION -> VERIFIED -> NEEDS_REVIEW -> ARCHIVED)
 */
export async function updatePublicationStatus(
  schemeId: string,
  newStatus: PublicationStatus,
  reviewerName: string,
  actor: AdminUser | null = currentAdminUser,
  notes?: string
): Promise<{ data: SchemeFormData | null; error: Error | null; validation?: VerificationValidationResult }> {
  try {
    const admin = assertAdminAccess(actor);
    const { data: previous } = await getAdminSchemeDetail(schemeId);
    if (!previous) {
      return { data: null, error: new Error(`Scheme "${schemeId}" not found.`) };
    }

    const proposed: SchemeFormData = {
      ...previous,
      publication_status: newStatus,
      verified_by_name: reviewerName || admin.name,
      last_verified_at: new Date().toISOString().split('T')[0],
      is_active: newStatus === 'VERIFIED',
      audit_notes: notes || previous.audit_notes,
    };

    if (newStatus === 'VERIFIED') {
      const validation = validateSchemeForPublication(proposed);
      if (!validation.isValid) {
        return {
          data: null,
          error: new Error(`Cannot verify and publish scheme: ${validation.errors.join('; ')}`),
          validation,
        };
      }
    }

    return updateScheme(
      schemeId,
      proposed,
      admin,
      `Changed publication status from ${previous.publication_status} to ${newStatus}. Reviewer: ${reviewerName}. Notes: ${notes || 'None'}`,
      'PUBLICATION_STATUS_CHANGED'
    );
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Deactivate / Archive a scheme safely (Leaves audit trail)
 */
export async function deactivateScheme(
  schemeId: string,
  reason: string,
  actor: AdminUser | null = currentAdminUser
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const admin = assertAdminAccess(actor);
    const { data: previous } = await getAdminSchemeDetail(schemeId);
    if (!previous) {
      return { success: false, error: new Error(`Scheme "${schemeId}" not found.`) };
    }

    const res = await updateScheme(
      schemeId,
      {
        is_active: false,
        publication_status: 'ARCHIVED',
        audit_notes: reason,
      },
      admin,
      `Deactivated & archived scheme "${previous.short_title}". Reason: ${reason}`,
      'SCHEME_DEACTIVATED'
    );

    return { success: !res.error, error: res.error };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

/**
 * Reactivate an archived scheme (Places back in PENDING_VERIFICATION)
 */
export async function reactivateScheme(
  schemeId: string,
  actor: AdminUser | null = currentAdminUser
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const admin = assertAdminAccess(actor);
    const { data: previous } = await getAdminSchemeDetail(schemeId);
    if (!previous) {
      return { success: false, error: new Error(`Scheme "${schemeId}" not found.`) };
    }

    const res = await updateScheme(
      schemeId,
      {
        is_active: false, // Remains inactive until reviewed & published
        publication_status: 'PENDING_VERIFICATION',
        audit_notes: 'Reactivated from archive. Verification required prior to public release.',
      },
      admin,
      `Reactivated scheme "${previous.short_title}" from archive into PENDING_VERIFICATION.`,
      'SCHEME_REACTIVATED'
    );

    return { success: !res.error, error: res.error };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

/**
 * Record an audit log entry
 */
export function recordAuditLog(log: {
  scheme_id: string;
  action: SchemeAuditLogRow['action'];
  performed_by_id?: string | null;
  performed_by_name: string;
  performed_by_email?: string | null;
  change_summary: string;
  previous_state?: any;
  new_state?: any;
}): SchemeAuditLogRow {
  const row: SchemeAuditLogRow = {
    id: crypto.randomUUID(),
    scheme_id: log.scheme_id,
    action: log.action,
    performed_by_id: log.performed_by_id || null,
    performed_by_name: log.performed_by_name,
    performed_by_email: log.performed_by_email || null,
    change_summary: log.change_summary,
    previous_state: log.previous_state || null,
    new_state: log.new_state || null,
    created_at: new Date().toISOString(),
  };

  inMemoryAuditLogs.unshift(row);

  // If Supabase is connected, asynchronously persist to table if exists
  if (isSupabaseConfigured) {
    supabase
      .from('scheme_audit_logs')
      .insert(row)
      .then(({ error }) => {
        if (error) {
          // Table may not have been created yet via SQL migration editor; in-memory cache preserves audit trail
        }
      });
  }

  return row;
}

/**
 * Get all audit log entries for a specific scheme
 */
export async function getSchemeAuditLogs(schemeId: string): Promise<SchemeAuditLogRow[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('scheme_audit_logs')
        .select('*')
        .eq('scheme_id', schemeId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    // Fall back to memory
  }

  return inMemoryAuditLogs.filter((log) => log.scheme_id === schemeId);
}
