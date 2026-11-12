/**
 * SAHAYAK Scheme Admin & Verification Management Console
 *
 * Provides authorized administrators and gazette curators with end-to-end
 * governance over official welfare scheme criteria, statutory rules, documents,
 * verification statuses, and tamper-resistant audit logs.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Search,
  Calendar,
  Eye,
  Edit3,
  History,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  SchemeFormData,
  PublicationStatus,
  AdminUser,
} from '@/features/admin/types';
import {
  getCurrentAdminUser,
  setAdminSession,
  getAdminSchemes,
  createScheme,
  updateScheme,
  updatePublicationStatus,
  deactivateScheme,
  reactivateScheme,
} from '@/features/admin';
import { AdminAuthGate } from '@/features/admin/components/AdminAuthGate';
import { SchemeEditorModal } from '@/features/admin/components/SchemeEditorModal';
import { SchemePreviewModal } from '@/features/admin/components/SchemePreviewModal';
import { AuditLogDrawer } from '@/features/admin/components/AuditLogDrawer';

export const AdminPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => getCurrentAdminUser());
  const [schemes, setSchemes] = useState<SchemeFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  // Modals state
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<SchemeFormData | null>(null);
  const [previewScheme, setPreviewScheme] = useState<SchemeFormData | null>(null);
  const [auditScheme, setAuditScheme] = useState<{ id: string; title: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load schemes
  const loadSchemes = async () => {
    setLoading(true);
    const { data } = await getAdminSchemes();
    if (data) {
      setSchemes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          s.official_name.toLowerCase().includes(q) ||
          s.short_title.toLowerCase().includes(q) ||
          s.department_name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'ALL' && s.publication_status !== statusFilter) {
        return false;
      }

      // Gov Level
      if (levelFilter !== 'ALL' && s.government_level !== levelFilter) {
        return false;
      }

      return true;
    });
  }, [schemes, searchQuery, statusFilter, levelFilter]);

  // Metrics
  const stats = useMemo(() => {
    const total = schemes.length;
    const verified = schemes.filter((s) => s.publication_status === 'VERIFIED').length;
    const pending = schemes.filter((s) => s.publication_status === 'PENDING_VERIFICATION').length;
    const drafts = schemes.filter((s) => s.publication_status === 'DRAFT').length;
    const needsReview = schemes.filter((s) => s.publication_status === 'NEEDS_REVIEW').length;
    const archived = schemes.filter((s) => s.publication_status === 'ARCHIVED').length;
    return { total, verified, pending, drafts, needsReview, archived };
  }, [schemes]);

  // User Switch Handler
  const handleSwitchUser = (user: AdminUser | null) => {
    setCurrentUser(user);
    setAdminSession(user);
    if (!user) {
      setBannerNotice({
        type: 'error',
        message: 'Switched to Public Citizen Mode. Administrative mutation permissions are now disabled.',
      });
    } else {
      setBannerNotice({
        type: 'success',
        message: `Authenticated as ${user.name} (${user.role}). Full curation rights active.`,
      });
    }
  };

  // Save / Update Handler
  const handleSaveScheme = async (data: SchemeFormData, changeNotes?: string) => {
    setIsSaving(true);
    setBannerNotice(null);

    try {
      if (data.id && schemes.some((s) => s.id === data.id)) {
        // Update existing
        const res = await updateScheme(data.id, data, currentUser, changeNotes);
        if (res.error) {
          setBannerNotice({ type: 'error', message: res.error.message });
        } else {
          setBannerNotice({
            type: 'success',
            message: `Successfully updated scheme "${data.short_title}".`,
          });
          setEditorOpen(false);
          await loadSchemes();
        }
      } else {
        // Create new
        const res = await createScheme(data, currentUser);
        if (res.error) {
          setBannerNotice({ type: 'error', message: res.error.message });
        } else {
          setBannerNotice({
            type: 'success',
            message: `Successfully drafted scheme "${data.short_title}".`,
          });
          setEditorOpen(false);
          await loadSchemes();
        }
      }
    } catch (err: any) {
      setBannerNotice({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setIsSaving(false);
    }
  };

  // Status Shift Handler (Quick Action)
  const handleStatusShift = async (scheme: SchemeFormData, newStatus: PublicationStatus) => {
    if (!currentUser) return;
    const reviewer = currentUser.name;
    const res = await updatePublicationStatus(
      scheme.id || scheme.slug,
      newStatus,
      reviewer,
      currentUser,
      `Quick transition to ${newStatus} by ${reviewer}`
    );

    if (res.error) {
      setBannerNotice({ type: 'error', message: res.error.message });
    } else {
      setBannerNotice({
        type: 'success',
        message: `Scheme "${scheme.short_title}" updated to status ${newStatus}.`,
      });
      await loadSchemes();
    }
  };

  // Deactivate Handler
  const handleDeactivate = async (scheme: SchemeFormData) => {
    if (!currentUser) return;
    const reason = window.prompt(`Provide reason for archiving "${scheme.short_title}":`, 'Policy term expired or merged with newer scheme');
    if (!reason) return;

    const res = await deactivateScheme(scheme.id || scheme.slug, reason, currentUser);
    if (res.error) {
      setBannerNotice({ type: 'error', message: res.error.message });
    } else {
      setBannerNotice({
        type: 'success',
        message: `Scheme "${scheme.short_title}" archived successfully.`,
      });
      await loadSchemes();
    }
  };

  // Reactivate Handler
  const handleReactivate = async (scheme: SchemeFormData) => {
    if (!currentUser) return;
    const res = await reactivateScheme(scheme.id || scheme.slug, currentUser);
    if (res.error) {
      setBannerNotice({ type: 'error', message: res.error.message });
    } else {
      setBannerNotice({
        type: 'success',
        message: `Scheme "${scheme.short_title}" reactivated into PENDING_VERIFICATION.`,
      });
      await loadSchemes();
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Role Gate & Switcher */}
      <AdminAuthGate currentUser={currentUser} onSwitchUser={handleSwitchUser}>
        {/* Banner Notice */}
        {bannerNotice && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              bannerNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {bannerNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{bannerNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Console Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="eligible">Statutory Integrity Console</Badge>
              <span className="text-xs text-slate-500 font-medium">
                Official Scheme Gazette Curation
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welfare Scheme Governance Panel
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Create, review, verify, and publish real-world welfare schemes with deterministic eligibility
              rules and verified gazette sources.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedScheme(null);
              setEditorOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Draft New Scheme
          </Button>
        </div>

        {/* Governance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <Card className="p-3.5 space-y-1 bg-white border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Total Schemes</span>
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            <span className="text-[10px] text-slate-400">In repository</span>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white border-emerald-200 shadow-xs">
            <span className="text-[11px] text-emerald-700 font-medium">Verified & Live</span>
            <p className="text-xl font-bold text-emerald-700">{stats.verified}</p>
            <span className="text-[10px] text-emerald-600 font-medium">100% gazette audited</span>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white border-blue-200 shadow-xs">
            <span className="text-[11px] text-blue-700 font-medium">Pending Audit</span>
            <p className="text-xl font-bold text-blue-700">{stats.pending}</p>
            <span className="text-[10px] text-blue-500">Awaiting reviewer</span>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white border-amber-200 shadow-xs">
            <span className="text-[11px] text-amber-700 font-medium">Pre-Gazette Drafts</span>
            <p className="text-xl font-bold text-amber-700">{stats.drafts}</p>
            <span className="text-[10px] text-amber-500">Unpublished</span>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white border-purple-200 shadow-xs">
            <span className="text-[11px] text-purple-700 font-medium">Needs Review</span>
            <p className="text-xl font-bold text-purple-700">{stats.needsReview}</p>
            <span className="text-[10px] text-purple-500">Policy updates</span>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Archived</span>
            <p className="text-xl font-bold text-slate-600">{stats.archived}</p>
            <span className="text-[10px] text-slate-400">Deactivated</span>
          </Card>
        </div>

        {/* Directory Controls & Table */}
        <Card className="p-4 sm:p-5 space-y-4 border-slate-200 shadow-card">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by scheme name, acronym, or ministry..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                className="text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Publication Statuses</option>
                <option value="VERIFIED">Verified & Live</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="DRAFT">Draft</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
                <option value="ARCHIVED">Archived / Deactivated</option>
              </select>

              <select
                className="text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-700"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="ALL">All Levels</option>
                <option value="CENTRAL">Central</option>
                <option value="STATE">State</option>
              </select>
            </div>
          </div>

          {/* Schemes Management Table */}
          {loading ? (
            <div className="text-center py-16 text-xs text-slate-400">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
              Loading verified schemes repository...
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
              No welfare schemes match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Scheme Details</th>
                    <th className="py-3 px-4">Level / Region</th>
                    <th className="py-3 px-4">Publication Status</th>
                    <th className="py-3 px-4">Cycle</th>
                    <th className="py-3 px-4">Verification Audit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredSchemes.map((scheme) => (
                    <tr key={scheme.id || scheme.slug} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Ministry */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 leading-snug">
                          {scheme.official_name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-semibold text-emerald-700">{scheme.short_title}</span>
                          <span>•</span>
                          <span className="truncate">{scheme.department_name}</span>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={scheme.government_level === 'CENTRAL' ? 'central' : 'state'} className="text-[10px]">
                            {scheme.government_level}
                          </Badge>
                          {scheme.applicable_region && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              {scheme.applicable_region}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Publication Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {scheme.publication_status === 'VERIFIED' ? (
                            <Badge variant="eligible" className="text-[10px]">
                              VERIFIED
                            </Badge>
                          ) : scheme.publication_status === 'PENDING_VERIFICATION' ? (
                            <Badge variant="info" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                              PENDING AUDIT
                            </Badge>
                          ) : scheme.publication_status === 'DRAFT' ? (
                            <Badge variant="neutral" className="text-[10px]">
                              DRAFT
                            </Badge>
                          ) : scheme.publication_status === 'NEEDS_REVIEW' ? (
                            <Badge variant="unknown" className="text-[10px]">
                              NEEDS REVIEW
                            </Badge>
                          ) : (
                            <Badge variant="neutral" className="text-[10px] bg-slate-100 text-slate-500">
                              ARCHIVED
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Application Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {scheme.status}
                        </span>
                      </td>

                      {/* Verification Audit */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-[11px] text-slate-800 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{scheme.last_verified_at}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          By: {scheme.verified_by_name}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview Action */}
                          <button
                            type="button"
                            onClick={() => setPreviewScheme(scheme)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                            title="Preview Citizen View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Action */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedScheme(scheme);
                              setEditorOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 rounded hover:bg-emerald-50 transition-colors"
                            title="Edit Scheme Details & Rules"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Audit Trail Action */}
                          <button
                            type="button"
                            onClick={() =>
                              setAuditScheme({
                                id: scheme.id || scheme.slug,
                                title: scheme.official_name,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-blue-700 rounded hover:bg-blue-50 transition-colors"
                            title="View Audit Trail"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Quick Publication / Status Action */}
                          {scheme.publication_status !== 'VERIFIED' && scheme.publication_status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusShift(scheme, 'VERIFIED')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors"
                              title="Approve and Publish to Citizens"
                            >
                              Publish
                            </button>
                          )}

                          {/* Archive / Deactivate */}
                          {scheme.is_active && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(scheme)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Deactivate & Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reactivate */}
                          {!scheme.is_active && scheme.publication_status === 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleReactivate(scheme)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors"
                              title="Reactivate Scheme"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Scheme Editor Studio Modal */}
        <SchemeEditorModal
          initialData={selectedScheme}
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setSelectedScheme(null);
          }}
          onSave={handleSaveScheme}
          isSaving={isSaving}
        />

        {/* Scheme Preview Modal */}
        {previewScheme && (
          <SchemePreviewModal
            scheme={previewScheme}
            isOpen={Boolean(previewScheme)}
            onClose={() => setPreviewScheme(null)}
            onConfirmPublish={() => {
              handleStatusShift(previewScheme, 'VERIFIED');
              setPreviewScheme(null);
            }}
          />
        )}

        {/* Scheme Audit Log History Drawer */}
        {auditScheme && (
          <AuditLogDrawer
            schemeId={auditScheme.id}
            schemeTitle={auditScheme.title}
            isOpen={Boolean(auditScheme)}
            onClose={() => setAuditScheme(null)}
          />
        )}
      </AdminAuthGate>
    </div>
  );
};
