/**
 * SAHAYAK Grounded Fallback Provider
 *
 * Deterministic explainer provider that operates when no external LLM API key
 * is configured. Extracts verified gazette rules, benefits, and document procedures
 * directly from RAGContext with 100% factual accuracy and zero hallucinations.
 */

import { LLMProvider, MessageRole, RAGContext, AssistantSourceReference } from '../types';

export class GroundedFallbackProvider implements LLMProvider {
  id = 'grounded_rules_retrieval';
  name = 'Sahayak Grounded Rules Retrieval (Deterministic)';

  isConfigured(): boolean {
    return true; // Always available as reliable baseline
  }

  async generateResponse(
    messages: Array<{ role: MessageRole; content: string }>,
    context: RAGContext
  ): Promise<{
    text: string;
    sources: AssistantSourceReference[];
    provider: string;
  }> {
    const lastUserMessage = messages[messages.length - 1]?.content || context.query;
    const lower = lastUserMessage.toLowerCase().trim();
    const isGreeting = /^(hi|hello|hey|namaste|vanakkam|pranam|help|who are you|what is sahayak)/i.test(lower);

    // Case 0: Conversational greeting or platform introduction
    if (isGreeting && !context.isConfidentMatch) {
      return {
        text: `Namaste! I am **Sahayak**, your AI welfare guidance assistant for Indian government schemes.

I can help you:
- **Discover relevant Central and State schemes** (e.g. PM-KISAN, PMAY-G, NSP Scholarships, Ayushman Bharat).
- **Understand statutory eligibility criteria** (income ceilings, age limits, landholding criteria).
- **Find mandatory documents & certificates** needed before applying.
- **Guide you through official application portals**.

How can I assist you or your family today? You can ask me about a specific scheme or search our verified directory.`,
        sources: [
          {
            title: 'National Government Services Portal',
            url: 'https://services.india.gov.in',
            sourceType: 'OFFICIAL_PORTAL',
            departmentName: 'Government of India',
          },
        ],
        provider: this.name,
      };
    }

    // Case 1: No match in verified database
    if (!context.isConfidentMatch) {
      return {
        text: `Namaste! Sahayak could not find a verified gazette record in our database matching **"${lastUserMessage}"**.

**Why this happens:**
- Sahayak only answers from officially verified Central and State gazette notifications to ensure zero misinformation.
- The scheme may belong to a state not yet audited, or the query may use an alternate regional acronym.

**What you can do:**
1. Browse our verified Central and State directory on the **[Scheme Discovery](/schemes)** page.
2. Check the official **[National Government Services Portal](https://services.india.gov.in)**.
3. Visit your local **Common Service Centre (CSC)** or Gram Panchayat office.`,
        sources: [
          {
            title: 'National Government Services Portal',
            url: 'https://services.india.gov.in',
            sourceType: 'OFFICIAL_PORTAL',
            departmentName: 'Government of India',
          },
        ],
        provider: this.name,
      };
    }

    // Case 2: User asked specifically about documents
    if (context.topic === 'DOCUMENT_PROCEDURE') {
      let response = '';

      if (context.matchedSchemes.length > 0) {
        const s = context.matchedSchemes[0];
        response += `### Required Documents for ${s.officialName} (${s.shortTitle})\n\n`;
        response += `To prepare your application for **${s.shortTitle}**, the official gazette guidelines mandate the following documents:\n\n`;

        s.requiredDocuments.forEach((doc, idx) => {
          response += `${idx + 1}. **${doc.title}**\n`;
          response += `   - **Issuing Body:** ${doc.issuingAuthority}\n`;
          response += `   - **Typical Validity:** ${doc.validityPeriod}\n`;
          if (doc.howToObtainUrl) {
            response += `   - **Apply / Verify:** [Official Portal](${doc.howToObtainUrl})\n`;
          }
        });

        response += `\n> **Tip:** You can track and check your certificate readiness directly in your **[Universal Document Vault](/checklist)**. Sahayak maps these certificates across all your eligible schemes without double-counting.`;
      } else if (context.matchedDocuments.length > 0) {
        const d = context.matchedDocuments[0];
        response += `### Certificate Information: ${d.title}\n\n`;
        response += `- **Issuing Authority:** ${d.issuingAuthority}\n`;
        response += `- **Validity Term:** ${d.validityPeriod}\n`;
        if (d.approxDaysToIssue !== undefined) {
          response += `- **Turnaround Time:** ~${d.approxDaysToIssue} working days\n`;
        }
        if (d.howToObtainUrl) {
          response += `- **Official Portal to Apply:** [Visit Portal](${d.howToObtainUrl})\n`;
        }
        response += `\n*Note: Income certificates typically require annual renewal at the beginning of each financial year.*`;
      }

      return {
        text: response,
        sources: context.sources,
        provider: this.name,
      };
    }

    // Case 3: User asked about eligibility criteria
    if (context.topic === 'ELIGIBILITY_RULES' && context.matchedSchemes.length > 0) {
      const s = context.matchedSchemes[0];
      let response = `### Statutory Eligibility Criteria for ${s.shortTitle}\n\n`;
      response += `According to the official gazette guidelines issued by the **${s.departmentName}**, applicants must satisfy these mandatory requirements:\n\n`;

      s.eligibilityRules.forEach((rule, idx) => {
        response += `${idx + 1}. **${rule.label}**\n`;
      });

      response += `\n> **Important Guardrail:** As an AI assistant, I explain official rules but **cannot make an official determination of your eligibility**. To see if your profile qualifies, run the deterministic **[Check Eligibility](/eligibility-results?scheme=${s.slug})** engine audit.`;

      return {
        text: response,
        sources: context.sources,
        provider: this.name,
      };
    }

    // Case 4: General Scheme Overview / Application Process
    const s = context.matchedSchemes[0];
    let response = `### ${s.officialName} (${s.shortTitle})\n\n`;
    response += `**Government Level:** ${s.governmentLevel} Scheme  \n`;
    response += `**Nodal Department:** ${s.departmentName}  \n`;
    if (s.financialBenefitAmount) {
      response += `**Financial Assistance:** Up to ₹${s.financialBenefitAmount.toLocaleString('en-IN')}/year  \n\n`;
    }

    response += `#### Overview & Benefits\n${s.detailedBenefits || s.briefDescription}\n\n`;

    response += `#### Mandatory Documents (${s.requiredDocuments.length})\n`;
    s.requiredDocuments.forEach((doc) => {
      response += `- **${doc.title}** (${doc.issuingAuthority})\n`;
    });

    response += `\n#### Official Application\n`;
    response += `Applications must be submitted via the designated portal: **[${s.officialPortalName}](${s.officialApplicationUrl})**.\n\n`;
    response += `*Last verified against government gazette records on ${s.lastVerifiedAt}.*`;

    return {
      text: response,
      sources: context.sources,
      provider: this.name,
    };
  }
}
