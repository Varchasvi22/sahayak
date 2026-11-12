/**
 * SAHAYAK AI System Prompt & Guardrails
 */

import { RAGContext } from './types';

export const ASSISTANT_SYSTEM_PROMPT = `You are Sahayak AI, an explanatory civic guidance assistant for Indian citizens discovering government welfare initiatives.

CRITICAL GUARDRAIL PRINCIPLES:
1. YOU ARE AN EXPLANATORY ASSISTANT ONLY.
   - You MUST NEVER state or guarantee that an applicant qualifies for a scheme.
   - Official eligibility determination in Sahayak is conducted exclusively by the Deterministic Rule Engine.
   - When asked "Am I eligible?", always explain the statutory criteria and direct the citizen to run the official "Check Eligibility" rule audit.

2. GROUNDING & FACTUAL INTEGRITY:
   - Base all answers STRICTLY on the retrieved verified context provided below.
   - NEVER invent scheme names, benefits, deadlines, or document rules.
   - If the user asks about an unverified scheme or policy not in the context, explicitly say:
     "Sahayak does not currently have verified gazette records for that scheme in our database. Please check the official portal at services.india.gov.in."
   - Never claim an application has been approved, submitted, or sanctioned.

3. TONE & ACCESSIBILITY:
   - Use clear, simple, trustworthy language suitable for everyday citizens.
   - When discussing certificates (e.g. Income, Caste, Domicile), mention the issuing authority (e.g. Tehsildar, e-District portal) and typical turnaround time.
   - Distinguish statutory legal qualifications (income limits, age, social category) from document preparation.

4. CITING SOURCES:
   - Cite the official portal or gazette URL provided in the context.
   - Keep answers concise, structured with bullet points where appropriate.
`;

export function buildPromptWithContext(
  userQuery: string,
  context: RAGContext
): string {
  let contextText = '=== RETRIEVED VERIFIED CIVIC CONTEXT ===\n';

  if (context.matchedSchemes.length > 0) {
    contextText += '\n[VERIFIED GOVERNMENT SCHEMES]:\n';
    for (const s of context.matchedSchemes) {
      contextText += `\nScheme Name: ${s.officialName} (${s.shortTitle})\n`;
      contextText += `Government Level: ${s.governmentLevel}\n`;
      contextText += `Department: ${s.departmentName}\n`;
      contextText += `Description: ${s.briefDescription}\n`;
      contextText += `Detailed Benefits: ${s.detailedBenefits}\n`;
      if (s.financialBenefitAmount) {
        contextText += `Financial Benefit: ₹${s.financialBenefitAmount.toLocaleString('en-IN')}\n`;
      }
      contextText += `Official Application Portal: ${s.officialApplicationUrl}\n`;
      contextText += `Official Source: ${s.officialSourceUrl}\n`;
      contextText += `Last Verified Date: ${s.lastVerifiedAt}\n`;

      contextText += 'Mandatory Documents:\n';
      for (const d of s.requiredDocuments) {
        contextText += ` - ${d.title} (Issued by: ${d.issuingAuthority}, Validity: ${d.validityPeriod})\n`;
      }

      contextText += 'Statutory Eligibility Rules:\n';
      for (const r of s.eligibilityRules) {
        contextText += ` - ${r.label} (Field: ${r.field} ${r.operator} ${JSON.stringify(r.expectedValue)})\n`;
      }
    }
  }

  if (context.matchedDocuments.length > 0) {
    contextText += '\n[STANDARD CERTIFICATES & APPLICATION PROCEDURES]:\n';
    for (const d of context.matchedDocuments) {
      contextText += `\nCertificate: ${d.title}\n`;
      contextText += `Issuing Authority: ${d.issuingAuthority}\n`;
      contextText += `Validity Period: ${d.validityPeriod}\n`;
      if (d.approxDaysToIssue !== undefined) {
        contextText += `Estimated Turnaround: ~${d.approxDaysToIssue} days\n`;
      }
      if (d.howToObtainUrl) {
        contextText += `Official Portal to Apply: ${d.howToObtainUrl}\n`;
      }
    }
  }

  if (!context.isConfidentMatch) {
    contextText += '\n[NOTE]: No specific verified scheme or document record matched this query in the local gazette index.\n';
  }

  contextText += '\n=== END OF CONTEXT ===\n';
  contextText += `\nCITIZEN QUESTION: "${userQuery}"\n`;
  contextText += 'Please provide a grounded, structured, and helpful explanation based strictly on the above context.';

  return contextText;
}
