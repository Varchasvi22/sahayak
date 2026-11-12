/**
 * SAHAYAK OpenAI-Compatible Provider
 */

import { LLMProvider, MessageRole, RAGContext, AssistantSourceReference } from '../types';
import { ASSISTANT_SYSTEM_PROMPT, buildPromptWithContext } from '../systemPrompt';
import { GroundedFallbackProvider } from './GroundedFallbackProvider';

export class OpenAIProvider implements LLMProvider {
  id = 'openai_compatible';
  name = 'OpenAI Compatible (Grounded)';
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private fallback: GroundedFallbackProvider;

  constructor(
    apiKey?: string,
    model = 'gpt-4o-mini',
    baseUrl = 'https://api.openai.com/v1'
  ) {
    this.apiKey =
      apiKey ||
      (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY || '' : '');
    this.model = model;
    this.baseUrl = baseUrl;
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
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (!res.ok) {
        return this.fallback.generateResponse(messages, context);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        return this.fallback.generateResponse(messages, context);
      }

      return {
        text: content.trim(),
        sources: context.sources,
        provider: `${this.name} (${this.model})`,
      };
    } catch {
      return this.fallback.generateResponse(messages, context);
    }
  }
}
