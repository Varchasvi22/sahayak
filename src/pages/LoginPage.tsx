import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-civic-sand min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-md space-y-4">
        {/* Top Trust Notice */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-civic-emerald bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200/80 mx-auto w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Aadhaar Privacy • Encrypted Citizen Session</span>
        </div>

        <Card className="shadow-card border-civic-border">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-civic-navy text-white font-bold flex items-center justify-center text-xl shadow-xs">
              स
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Welcome to Sahayak
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Sign in to manage your document readiness, saved schemes, and application progress.
            </CardDescription>

            {/* Auth Tab Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 mt-2">
              <button
                type="button"
                onClick={() => setAuthMode('password')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  authMode === 'password'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('magic-link')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  authMode === 'magic-link'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                One-Click Magic Link
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@example.in"
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="We will never share your email with marketing third parties."
            />

            {authMode === 'password' ? (
              <>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald" />
                    <span>Remember this device</span>
                  </label>
                  <a href="#" className="font-semibold text-civic-emerald hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Link to="/dashboard">
                  <Button variant="primary" className="w-full mt-2" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Sign In to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed">
                  We will email you a secure, password-free login link. Click it to immediately access your Sahayak profile.
                </div>
                <Link to="/dashboard">
                  <Button variant="primary" className="w-full mt-2" rightIcon={<Sparkles className="w-4 h-4" />}>
                    Send Login Link
                  </Button>
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
              New to Sahayak?{' '}
              <Link to="/register" className="font-bold text-civic-emerald hover:underline">
                Create a Free Citizen Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
