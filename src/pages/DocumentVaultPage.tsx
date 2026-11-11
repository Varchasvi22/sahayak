import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileCheck2, Plus, ExternalLink } from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  const documents = [
    {
      key: 'doc_income_cert',
      title: 'Income Certificate',
      authority: 'Revenue Department / Tehsildar',
      status: 'AVAILABLE' as const,
      schemesUnlocked: 4,
      validity: 'Valid until March 2027',
    },
    {
      key: 'doc_caste_cert',
      title: 'Caste / Community Certificate',
      authority: 'Sub-Divisional Officer (SDO)',
      status: 'AVAILABLE' as const,
      schemesUnlocked: 3,
      validity: 'Permanent / Lifetime',
    },
    {
      key: 'doc_domicile_cert',
      title: 'Domicile / Residence Certificate',
      authority: 'District Magistrate / e-District',
      status: 'IN_PROGRESS' as const,
      schemesUnlocked: 2,
      validity: 'Application Ref #ED-2026-8819',
    },
    {
      key: 'doc_ration_card',
      title: 'Ration Card (NFSA / BPL)',
      authority: 'Food & Civil Supplies Department',
      status: 'NOT_AVAILABLE' as const,
      schemesUnlocked: 3,
      validity: 'Not yet recorded',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="eligible">Cross-Scheme Document Intelligence</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Universal Document Vault
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Record your document readiness once. Sahayak automatically maps it across all eligible welfare schemes.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Add Document Record
        </Button>
      </div>

      {/* High-Leverage Document Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-900">
            High-Leverage Recommendation
          </h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Obtaining your <strong>Ration Card (NFSA / BPL)</strong> will unlock application readiness for <strong>3 additional schemes</strong> you potentially qualify for.
          </p>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.key} className="flex flex-col justify-between">
            <CardHeader className="p-5 pb-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  {doc.key}
                </span>
                <Badge
                  variant={
                    doc.status === 'AVAILABLE'
                      ? 'eligible'
                      : doc.status === 'IN_PROGRESS'
                      ? 'unknown'
                      : 'notEligible'
                  }
                  size="sm"
                >
                  {doc.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <CardTitle className="text-base">{doc.title}</CardTitle>
              <CardDescription className="text-xs">
                Issuer: {doc.authority}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{doc.validity}</span>
                <span className="font-semibold text-emerald-700">
                  Unlocks {doc.schemesUnlocked} Schemes
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm">
                  Update Status
                </Button>
                <a
                  href="https://services.india.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1"
                >
                  <span>How to Apply</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Supabase document tracking and status mutations will be wired in <strong>Phase 3</strong>.
      </div>
    </div>
  );
};
