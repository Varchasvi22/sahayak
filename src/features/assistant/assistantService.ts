/**
 * SAHAYAK AI Assistant Core Pipeline Service
 *
 * Implements the full 7-step RAG pipeline:
 * 1. Receive user query
 * 2. Identify relevant scheme or requirement
 * 3. Retrieve verified database records
 * 4. Retrieve official guideline excerpts
 * 5. Pass grounded context to LLM provider
 * 6. Generate simple, grounded explanation
 * 7. Return supporting sources
 */

import { retrieveRAGContext } from './retrievalEngine';
import { getActiveLLMProvider } from './providers';
import { AssistantChatResponse, MessageRole } from './types';

export async function processAssistantQuery(
  userQuery: string,
  conversationHistory: Array<{ role: MessageRole; content: string }> = [],
  requestedProviderId?: string
): Promise<AssistantChatResponse> {
  const trimmed = userQuery.trim();
  if (!trimmed) {
    return {
      answer: 'Please type a question about a government welfare scheme, document requirement, or application procedure.',
      sources: [],
      provider: 'System',
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 1-4: RAG Retrieval
  const ragContext = retrieveRAGContext(trimmed);

  // 5: Resolve Provider
  const provider = getActiveLLMProvider(requestedProviderId);

  // Append latest user message to conversation history for context
  const fullMessages = [
    ...conversationHistory,
    { role: 'user' as MessageRole, content: trimmed },
  ];

  // 6-7: Generate grounded response & collect sources
  const result = await provider.generateResponse(fullMessages, ragContext);

  return {
    answer: result.text,
    sources: result.sources,
    provider: result.provider,
    evaluatedAt: new Date().toISOString(),
  };
}
