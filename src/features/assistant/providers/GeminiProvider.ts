/**
 * SAHAYAK Google Gemini LLM Provider
 *
 * Implements server-side RAG generation with strict grounding instructions.
 */

import { LLMProvider, MessageRole, RAGContext, AssistantSourceReference } from '../types';
import { ASSISTANT_SYSTEM_PROMPT, buildPromptWithContext } from '../systemPrompt';
import { GroundedFallbackProvider } from './GroundedFallbackProvider';

export class GeminiProvider implements LLMProvider {
  id = 'google_gemini';
  name = 'Google Gemini (Grounded)';
  private apiKey: string;
  private model: string;
  private fallback: GroundedFallbackProvider;

  constructor(apiKey?: string, model = 'gemini-1.5-flash') {
    this.apiKey =
      apiKey ||
      (typeof process !== 'undefined'
        ? process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || ''
        : '');
    this.model = model;
    this.fallback = new GroundedFallbackProvider();
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateResponse(
    messages: Array<{ role: MessageRole; content: string }>,
    context: RAGContext
  ): Promise<{
    text: string;
    sources: AssistantSourceReference[];
    provider: string;
  }> {
    if (!this.isConfigured()) {
      return this.fallback.generateResponse(messages, context);
    }

    const lastUserMessage = messages[messages.length - 1]?.content || context.query;
    const prompt = buildPromptWithContext(lastUserMessage, context);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: ASSISTANT_SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.2, // Low temperature for factual precision
          topP: 0.8,
          maxOutputTokens: 800,
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn(`Gemini API error ${res.status}, falling back to grounded retrieval.`);
        return this.fallback.generateResponse(messages, context);
      }

      const json = await res.json();
      const candidateText =
        json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText || typeof candidateText !== 'string') {
        return this.fallback.generateResponse(messages, context);
      }

      return {
        text: candidateText.trim(),
        sources: context.sources,
        provider: `${this.name} (${this.model})`,
      };
    } catch (err) {
      console.warn('Gemini request failed, falling back:', err);
      return this.fallback.generateResponse(messages, context);
    }
  }
}
