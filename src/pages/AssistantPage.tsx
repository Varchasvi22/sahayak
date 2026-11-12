import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { askSahayakAssistant } from '@/services/aiAssistantClient';
import { ChatMessage } from '@/features/assistant/types';
import {
  Send,
  ShieldAlert,
  Bot,
  User,
  ExternalLink,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What documents are required for PM-Kisan Samman Nidhi?',
  'What is the family income ceiling for Post-Matric SC Scholarship?',
  'How do I renew an expired Income Certificate?',
  'What benefits does Karnataka Yuva Nidhi provide?',
  'Who is eligible for Ayushman Bharat (PM-JAY)?',
];

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Namaste! I am the **Sahayak AI Guidance Assistant**.

I help you understand verified government welfare schemes, application procedures, and document requirements in simple, clear language.

Ask me about any scheme, income threshold, or certificate guidelines from our verified database!`,
      timestamp: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      provider: 'Sahayak Grounded Rules Engine',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    const userMsgId = `user-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: nowTime,
    };

    // Update conversation
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await askSahayakAssistant(textToSend, history);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        provider: response.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        'The assistant encountered a temporary connection issue. Please try again or check our verified scheme directory directly.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation cleared. Namaste! How may I assist you with government scheme information today?`,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        provider: 'Sahayak Grounded Rules Engine',
      },
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-5">
      {/* Page Title & Guardrail Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              Grounded AI Explainer
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Verified Gazette Context Only
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sahayak Scheme Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Ask in simple language about welfare eligibility rules, certificate procedures, and official portal links.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-xs text-slate-600 hover:text-slate-900 self-start sm:self-auto"
        >
          Reset Chat
        </Button>
      </div>

      {/* Safety Guardrail Banner */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
            Strict AI Safety Guarantee
          </h4>
          <p className="text-xs text-amber-900 leading-relaxed">
            This assistant explains verified documentation in plain language.
            <strong> It does not judge or determine your legal qualification.</strong> Statutory eligibility is evaluated exclusively by Sahayak's deterministic rule engine on your profile.
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-civic-emerald" />
            Suggested Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="text-xs text-left bg-white border border-slate-200 hover:border-civic-emerald hover:bg-emerald-50/30 px-3 py-1.5 rounded-xl text-slate-700 transition-all shadow-2xs"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Conversation Container */}
      <Card className="flex flex-col shadow-subtle border-civic-border overflow-hidden min-h-[460px] max-h-[70vh]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                    isUser
                      ? 'bg-civic-navy text-white'
                      : 'bg-civic-emerald text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 space-y-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-civic-navy text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Content (with simple Markdown support) */}
                  <div className="whitespace-pre-wrap space-y-2 font-normal">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>
                        {paragraph.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Sources Cards Section */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-civic-emerald" />
                        <span>Supporting Verified Sources ({msg.sources.length}):</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-civic-emerald border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs"
                          >
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[220px]">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp & Provider Attribution */}
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 ${
                      isUser ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.provider && (
                      <span className="font-mono text-[9px] opacity-80">
                        {msg.provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-civic-emerald text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-civic-emerald" />
                <span>Searching verified gazettes and generating grounded explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border-t border-red-200 text-xs text-red-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSend()}
              className="text-xs bg-white text-red-800 border-red-300"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about scheme rules, required documents, or turnaround times (Press Enter)..."
                disabled={isLoading}
                className="w-full text-xs sm:text-sm py-2.5 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-emerald resize-none disabled:opacity-50"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isLoading}
              leftIcon={<Send className="w-4 h-4" />}
              className="h-[42px] shrink-0"
            >
              Send
            </Button>
          </form>

          <div className="text-[10px] text-slate-400 mt-2 text-center">
            Sahayak AI answers exclusively from verified Central & State government records. It does not fabricate policies or guarantee approvals.
          </div>
        </div>
      </Card>
    </div>
  );
};
