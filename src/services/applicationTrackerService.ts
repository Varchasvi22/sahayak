/**
 * SAHAYAK Application Preparation Tracker Service
 *
 * Tracks individual scheme progress across the 7 application preparation stages:
 * DISCOVERED -> REVIEWING_ELIGIBILITY -> COLLECTING_DOCUMENTS ->
 * READY_TO_APPLY -> APPLIED -> COMPLETED -> CLOSED
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getLocalSavedSchemeIds } from './savedSchemeService';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';

export type ApplicationPreparationStatus =
  | 'DISCOVERED'
  | 'REVIEWING_ELIGIBILITY'
  | 'COLLECTING_DOCUMENTS'
  | 'READY_TO_APPLY'
  | 'APPLIED'
  | 'COMPLETED'
  | 'CLOSED';

export interface SchemeApplicationTrackerItem {
  schemeId: string;
  schemeName: string;
  schemeSlug: string;
  departmentName?: string;
  officialApplicationUrl?: string;
  governmentLevel?: 'CENTRAL' | 'STATE';
  status: ApplicationPreparationStatus;
  startedAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  acknowledgmentNumber?: string | null;
  notes?: string | null;
}

const LOCAL_STORAGE_TRACKER_KEY = 'sahayak_application_tracker_items';

export const TRACKER_STATUS_LABELS: Record<
  ApplicationPreparationStatus,
  { label: string; description: string; stepNumber: number; variant: 'neutral' | 'info' | 'unknown' | 'eligible' | 'notEligible' }
> = {
  DISCOVERED: {
    label: 'Discovered',
    description: 'Identified scheme as potential match',
    stepNumber: 1,
    variant: 'neutral',
  },
  REVIEWING_ELIGIBILITY: {
    label: 'Reviewing Eligibility',
    description: 'Verifying statutory criteria & income rules',
    stepNumber: 2,
    variant: 'unknown',
  },
  COLLECTING_DOCUMENTS: {
    label: 'Collecting Documents',
    description: 'Gathering mandatory certificates and proofs',
    stepNumber: 3,
    variant: 'info',
  },
  READY_TO_APPLY: {
    label: 'Ready to Apply',
    description: 'All documents verified; ready for portal entry',
    stepNumber: 4,
    variant: 'eligible',
  },
  APPLIED: {
    label: 'Submitted / Applied',
    description: 'Form submitted on official portal; ref ID logged',
    stepNumber: 5,
    variant: 'eligible',
  },
  COMPLETED: {
    label: 'Benefit Disbursed',
    description: 'DBT or fee waiver successfully credited',
    stepNumber: 6,
    variant: 'eligible',
  },
  CLOSED: {
    label: 'Closed / Ineligible',
    description: 'Application cycle ended or withdrawn',
    stepNumber: 7,
    variant: 'notEligible',
  },
};

/**
 * Read local tracking items
 */
function getLocalTrackers(): Record<string, SchemeApplicationTrackerItem> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(LOCAL_STORAGE_TRACKER_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save local tracking items
 */
function setLocalTrackers(items: Record<string, SchemeApplicationTrackerItem>): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_TRACKER_KEY, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent('sahayak:application_trackers_changed', { detail: { items } })
    );
  } catch (err) {
    console.warn('Failed to save application trackers to localStorage', err);
  }
}

/**
 * Fetch all tracked schemes for a citizen
 */
export async function getApplicationTrackers(
  userId?: string | null
): Promise<SchemeApplicationTrackerItem[]> {
  const localMap = getLocalTrackers();
  const savedSchemeIds = getLocalSavedSchemeIds();

  // Try to load cloud saved schemes if user is authenticated
  if (userId && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('saved_schemes')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        data.forEach((row) => {
          if (!savedSchemeIds.includes(row.scheme_id)) {
            savedSchemeIds.push(row.scheme_id);
          }
          if (row.notes) {
            try {
              const parsed = JSON.parse(row.notes);
              if (parsed.status) {
                localMap[row.scheme_id] = {
                  ...localMap[row.scheme_id],
                  ...parsed,
                  schemeId: row.scheme_id,
                };
              }
            } catch {
              // notes was plain text
            }
          }
        });
      }
    } catch (err) {
      console.warn('Failed to fetch saved_schemes from Supabase:', err);
    }
  }

  // Ensure every saved scheme has a tracker record (defaults to COLLECTING_DOCUMENTS)
  const resultList: SchemeApplicationTrackerItem[] = [];

  for (const schemeId of savedSchemeIds) {
    const scheme = VERIFIED_SCHEMES.find((s) => s.id === schemeId);
    if (!scheme) continue;

    let tracker = localMap[schemeId];
    if (!tracker) {
      tracker = {
        schemeId: scheme.id,
        schemeName: scheme.official_name,
        schemeSlug: scheme.slug,
        departmentName: scheme.department_name,
        officialApplicationUrl: scheme.official_application_url,
        governmentLevel: scheme.government_level,
        status: 'COLLECTING_DOCUMENTS',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localMap[schemeId] = tracker;
    }

    resultList.push(tracker);
  }

  setLocalTrackers(localMap);
  return resultList;
}

/**
 * Update the application preparation status for a scheme
 * Note: Sahayak NEVER auto-submits or auto-approves. Only the citizen updates status.
 */
export async function updateApplicationTrackerStatus(
  schemeId: string,
  newStatus: ApplicationPreparationStatus,
  details?: {
    acknowledgmentNumber?: string | null;
    notes?: string | null;
    submittedAt?: string | null;
  },
  userId?: string | null
): Promise<SchemeApplicationTrackerItem> {
  const localMap = getLocalTrackers();
  const scheme = VERIFIED_SCHEMES.find((s) => s.id === schemeId);
  const now = new Date().toISOString();

  const existing = localMap[schemeId] || {
    schemeId,
    schemeName: scheme?.official_name || schemeId,
    schemeSlug: scheme?.slug || schemeId,
    departmentName: scheme?.department_name,
    officialApplicationUrl: scheme?.official_application_url,
    governmentLevel: scheme?.government_level,
    startedAt: now,
  };

  const updated: SchemeApplicationTrackerItem = {
    ...existing,
    status: newStatus,
    updatedAt: now,
    acknowledgmentNumber:
      details?.acknowledgmentNumber !== undefined
        ? details.acknowledgmentNumber
        : existing.acknowledgmentNumber,
    notes: details?.notes !== undefined ? details.notes : existing.notes,
    submittedAt:
      newStatus === 'APPLIED' && !existing.submittedAt
        ? details?.submittedAt || now
        : details?.submittedAt !== undefined
        ? details.submittedAt
        : existing.submittedAt,
  };

  localMap[schemeId] = updated;
  setLocalTrackers(localMap);

  // Sync to Supabase if authenticated
  if (userId && isSupabaseConfigured) {
    try {
      const payloadNotes = JSON.stringify({
        status: updated.status,
        acknowledgmentNumber: updated.acknowledgmentNumber,
        submittedAt: updated.submittedAt,
        notes: updated.notes,
      });

      await supabase
        .from('saved_schemes')
        .update({ notes: payloadNotes })
        .eq('user_id', userId)
        .eq('scheme_id', schemeId);
    } catch (err) {
      console.warn('Could not sync tracker update to Supabase:', err);
    }
  }

  return updated;
}
