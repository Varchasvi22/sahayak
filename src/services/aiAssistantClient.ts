/**
 * SAHAYAK AI Assistant Client Service
 *
 * Communicates with the secure server-side endpoint (/api/assistant/chat).
 * If the server is offline or unavailable, gracefully falls back to local
 * deterministic grounded rules so the platform never breaks.
 */

import { AssistantChatResponse, MessageRole } from '@/features/assistant/types';
import { processAssistantQuery } from '@/features/assistant/assistantService';

export async function askSahayakAssistant(
  message: string,
  conversationHistory: Array<{ role: MessageRole; content: string }> = []
): Promise<AssistantChatResponse> {
  const trimmed = message.trim();
  if (!trimmed) {
    return {
      answer: 'Please enter a question about a government scheme or certificate requirement.',
      sources: [],
      provider: 'System',
      evaluatedAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: trimmed,
        conversationHistory,
      }),
    });

    if (res.ok) {
      const data: AssistantChatResponse = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Server assistant endpoint unreachable, using client grounded fallback:', err);
  }

  // Graceful client-side grounded fallback (zero external API keys required)
  return processAssistantQuery(trimmed, conversationHistory);
}
