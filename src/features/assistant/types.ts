/**
 * SAHAYAK AI Scheme Guidance Assistant Types
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface AssistantSourceReference {
  title: string;
  url: string;
  sourceType: 'GAZETTE' | 'GUIDELINES_PDF' | 'MINISTRY_PORTAL' | 'PRESS_RELEASE' | 'OFFICIAL_PORTAL';
  lastCheckedDate?: string;
  departmentName?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: AssistantSourceReference[];
  timestamp: string;
  isError?: boolean;
  provider?: string;
}

export interface GroundedSchemeData {
  id: string;
  officialName: string;
  shortTitle: string;
  slug: string;
  governmentLevel: 'CENTRAL' | 'STATE';
  beneficiaryCategory: string;
  departmentName: string;
  briefDescription: string;
  detailedBenefits: string;
  financialBenefitAmount?: number;
  officialPortalName: string;
  officialApplicationUrl: string;
  officialSourceUrl: string;
  lastVerifiedAt: string;
  requiredDocuments: Array<{
    canonicalKey: string;
    title: string;
    issuingAuthority: string;
    validityPeriod: string;
    howToObtainUrl?: string;
  }>;
  eligibilityRules: Array<{
    field: string;
    operator: string;
    expectedValue: any;
    label: string;
  }>;
}

export interface RAGContext {
  query: string;
  matchedSchemes: GroundedSchemeData[];
  matchedDocuments: Array<{
    canonicalKey: string;
    title: string;
    issuingAuthority: string;
    validityPeriod: string;
    howToObtainUrl?: string;
    approxDaysToIssue?: number;
  }>;
  sources: AssistantSourceReference[];
  isConfidentMatch: boolean;
  topic:
    | 'SCHEME_OVERVIEW'
    | 'DOCUMENT_PROCEDURE'
    | 'ELIGIBILITY_RULES'
    | 'APPLICATION_PROCESS'
    | 'GENERAL_CIVIC';
}

export interface LLMProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  generateResponse(
    messages: Array<{ role: MessageRole; content: string }>,
    context: RAGContext
  ): Promise<{
    text: string;
    sources: AssistantSourceReference[];
    provider: string;
  }>;
}

export interface AssistantChatRequest {
  message: string;
  conversationHistory?: Array<{ role: MessageRole; content: string }>;
}

export interface AssistantChatResponse {
  answer: string;
  sources: AssistantSourceReference[];
  provider: string;
  evaluatedAt: string;
}
