/**
 * Comprehensive Fixtures for Document Intelligence Tests & Demonstration
 */

import { SchemeWithDocumentsInput } from './crossSchemeIntelligence';
import { UserDocumentItem } from './types';

export const TEST_SCHEMES_FIXTURE: SchemeWithDocumentsInput[] = [
  {
    id: 'sch-pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)',
    slug: 'pm-kisan-samman-nidhi',
    governmentLevel: 'CENTRAL',
    requiredDocs: ['doc_bank_passbook', 'doc_land_record', 'doc_aadhaar_seed'],
  },
  {
    id: 'sch-ayushman-pmjay',
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    slug: 'ayushman-bharat-pmjay',
    governmentLevel: 'CENTRAL',
    requiredDocs: ['doc_ration_card', 'doc_bank_passbook', 'doc_voter_id'],
  },
  {
    id: 'sch-post-matric-sc',
    name: 'Post Matric Scholarship for Scheduled Caste Students',
    slug: 'post-matric-scholarship-sc',
    governmentLevel: 'CENTRAL',
    requiredDocs: [
      'doc_caste_cert',
      'doc_income_cert',
      'doc_marksheet_10',
      'doc_college_id',
      'doc_bank_passbook',
    ],
  },
  {
    id: 'sch-yuva-nidhi',
    name: 'Karnataka Yuva Nidhi Unemployment Allowance Scheme',
    slug: 'karnataka-yuva-nidhi-scheme',
    governmentLevel: 'STATE',
    requiredDocs: [
      'doc_domicile_cert',
      'doc_degree_cert',
      'doc_bank_passbook',
      'doc_income_cert',
    ],
  },
  {
    id: 'sch-sukanya-samriddhi',
    name: 'Sukanya Samriddhi Account Yojana',
    slug: 'sukanya-samriddhi-yojana',
    governmentLevel: 'CENTRAL',
    requiredDocs: ['doc_birth_cert', 'doc_parent_id', 'doc_bank_passbook'],
  },
];

export const FIXTURE_USER_DOCS_EMPTY: UserDocumentItem[] = [];

export const FIXTURE_USER_DOCS_PARTIAL: UserDocumentItem[] = [
  {
    canonicalKey: 'doc_bank_passbook',
    documentName: 'Aadhaar-Seeded Bank Account Passbook',
    status: 'AVAILABLE',
    documentReferenceMasked: 'SBIN••••8892',
    issuedDate: '2024-01-10',
  },
  {
    canonicalKey: 'doc_caste_cert',
    documentName: 'Caste / Community Certificate',
    status: 'AVAILABLE',
    documentReferenceMasked: 'RD00••••124',
    issuedDate: '2021-08-15',
  },
  {
    canonicalKey: 'doc_income_cert',
    documentName: 'Income Certificate',
    status: 'EXPIRED',
    expiryDate: '2026-03-31',
    documentReferenceMasked: 'INC/••••/2025',
  },
  {
    canonicalKey: 'doc_domicile_cert',
    documentName: 'Domicile / Residence Certificate',
    status: 'NEEDS_VERIFICATION',
    notes: 'Application submitted at Nada Kacheri Bangalore South; ACK #NK-9921',
  },
];

export const FIXTURE_USER_DOCS_AUTO_EXPIRED: UserDocumentItem[] = [
  {
    canonicalKey: 'doc_bank_passbook',
    documentName: 'Aadhaar-Seeded Bank Account Passbook',
    status: 'AVAILABLE',
  },
  {
    canonicalKey: 'doc_income_cert',
    documentName: 'Income Certificate',
    status: 'AVAILABLE', // User thought it was available, but date is in the past!
    expiryDate: '2025-03-31', // Past relative to Nov 2026
    documentReferenceMasked: 'INC/2024/7781',
  },
];

export const FIXTURE_USER_DOCS_FULLY_READY: UserDocumentItem[] = [
  { canonicalKey: 'doc_bank_passbook', documentName: 'Passbook', status: 'AVAILABLE' },
  { canonicalKey: 'doc_land_record', documentName: 'Land Record', status: 'AVAILABLE' },
  { canonicalKey: 'doc_aadhaar_seed', documentName: 'Aadhaar Seeding', status: 'AVAILABLE' },
  { canonicalKey: 'doc_ration_card', documentName: 'Ration Card', status: 'AVAILABLE' },
  { canonicalKey: 'doc_voter_id', documentName: 'Voter ID', status: 'AVAILABLE' },
  { canonicalKey: 'doc_caste_cert', documentName: 'Caste Cert', status: 'AVAILABLE' },
  { canonicalKey: 'doc_income_cert', documentName: 'Income Cert', status: 'AVAILABLE', expiryDate: '2027-03-31' },
  { canonicalKey: 'doc_marksheet_10', documentName: '10th Marksheet', status: 'AVAILABLE' },
  { canonicalKey: 'doc_college_id', documentName: 'College ID', status: 'AVAILABLE' },
  { canonicalKey: 'doc_domicile_cert', documentName: 'Domicile', status: 'AVAILABLE' },
  { canonicalKey: 'doc_degree_cert', documentName: 'Degree Cert', status: 'AVAILABLE' },
  { canonicalKey: 'doc_birth_cert', documentName: 'Birth Cert', status: 'AVAILABLE' },
  { canonicalKey: 'doc_parent_id', documentName: 'Parent ID', status: 'AVAILABLE' },
];
