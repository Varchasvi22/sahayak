import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Send, ShieldAlert } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="eligible">Grounded AI Explainer</Badge>
          <span className="text-xs text-slate-500 font-medium">Verified Scheme Context Only</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Sahayak AI Assistant
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Ask questions in simple language about verified government schemes, document procedures, and official portals.
        </p>
      </div>

      {/* Safety Guardrail Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900">Strict AI Guardrails Active</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            This assistant explains verified documentation in plain language.
            <strong> It does not judge or guarantee your eligibility</strong> (eligibility is computed exclusively by our deterministic rule engine).
          </p>
        </div>
      </div>

      {/* Chat Area Card */}
      <Card className="min-h-[380px] flex flex-col justify-between">
        <CardContent className="p-6 space-y-4">
          {/* Welcome Bot Message */}
          <div className="flex items-start gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
              स
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-800 leading-relaxed space-y-2">
              <p>
                Namaste! I am the Sahayak Scheme Assistant. You can ask me questions about any scheme in our verified database.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5">
                <span className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 cursor-pointer hover:border-emerald-400">
                  "What documents are needed for PM-Kisan?"
                </span>
                <span className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 cursor-pointer hover:border-emerald-400">
                  "How does the Post-Matric Scholarship disburse funds?"
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t border-slate-100 flex items-center gap-2">
          <Input
            placeholder="Type your question in simple English or regional terms..."
            className="flex-1"
          />
          <Button variant="primary" leftIcon={<Send className="w-4 h-4" />}>
            Ask
          </Button>
        </div>
      </Card>

      <div className="text-center p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
        Supabase Edge Function AI proxy with Gemini/Claude context grounding will be wired in <strong>Phase 4</strong>.
      </div>
    </div>
  );
};
