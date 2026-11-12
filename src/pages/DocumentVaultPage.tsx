import React, { useState, useEffect, useMemo } from 'react';
import {
  CanonicalDocumentStatus,
  UserDocumentItem,
  AggregatedDocumentRequirement,
} from '@/features/documents/types';
import {
  aggregateSchemeDocuments,
  SchemeWithDocumentsInput,
} from '@/features/documents/crossSchemeIntelligence';
import {
  fetchUserDocumentItems,
  saveUserDocumentItem,
} from '@/services/userDocumentService';
import { getSavedSchemeIds } from '@/services/savedSchemeService';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';
import { DocumentReadinessMeter } from '@/features/documents/components/DocumentReadinessMeter';
import { HighLeverageAlert } from '@/features/documents/components/HighLeverageAlert';
import { DocumentChecklistCard } from '@/features/documents/components/DocumentChecklistCard';
import { DocumentRecordModal } from '@/features/documents/components/DocumentRecordModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Search,
  RotateCcw,
  Plus,
  Layers,
  FileText,
  Filter,
  Loader2,
} from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userDocs, setUserDocs] = useState<UserDocumentItem[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [schemeScope, setSchemeScope] = useState<'SAVED_ONLY' | 'ALL_VERIFIED'>('ALL_VERIFIED');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [modalDoc, setModalDoc] = useState<AggregatedDocumentRequirement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [docs, savedIds] = await Promise.all([
          fetchUserDocumentItems(),
          getSavedSchemeIds(),
        ]);

        // If local storage had no docs yet, populate sensible starter defaults
        if (docs.length === 0) {
          const starterDocs: UserDocumentItem[] = [
            {
              canonicalKey: 'doc_bank_passbook',
              documentName: 'Aadhaar-Seeded Bank Account Passbook',
              status: 'AVAILABLE',
              documentReferenceMasked: 'SBIN••••8892',
            },
            {
              canonicalKey: 'doc_caste_cert',
              documentName: 'Caste / Community Certificate',
              status: 'AVAILABLE',
              documentReferenceMasked: 'RD00••••124',
            },
            {
              canonicalKey: 'doc_income_cert',
              documentName: 'Income Certificate',
              status: 'EXPIRED',
              expiryDate: '2026-03-31',
              documentReferenceMasked: 'INC/••••/2025',
              notes: 'Annual validity expired on 31-Mar-2026. Needs renewal at Tehsildar.',
            },
            {
              canonicalKey: 'doc_domicile_cert',
              documentName: 'Domicile / Residence Certificate',
              status: 'NEEDS_VERIFICATION',
              notes: 'Application submitted at Nada Kacheri; Ack #NK-9921',
            },
          ];
          for (const item of starterDocs) {
            await saveUserDocumentItem(item);
          }
          setUserDocs(starterDocs);
        } else {
          setUserDocs(docs);
        }

        setSavedSchemeIds(savedIds);
        if (savedIds.length > 0) {
          setSchemeScope('SAVED_ONLY');
        }
      } catch (err) {
        console.error('Failed to load document vault data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Determine Active Schemes for Evaluation
  const activeSchemes: SchemeWithDocumentsInput[] = useMemo(() => {
    let pool = VERIFIED_SCHEMES;

    if (schemeScope === 'SAVED_ONLY' && savedSchemeIds.length > 0) {
      const filtered = pool.filter((s) => savedSchemeIds.includes(s.id));
      if (filtered.length > 0) {
        pool = filtered;
      }
    }

    if (selectedSchemeId !== 'ALL') {
      pool = pool.filter((s) => s.id === selectedSchemeId);
    }

    return pool.map((s) => ({
      id: s.id,
      name: s.official_name,
      slug: s.slug,
      governmentLevel: s.government_level,
      required_document_keys: s.required_document_keys,
    }));
  }, [schemeScope, savedSchemeIds, selectedSchemeId]);

  // Compute Cross-Scheme Metrics & Consolidated Requirements
  const metrics = useMemo(() => {
    return aggregateSchemeDocuments(activeSchemes, userDocs);
  }, [activeSchemes, userDocs]);

  // Handle Quick Status Change
  const handleStatusChange = async (
    canonicalKey: string,
    newStatus: CanonicalDocumentStatus
  ) => {
    const existing = userDocs.find((d) => d.canonicalKey === canonicalKey);
    const docMeta = UNIVERSAL_DOCUMENTS.find((d) => d.canonical_key === canonicalKey);

    const updatedItem: UserDocumentItem = {
      ...(existing || {
        canonicalKey,
        documentName: docMeta?.title || canonicalKey,
      }),
      status: newStatus,
    };

    // Optimistic UI update
    setUserDocs((prev) => {
      const idx = prev.findIndex((d) => d.canonicalKey === canonicalKey);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedItem;
        return copy;
      }
      return [...prev, updatedItem];
    });

    await saveUserDocumentItem(updatedItem);
  };

  // Handle Detailed Save from Modal
  const handleSaveModal = async (updatedItem: UserDocumentItem) => {
    setUserDocs((prev) => {
      const idx = prev.findIndex((d) => d.canonicalKey === updatedItem.canonicalKey);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedItem;
        return copy;
      }
      return [...prev, updatedItem];
    });

    await saveUserDocumentItem(updatedItem);
  };

  const openEditModal = (doc: AggregatedDocumentRequirement) => {
    setModalDoc(doc);
    setIsModalOpen(true);
  };

  const handleAddNewDocument = () => {
    // Open modal with a default unrecorded document from taxonomy
    const unrecordedKey =
      UNIVERSAL_DOCUMENTS.find(
        (u) => !userDocs.some((d) => d.canonicalKey === u.canonical_key)
      )?.canonical_key || 'doc_voter_id';

    const sample = metrics.allUniqueDocuments.find(
      (d) => d.canonicalKey === unrecordedKey
    ) || {
      canonicalKey: unrecordedKey,
      documentName: 'New Document / Certificate',
      status: 'MISSING' as CanonicalDocumentStatus,
      isMandatoryAcrossAny: true,
      issuingAuthority: 'Competent Authority',
      validityPeriod: 'Perpetual',
      linkedSchemes: [],
      leverageCount: 0,
    };

    setModalDoc(sample);
    setIsModalOpen(true);
  };

  // Filter and Search Documents
  const filteredDocs = useMemo(() => {
    return metrics.allUniqueDocuments.filter((doc) => {
      // Status filter
      if (statusFilter !== 'ALL' && doc.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.documentName.toLowerCase().includes(q);
        const matchesKey = doc.canonicalKey.toLowerCase().includes(q);
        const matchesAuth = doc.issuingAuthority.toLowerCase().includes(q);
        const matchesScheme = doc.linkedSchemes.some((s) =>
          s.schemeName.toLowerCase().includes(q)
        );
        return matchesName || matchesKey || matchesAuth || matchesScheme;
      }

      return true;
    });
  }, [metrics.allUniqueDocuments, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              Cross-Scheme Document Intelligence
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Zero Double-Counting
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalised Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Track certificate readiness once. Sahayak aggregates overlapping requirements across central and state schemes so you never apply twice for the same paper.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddNewDocument}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Certificate
          </Button>
        </div>
      </div>

      {/* Scope Selector: Saved Schemes vs All Verified Schemes */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-civic-border rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Evaluation Scope:
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setSchemeScope('SAVED_ONLY');
                setSelectedSchemeId('ALL');
              }}
              disabled={savedSchemeIds.length === 0}
              className={`px-3 py-1 rounded-md transition-all ${
                schemeScope === 'SAVED_ONLY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              Saved Schemes ({savedSchemeIds.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setSchemeScope('ALL_VERIFIED');
                setSelectedSchemeId('ALL');
              }}
              className={`px-3 py-1 rounded-md transition-all ${
                schemeScope === 'ALL_VERIFIED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Verified Schemes ({VERIFIED_SCHEMES.length})
            </button>
          </div>
        </div>

        {/* Individual Scheme Isolation Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Isolate Scheme:
          </span>
          <select
            value={selectedSchemeId}
            onChange={(e) => setSelectedSchemeId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald max-w-xs truncate"
          >
            <option value="ALL">
              All {activeSchemes.length} Active Schemes
            </option>
            {activeSchemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Leverage Recommendation Banner */}
      <HighLeverageAlert
        document={metrics.highLeverageDocument}
        completionPercentage={metrics.completionPercentage}
        onOpenUpdateModal={openEditModal}
      />

      {/* Document Readiness Meter */}
      <DocumentReadinessMeter
        metrics={metrics}
        schemesCount={activeSchemes.length}
      />

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-civic-border rounded-xl text-xs font-semibold">
          {[
            { key: 'ALL', label: `All (${metrics.totalUniqueRequired})` },
            { key: 'AVAILABLE', label: `Available (${metrics.availableCount})` },
            { key: 'NEEDS_VERIFICATION', label: `In Verification (${metrics.verificationPendingCount})` },
            { key: 'EXPIRED', label: `Needs Renewal (${metrics.expiredCount})` },
            { key: 'MISSING', label: `Missing (${metrics.missingCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === tab.key
                  ? 'bg-civic-navy text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificate or issuing body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-civic-emerald"
          />
        </div>
      </div>

      {/* Reset Filter Button if Active */}
      {(statusFilter !== 'ALL' || searchQuery || selectedSchemeId !== 'ALL') && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span>
            Showing filtered view: <strong>{filteredDocs.length}</strong> matching certificates
          </span>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
              setSelectedSchemeId('ALL');
            }}
            className="text-civic-emerald font-semibold flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* Documents Grid / Loading */}
      {loading ? (
        <Card className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-civic-emerald animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Aggregating cross-scheme certificate requirements...
          </p>
        </Card>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentChecklistCard
              key={doc.canonicalKey}
              document={doc}
              onStatusChange={handleStatusChange}
              onOpenEditModal={openEditModal}
            />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">No Certificates Found</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              No documents match the current filter or search criteria.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Edit / Record Modal */}
      <DocumentRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={modalDoc}
        onSave={handleSaveModal}
      />
    </div>
  );
};
