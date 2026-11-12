/**
 * SAHAYAK RAG Context Retrieval Engine
 *
 * Grounded retrieval process:
 * 1. Analyzes user query for scheme names, keywords, and document taxonomy.
 * 2. Retrieves verified scheme database records and gazette rules.
 * 3. Extracts official source URLs, ministry notices, and turnaround estimates.
 * 4. Flags uncertainty when sources are unavailable.
 */

import { VERIFIED_SCHEMES } from '@/data/mockSchemes';
import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';
import {
  RAGContext,
  GroundedSchemeData,
  AssistantSourceReference,
} from './types';

export function retrieveRAGContext(query: string): RAGContext {
  const q = query.toLowerCase().trim();

  // 1. Match Schemes
  const matchedSchemes: GroundedSchemeData[] = [];
  const sources: AssistantSourceReference[] = [];

  for (const s of VERIFIED_SCHEMES) {
    const titleMatch =
      q.includes(s.short_title.toLowerCase()) ||
      q.includes(s.official_name.toLowerCase()) ||
      q.includes(s.slug.replace(/-/g, ' '));

    // Keyword heuristics
    let keywordMatch = false;
    if (s.id === 'sch-pm-kisan' && (q.includes('kisan') || q.includes('farmer') || q.includes('6000') || q.includes('pm kisan') || q.includes('pmkisan'))) {
      keywordMatch = true;
    } else if (
      s.id === 'sch-ayushman-pmjay' &&
      (q.includes('ayushman') || q.includes('pmjay') || q.includes('pm-jay') || q.includes('5 lakh') || q.includes('hospital') || q.includes('golden card'))
    ) {
      keywordMatch = true;
    } else if (
      s.id === 'sch-post-matric-sc' &&
      (q.includes('post matric') || q.includes('post-matric') || q.includes('scholarship') || q.includes('tuition fee') || (q.includes('sc') && q.includes('student')))
    ) {
      keywordMatch = true;
    } else if (
      s.id === 'sch-yuva-nidhi' &&
      (q.includes('yuva') || q.includes('nidhi') || q.includes('unemployment') || (q.includes('karnataka') && q.includes('graduate')))
    ) {
      keywordMatch = true;
    } else if (
      s.id === 'sch-sukanya-samriddhi' &&
      (q.includes('sukanya') || q.includes('samriddhi') || q.includes('ssy') || q.includes('girl child') || q.includes('beti'))
    ) {
      keywordMatch = true;
    }

    if (titleMatch || keywordMatch) {
      // Map documents
      const docs = s.required_document_keys.map((key) => {
        const u = UNIVERSAL_DOCUMENTS.find((d) => d.canonical_key === key);
        return {
          canonicalKey: key,
          title: u?.title || key,
          issuingAuthority: u?.issuing_authority || 'Competent Issuing Authority',
          validityPeriod: u?.validity_period || 'Perpetual',
          howToObtainUrl: u?.how_to_obtain_url,
        };
      });

      // Map rules
      const rules = s.eligibility_rules.conditions.map((rawC: any) => ({
        field: rawC.field,
        operator: rawC.operator,
        expectedValue: rawC.value,
        label: rawC.label,
      }));

      matchedSchemes.push({
        id: s.id,
        officialName: s.official_name,
        shortTitle: s.short_title,
        slug: s.slug,
        governmentLevel: s.government_level,
        beneficiaryCategory: s.beneficiary_category,
        departmentName: s.department_name,
        briefDescription: s.brief_description,
        detailedBenefits: s.detailed_benefits,
        financialBenefitAmount: s.financial_benefit_amount,
        officialPortalName: s.official_portal_name,
        officialApplicationUrl: s.official_application_url,
        officialSourceUrl: s.official_source_url,
        lastVerifiedAt: s.last_verified_at,
        requiredDocuments: docs,
        eligibilityRules: rules,
      });

      // Add official source references
      sources.push({
        title: `${s.short_title} Official Gazette & Guidelines`,
        url: s.official_source_url,
        sourceType: 'GAZETTE',
        lastCheckedDate: s.last_verified_at,
        departmentName: s.department_name,
      });

      sources.push({
        title: `${s.official_portal_name} Application Portal`,
        url: s.official_application_url,
        sourceType: 'OFFICIAL_PORTAL',
        lastCheckedDate: s.last_verified_at,
        departmentName: s.department_name,
      });
    }
  }

  // 2. Match Universal Documents
  const matchedDocuments: RAGContext['matchedDocuments'] = [];

  for (const doc of UNIVERSAL_DOCUMENTS) {
    const docTitle = doc.title.toLowerCase();
    const docKey = doc.canonical_key.toLowerCase();

    const matchesDoc =
      q.includes(docTitle) ||
      (q.includes('income') && docKey.includes('income')) ||
      (q.includes('caste') && docKey.includes('caste')) ||
      (q.includes('ration') && docKey.includes('ration')) ||
      (q.includes('passbook') && docKey.includes('passbook')) ||
      (q.includes('land') && docKey.includes('land')) ||
      (q.includes('domicile') && docKey.includes('domicile')) ||
      (q.includes('udid') && docKey.includes('disability')) ||
      (q.includes('voter') && docKey.includes('voter')) ||
      (q.includes('birth') && docKey.includes('birth')) ||
      (q.includes('seeding') && docKey.includes('aadhaar_seed'));

    if (matchesDoc) {
      matchedDocuments.push({
        canonicalKey: doc.canonical_key,
        title: doc.title,
        issuingAuthority: doc.issuing_authority,
        validityPeriod: doc.validity_period,
        howToObtainUrl: doc.how_to_obtain_url,
        approxDaysToIssue: doc.approx_days_to_issue,
      });

      if (doc.how_to_obtain_url) {
        sources.push({
          title: `${doc.title} Official Issuance Portal`,
          url: doc.how_to_obtain_url,
          sourceType: 'OFFICIAL_PORTAL',
          departmentName: doc.issuing_authority,
        });
      }
    }
  }

  // 3. Classify Query Topic
  let topic: RAGContext['topic'] = 'SCHEME_OVERVIEW';
  if (q.includes('document') || q.includes('certificate') || q.includes('paper') || q.includes('proof') || q.includes('renew')) {
    topic = 'DOCUMENT_PROCEDURE';
  } else if (q.includes('eligible') || q.includes('criteria') || q.includes('income limit') || q.includes('age') || q.includes('qualify') || q.includes('rule')) {
    topic = 'ELIGIBILITY_RULES';
  } else if (q.includes('apply') || q.includes('procedure') || q.includes('steps') || q.includes('portal') || q.includes('registration')) {
    topic = 'APPLICATION_PROCESS';
  } else if (matchedSchemes.length === 0 && matchedDocuments.length === 0) {
    topic = 'GENERAL_CIVIC';
  }

  const isConfidentMatch = matchedSchemes.length > 0 || matchedDocuments.length > 0;

  // Deduplicate sources by URL
  const uniqueSources: AssistantSourceReference[] = [];
  const seenUrls = new Set<string>();
  for (const s of sources) {
    if (!seenUrls.has(s.url)) {
      seenUrls.add(s.url);
      uniqueSources.push(s);
    }
  }

  return {
    query,
    matchedSchemes,
    matchedDocuments,
    sources: uniqueSources,
    isConfidentMatch,
    topic,
  };
}
