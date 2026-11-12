/**
 * SAHAYAK Scheme Editor & Curation Studio Modal
 *
 * Full-lifecycle administrator form for creating, editing, and verifying
 * government welfare initiatives with rules, documents, and gazette links.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  X,
  Save,
  Plus,
  Trash2,
  Eye,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  SchemeFormData,
  PublicationStatus,
  ApplicationStatus,
  SchemeRuleInput,
  SchemeDocumentInput,
  SchemeSourceInput,
  INDIAN_STATES_AND_UTS,
} from '../types';
import { validateSchemeForPublication } from '../validation';
import { SchemePreviewModal } from './SchemePreviewModal';
import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';

interface SchemeEditorModalProps {
  initialData?: SchemeFormData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SchemeFormData, changeNotes?: string) => Promise<void>;
  isSaving: boolean;
}

const CATEGORIES = [
  { id: 'FARMERS', name: 'Agriculture & Farmers' },
  { id: 'STUDENTS', name: 'Education & Students' },
  { id: 'WOMEN', name: 'Women & Child Development' },
  { id: 'SENIOR_CITIZENS', name: 'Senior Citizens & Pensioners' },
  { id: 'PERSONS_WITH_DISABILITIES', name: 'Differently Abled Support' },
  { id: 'EMPLOYMENT_SEEKERS', name: 'Youth Employment & Skills' },
  { id: 'HEALTHCARE', name: 'Health & Medical Assistance' },
  { id: 'HOUSING', name: 'Rural & Urban Housing' },
  { id: 'LOW_INCOME', name: 'Social Welfare & BPL' },
];

const RULE_FIELDS = [
  { field: 'annual_family_income', label: 'Annual Household Income (₹)' },
  { field: 'age', label: 'Applicant Age' },
  { field: 'state_of_residence', label: 'State / UT of Residence' },
  { field: 'social_category', label: 'Social Category (General, OBC, SC, ST, EWS)' },
  { field: 'employment_status', label: 'Employment Status' },
  { field: 'education_level', label: 'Education Level' },
  { field: 'is_student', label: 'Is Enrolled Student (boolean)' },
  { field: 'is_differently_abled', label: 'Is Differently Abled (boolean)' },
  { field: 'disability_percentage', label: 'Disability Percentage' },
  { field: 'has_bpl_card', label: 'Has BPL / Ration Card (boolean)' },
  { field: 'owns_agricultural_land', label: 'Owns Agricultural Land (boolean)' },
];

export const SchemeEditorModal: React.FC<SchemeEditorModalProps> = ({
  initialData,
  isOpen,
  onClose,
  onSave,
  isSaving,
}) => {
  const isEditing = Boolean(initialData?.id);

  // Form State
  const [formData, setFormData] = useState<SchemeFormData>(() => {
    if (initialData) return initialData;
    return {
      slug: '',
      official_name: '',
      short_title: '',
      description: '',
      benefits: '',
      financial_benefit_amount: null,
      government_level: 'CENTRAL',
      applicable_region: null,
      category_id: 'FARMERS',
      department_name: '',
      official_application_url: '',
      official_portal_name: '',
      status: 'OPEN',
      publication_status: 'DRAFT',
      verified_by_name: 'Dr. Rajesh Sharma',
      last_verified_at: new Date().toISOString().split('T')[0],
      audit_notes: '',
      is_active: false,
      academic_or_financial_year: '2026-27',
      rules: [
        {
          field: 'annual_family_income',
          operator: 'LESS_THAN_OR_EQUAL',
          expected_value: 250000,
          rule_group: 'default',
          logical_relationship: 'AND',
          label: 'Annual household income must not exceed ₹2,50,000',
        },
      ],
      documents: [
        {
          canonical_key: 'doc_income_certificate',
          document_name: 'Income Certificate',
          is_mandatory: true,
          issuing_authority: 'Revenue Department / Tehsildar',
          validity_period: '1 Financial Year',
          approx_days_to_issue: 15,
        },
      ],
      sources: [
        {
          official_source_url: 'https://services.india.gov.in',
          source_type: 'GAZETTE',
          last_checked_date: new Date().toISOString().split('T')[0],
          notes: 'Official Gazette Notification',
        },
      ],
    };
  });

  const [activeTab, setActiveTab] = useState<'BASIC' | 'BENEFITS' | 'GOVERNANCE' | 'RULES' | 'DOCS' | 'SOURCES'>('BASIC');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');

  if (!isOpen) return null;

  // Real-time validation checks
  const validation = validateSchemeForPublication(formData);

  // Generate slug helper
  const handleGenerateSlug = () => {
    if (!formData.short_title && !formData.official_name) return;
    const base = formData.short_title || formData.official_name;
    const generated = base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  // Rule management helpers
  const handleAddRule = () => {
    const newRule: SchemeRuleInput = {
      field: 'age',
      operator: 'GREATER_THAN_OR_EQUAL',
      expected_value: 18,
      rule_group: 'default',
      logical_relationship: 'AND',
      label: 'Applicant must be at least 18 years of age',
    };
    setFormData((prev) => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  const handleUpdateRule = (index: number, updates: Partial<SchemeRuleInput>) => {
    setFormData((prev) => {
      const next = [...prev.rules];
      next[index] = { ...next[index], ...updates };
      return { ...prev, rules: next };
    });
  };

  const handleRemoveRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  // Document management helpers
  const handleAddDocument = () => {
    const newDoc: SchemeDocumentInput = {
      canonical_key: 'doc_bank_passbook',
      document_name: 'Bank Passbook / Cancelled Cheque',
      is_mandatory: true,
      issuing_authority: 'Scheduled Commercial Bank',
      validity_period: 'Permanent',
      approx_days_to_issue: 1,
    };
    setFormData((prev) => ({ ...prev, documents: [...prev.documents, newDoc] }));
  };

  const handleUpdateDocument = (index: number, updates: Partial<SchemeDocumentInput>) => {
    setFormData((prev) => {
      const next = [...prev.documents];
      next[index] = { ...next[index], ...updates };
      return { ...prev, documents: next };
    });
  };

  const handleRemoveDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  // Source management helpers
  const handleAddSource = () => {
    const newSrc: SchemeSourceInput = {
      official_source_url: 'https://egazette.gov.in',
      source_type: 'GAZETTE',
      last_checked_date: new Date().toISOString().split('T')[0],
      notes: 'Central Gazette Notification Ref',
    };
    setFormData((prev) => ({ ...prev, sources: [...prev.sources, newSrc] }));
  };

  const handleUpdateSource = (index: number, updates: Partial<SchemeSourceInput>) => {
    setFormData((prev) => {
      const next = [...prev.sources];
      next[index] = { ...next[index], ...updates };
      return { ...prev, sources: next };
    });
  };

  const handleRemoveSource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData, changeNotes);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">Curator Studio</Badge>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? `Edit Scheme: ${formData.short_title || formData.official_name}` : 'Draft New Welfare Scheme'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
            >
              Citizen Preview
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto text-xs font-semibold gap-1">
          {[
            { id: 'BASIC', label: '1. Basic Info' },
            { id: 'BENEFITS', label: '2. Benefits & Aid' },
            { id: 'GOVERNANCE', label: '3. Verification & Status' },
            { id: 'RULES', label: `4. Rules (${formData.rules.length})` },
            { id: 'DOCS', label: `5. Documents (${formData.documents.length})` },
            { id: 'SOURCES', label: `6. Sources (${formData.sources.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Validation Errors Notice */}
        {!validation.isValid && formData.publication_status === 'VERIFIED' && (
          <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Publication Blocked:</strong> {validation.errors.join(' • ')}
            </span>
          </div>
        )}

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'BASIC' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Gazette Name"
                  required
                  value={formData.official_name}
                  onChange={(e) => setFormData({ ...formData, official_name: e.target.value })}
                  placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                  helperText="Full statutory title as published in Central/State gazette."
                />
                <Input
                  label="Short Acronym / Title"
                  required
                  value={formData.short_title}
                  onChange={(e) => setFormData({ ...formData, short_title: e.target.value })}
                  placeholder="e.g. PM-KISAN"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">URL Slug</label>
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      Generate from title
                    </button>
                  </div>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="pm-kisan-samman-nidhi"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Beneficiary Category
                  </label>
                  <select
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Government Jurisdiction
                  </label>
                  <select
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    value={formData.government_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        government_level: e.target.value as 'CENTRAL' | 'STATE',
                      })
                    }
                  >
                    <option value="CENTRAL">Central Government (All-India)</option>
                    <option value="STATE">State Government (Specific Region)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Applicable State / UT
                  </label>
                  <select
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100"
                    value={formData.applicable_region || ''}
                    disabled={formData.government_level === 'CENTRAL'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicable_region: e.target.value || null,
                      })
                    }
                  >
                    <option value="">All-India (Central)</option>
                    {INDIAN_STATES_AND_UTS.map((st: string) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Fiscal / Academic Year"
                  value={formData.academic_or_financial_year || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, academic_or_financial_year: e.target.value })
                  }
                  placeholder="2026-27"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nodal Ministry / Department"
                  required
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  placeholder="Ministry of Agriculture & Farmers Welfare"
                />
                <Input
                  label="Official Portal Name"
                  required
                  value={formData.official_portal_name}
                  onChange={(e) => setFormData({ ...formData, official_portal_name: e.target.value })}
                  placeholder="pmkisan.gov.in"
                />
                <Input
                  label="Official Application URL"
                  required
                  value={formData.official_application_url}
                  onChange={(e) => setFormData({ ...formData, official_application_url: e.target.value })}
                  placeholder="https://pmkisan.gov.in"
                />
              </div>
            </div>
          )}

          {activeTab === 'BENEFITS' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Brief Citizen-Facing Summary (2-3 sentences)
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Direct income support of ₹6,000 per year paid in three equal installments to all landholding farmer families across the country."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Statutory Benefits & Assistance Structure
                </label>
                <textarea
                  rows={4}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="Eligible farmer families receive financial benefit of ₹6,000 per annum, payable in three equal four-monthly installments of ₹2,000 each via Direct Benefit Transfer (DBT)."
                />
              </div>

              <div className="max-w-xs">
                <Input
                  label="Annual Financial Assistance Amount (₹)"
                  type="number"
                  value={formData.financial_benefit_amount ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      financial_benefit_amount: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="6000"
                  helperText="Leave blank if non-monetary (e.g. food rations or free training)."
                />
              </div>
            </div>
          )}

          {activeTab === 'GOVERNANCE' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mandatory Verification Standards
                </span>
                <p className="text-slate-600 leading-relaxed">
                  To protect citizens against misinformation, a scheme can only be marked{' '}
                  <strong>VERIFIED</strong> if it includes a verified official source, active verification date,
                  and named reviewing administrator.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Publication Status
                  </label>
                  <select
                    className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                    value={formData.publication_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publication_status: e.target.value as PublicationStatus,
                        is_active: e.target.value === 'VERIFIED',
                      })
                    }
                  >
                    <option value="DRAFT">DRAFT (Internal drafting, not visible to public)</option>
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION (Under legal/gazette audit)</option>
                    <option value="VERIFIED">VERIFIED (Live, published for all citizens)</option>
                    <option value="NEEDS_REVIEW">NEEDS_REVIEW (Flagged for policy updates)</option>
                    <option value="ARCHIVED">ARCHIVED (Discontinued or lapsed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Application Cycle Status
                  </label>
                  <select
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ApplicationStatus,
                      })
                    }
                  >
                    <option value="OPEN">OPEN (Accepting Applications)</option>
                    <option value="ALWAYS_ACTIVE">ALWAYS_ACTIVE (Evergreen entitlement)</option>
                    <option value="CLOSING_SOON">CLOSING_SOON (Deadline within 14 days)</option>
                    <option value="CLOSED">CLOSED (Application window shut)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Responsible Reviewer / Admin Name"
                  required
                  value={formData.verified_by_name}
                  onChange={(e) => setFormData({ ...formData, verified_by_name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                />
                <Input
                  label="Verification / Audit Date"
                  type="date"
                  required
                  value={formData.last_verified_at}
                  onChange={(e) => setFormData({ ...formData, last_verified_at: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Audit Notes / Reason for Mutation
                </label>
                <textarea
                  rows={2}
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  value={formData.audit_notes || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, audit_notes: e.target.value });
                    setChangeNotes(e.target.value);
                  }}
                  placeholder="e.g. Updated annual income ceiling in accordance with Gazette Notification No. 44/2026."
                />
              </div>
            </div>
          )}

          {activeTab === 'RULES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Deterministic Eligibility Rules ({formData.rules.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluated by Sahayak&apos;s pure logic engine with zero hallucinations.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRule}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Condition
                </Button>
              </div>

              {formData.rules.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Zero rules configured. Published schemes must configure at least one rule.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.rules.map((rule, idx) => (
                    <Card key={idx} className="p-4 border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Condition Clause
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 text-xs"
                          title="Remove Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-slate-500 block mb-0.5">Profile Field</label>
                          <select
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={rule.field}
                            onChange={(e) => handleUpdateRule(idx, { field: e.target.value })}
                          >
                            {RULE_FIELDS.map((rf) => (
                              <option key={rf.field} value={rf.field}>
                                {rf.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Operator</label>
                          <select
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-mono"
                            value={rule.operator}
                            onChange={(e) => handleUpdateRule(idx, { operator: e.target.value as any })}
                          >
                            <option value="EQUALS">EQUALS</option>
                            <option value="NOT_EQUALS">NOT_EQUALS</option>
                            <option value="LESS_THAN_OR_EQUAL">LESS_THAN_OR_EQUAL</option>
                            <option value="GREATER_THAN_OR_EQUAL">GREATER_THAN_OR_EQUAL</option>
                            <option value="BETWEEN">BETWEEN</option>
                            <option value="IN">IN</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Expected Value</label>
                          <input
                            type="text"
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-mono"
                            value={
                              typeof rule.expected_value === 'object'
                                ? JSON.stringify(rule.expected_value)
                                : String(rule.expected_value)
                            }
                            onChange={(e) => {
                              let parsed: any = e.target.value;
                              try {
                                if (parsed === 'true') parsed = true;
                                else if (parsed === 'false') parsed = false;
                                else if (!isNaN(Number(parsed)) && parsed.trim() !== '') parsed = Number(parsed);
                                else if (parsed.startsWith('[') || parsed.startsWith('{')) parsed = JSON.parse(parsed);
                              } catch {}
                              handleUpdateRule(idx, { expected_value: parsed });
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-3">
                          <label className="text-[11px] text-slate-500 block mb-0.5">
                            Audit Card Explanation Label (Read by Citizen)
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={rule.label}
                            onChange={(e) => handleUpdateRule(idx, { label: e.target.value })}
                            placeholder="e.g. Annual family income must not exceed ₹2,50,000"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Logic Join</label>
                          <select
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-mono"
                            value={rule.logical_relationship}
                            onChange={(e) =>
                              handleUpdateRule(idx, { logical_relationship: e.target.value as 'AND' | 'OR' })
                            }
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'DOCS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Required Certificates & Proofs ({formData.documents.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Maps directly into the citizen&apos;s Universal Document Vault without double-counting.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDocument}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Attach Document
                </Button>
              </div>

              {formData.documents.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Zero required documents attached.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.documents.map((doc, idx) => (
                    <Card key={idx} className="p-4 border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {doc.document_name || 'Document Requirement'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Canonical Key</label>
                          <select
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-mono"
                            value={doc.canonical_key}
                            onChange={(e) => {
                              const found = UNIVERSAL_DOCUMENTS.find((d) => d.canonical_key === e.target.value);
                              handleUpdateDocument(idx, {
                                canonical_key: e.target.value,
                                document_name: found?.title || e.target.value,
                                issuing_authority: found?.issuing_authority,
                                validity_period: found?.validity_period,
                              });
                            }}
                          >
                            {UNIVERSAL_DOCUMENTS.map((ud) => (
                              <option key={ud.canonical_key} value={ud.canonical_key}>
                                {ud.canonical_key} ({ud.title})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Display Title</label>
                          <input
                            type="text"
                            required
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={doc.document_name}
                            onChange={(e) => handleUpdateDocument(idx, { document_name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Issuing Body</label>
                          <input
                            type="text"
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={doc.issuing_authority || ''}
                            onChange={(e) => handleUpdateDocument(idx, { issuing_authority: e.target.value })}
                            placeholder="Tehsildar / Sub-Divisional Magistrate"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Typical Validity</label>
                          <input
                            type="text"
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={doc.validity_period || ''}
                            onChange={(e) => handleUpdateDocument(idx, { validity_period: e.target.value })}
                            placeholder="e.g. 1 Year, Permanent"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={doc.is_mandatory}
                              onChange={(e) => handleUpdateDocument(idx, { is_mandatory: e.target.checked })}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Strictly Mandatory</span>
                          </label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'SOURCES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Official Gazette & Legal Sources ({formData.sources.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Every published welfare scheme must link directly to official state or central gazette notifications.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSource}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Source
                </Button>
              </div>

              {formData.sources.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-rose-200 bg-rose-50/40 rounded-xl text-xs text-rose-700 font-medium">
                  Zero sources recorded. At least one official gazette or guidelines source is required for publication.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.sources.map((src, idx) => (
                    <Card key={idx} className="p-4 border-slate-200 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Source Reference #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-slate-500 block mb-0.5">Source URL</label>
                          <input
                            type="url"
                            required
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-mono"
                            value={src.official_source_url}
                            onChange={(e) => handleUpdateSource(idx, { official_source_url: e.target.value })}
                            placeholder="https://pmkisan.gov.in/Documents/RevisedGuidelines.pdf"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Source Type</label>
                          <select
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={src.source_type}
                            onChange={(e) => handleUpdateSource(idx, { source_type: e.target.value as any })}
                          >
                            <option value="GAZETTE">Gazette Notification</option>
                            <option value="GUIDELINES_PDF">Official Guidelines PDF</option>
                            <option value="MINISTRY_PORTAL">Ministry Web Portal</option>
                            <option value="PRESS_RELEASE">PIB Press Release</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Last Checked Date</label>
                          <input
                            type="date"
                            required
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={src.last_checked_date}
                            onChange={(e) => handleUpdateSource(idx, { last_checked_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-0.5">Notes / Gazette Order No.</label>
                          <input
                            type="text"
                            className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                            value={src.notes || ''}
                            onChange={(e) => handleUpdateSource(idx, { notes: e.target.value })}
                            placeholder="Order No. 1-1/2026-Credit-I"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {formData.publication_status === 'VERIFIED'
                  ? 'Verify & Publish Scheme'
                  : 'Save Scheme'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Embedded Preview Modal */}
      <SchemePreviewModal
        scheme={formData}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirmPublish={() => {
          setFormData((prev) => ({
            ...prev,
            publication_status: 'VERIFIED',
            is_active: true,
          }));
          setPreviewOpen(false);
        }}
      />
    </div>
  );
};
