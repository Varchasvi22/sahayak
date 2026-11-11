import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

export const AuthPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg">
            स
          </div>
          <CardTitle className="text-xl">Citizen Access</CardTitle>
          <CardDescription>
            Sign in or create an account to save schemes and track your document readiness.
          </CardDescription>
          <div className="flex justify-center pt-1">
            <Badge variant="eligible" size="sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Passwordless Magic Link Supported</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="citizen@example.in"
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button variant="primary" className="w-full">
            Sign In with Email
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <Button variant="outline" className="w-full">
            Send One-Click Magic Link
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Module scheduled for full Supabase Auth wiring in <strong>Phase 2</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
