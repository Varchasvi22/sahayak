/**
 * SAHAYAK LLM Provider Registry
 */

import { LLMProvider } from '../types';
import { GroundedFallbackProvider } from './GroundedFallbackProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';

export * from './GroundedFallbackProvider';
export * from './GeminiProvider';
export * from './OpenAIProvider';

export function getActiveLLMProvider(requestedProviderId?: string): LLMProvider {
  // 1. Explicit request
  if (requestedProviderId === 'google_gemini') {
    return new GeminiProvider();
  }
  if (requestedProviderId === 'openai_compatible') {
    return new OpenAIProvider();
  }
  if (requestedProviderId === 'grounded_rules_retrieval') {
    return new GroundedFallbackProvider();
  }

  // 2. Auto-detect from server environment
  const gemini = new GeminiProvider();
  if (gemini.isConfigured()) {
    return gemini;
  }

  const openai = new OpenAIProvider();
  if (openai.isConfigured()) {
    return openai;
  }

  // 3. Reliable deterministic grounded fallback
  return new GroundedFallbackProvider();
}
