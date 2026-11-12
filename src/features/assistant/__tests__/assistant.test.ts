/**
 * Unit Tests for Sahayak AI Guidance Assistant
 *
 * Covers:
 * 1. RAG context retrieval from verified database
 * 2. Missing sources & out-of-scope query handling (identifying uncertainty)
 * 3. Unavailable AI service fallback (zero crashes without keys)
 * 4. Refusal to fabricate approvals or invent eligibility determinations
 * 5. Provider abstraction switching
 */

import { retrieveRAGContext } from '../retrievalEngine';
import { processAssistantQuery } from '../assistantService';
import { getActiveLLMProvider, GroundedFallbackProvider, GeminiProvider } from '../providers';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function runAssistantTests() {
  console.log('--- RUNNING SAHAYAK AI ASSISTANT & RAG TESTS ---');

  // TEST 1: Grounded RAG Retrieval for Verified Scheme
  {
    console.log('Test 1: RAG context retrieval for known scheme (PM-Kisan)');
    const query = 'What documents are required for PM-Kisan Samman Nidhi?';
    const context = retrieveRAGContext(query);

    assert(context.isConfidentMatch === true, 'PM-Kisan must be a confident match');
    assert(context.matchedSchemes.length > 0, 'At least 1 scheme must be matched');
    assert(
      context.matchedSchemes[0].id === 'sch-pm-kisan',
      `Expected sch-pm-kisan, got ${context.matchedSchemes[0].id}`
    );
    assert(
      context.matchedSchemes[0].requiredDocuments.some((d) => d.canonicalKey === 'doc_bank_passbook'),
      'Bank passbook must be in required documents'
    );
    assert(context.sources.length >= 2, 'Sources must contain official gazette and portal');
    assert(context.topic === 'DOCUMENT_PROCEDURE', 'Topic must be classified as DOCUMENT_PROCEDURE');

    console.log('✓ Test 1 passed');
  }

  // TEST 2: Missing Sources & Out-of-Scope Query Handling
  {
    console.log('Test 2: Missing sources and out-of-scope query');
    const outOfScopeQuery = 'Tell me about the Mars Rover grant for lunar astronauts';
    const context = retrieveRAGContext(outOfScopeQuery);

    assert(context.isConfidentMatch === false, 'Out-of-scope query must NOT be a confident match');
    assert(context.matchedSchemes.length === 0, 'Zero schemes should match fictitious query');

    // Generate response using pipeline
    const response = await processAssistantQuery(outOfScopeQuery);

    // Verify it refuses to invent policies
    assert(
      response.answer.includes('could not find a verified gazette record') ||
      response.answer.includes('does not currently have verified'),
      'Assistant must clearly state uncertainty rather than hallucinating'
    );
    assert(
      response.sources.some((s) => s.url.includes('services.india.gov.in')),
      'Must direct citizen to official national services portal'
    );

    console.log('✓ Test 2 passed');
  }

  // TEST 3: Unavailable AI Service / Missing API Key Fallback
  {
    console.log('Test 3: Unavailable AI service fallback (zero crash without API keys)');
    const unconfiguredGemini = new GeminiProvider('fake_invalid_key_or_empty');
    const context = retrieveRAGContext('How does Post-Matric SC Scholarship work?');

    // Should gracefully execute fallback without unhandled exception
    const result = await unconfiguredGemini.generateResponse(
      [{ role: 'user', content: 'How does Post-Matric SC Scholarship work?' }],
      context
    );

    assert(Boolean(result.text), 'Response text must be generated via fallback');
    assert(result.sources.length > 0, 'Sources must be preserved from RAG context');
    assert(
      result.text.includes('Post Matric Scholarship') || result.text.includes('tuition fee'),
      'Content must be grounded in verified Post-Matric data'
    );

    console.log('✓ Test 3 passed');
  }

  // TEST 4: Refusal to Decide Statutory Eligibility
  {
    console.log('Test 4: Strict guardrail against fabricating eligibility determinations');
    const query = 'Am I eligible for PM-Kisan? I make 50 lakh per year';
    const response = await processAssistantQuery(query);

    // Assistant explains the criteria and warns citizen it cannot decide eligibility
    assert(
      response.answer.includes('cannot make an official determination') ||
      response.answer.includes('Statutory Eligibility Criteria') ||
      response.answer.includes('Check Eligibility'),
      'Assistant must redirect statutory decision to deterministic rule engine'
    );

    console.log('✓ Test 4 passed');
  }

  // TEST 5: Document Procedure & Renewal Lookup
  {
    console.log('Test 5: Certificate renewal procedure lookup (Income Certificate)');
    const query = 'How do I renew an expired Income Certificate?';
    const context = retrieveRAGContext(query);

    assert(
      context.matchedDocuments.some((d) => d.canonicalKey === 'doc_income_cert'),
      'Income Certificate must be matched'
    );
    assert(
      context.matchedDocuments[0].issuingAuthority.includes('Tehsildar') ||
      context.matchedDocuments[0].issuingAuthority.includes('Revenue'),
      'Issuing authority must reference Tehsildar / Revenue department'
    );

    const response = await processAssistantQuery(query);
    assert(
      response.answer.includes('Tehsildar') || response.answer.includes('Revenue'),
      'Answer must inform citizen of proper issuing authority'
    );

    console.log('✓ Test 5 passed');
  }

  // TEST 6: Provider Abstraction Factory
  {
    console.log('Test 6: Provider abstraction factory');
    const fallbackProvider = getActiveLLMProvider('grounded_rules_retrieval');
    assert(
      fallbackProvider instanceof GroundedFallbackProvider,
      'Requested grounded_rules_retrieval must return GroundedFallbackProvider'
    );

    const geminiProvider = getActiveLLMProvider('google_gemini');
    assert(
      geminiProvider instanceof GeminiProvider,
      'Requested google_gemini must return GeminiProvider'
    );

    console.log('✓ Test 6 passed');
  }

  console.log('\n========================================');
  console.log('ALL AI ASSISTANT & RAG TESTS PASSED!');
  console.log('========================================\n');
}

runAssistantTests();
