import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithPassword, signInWithOtp } = useAuth();
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await signInWithPassword(email.trim(), password);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please provide an email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await signInWithOtp(email.trim());
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setMagicLinkSent(true);
    }
  };

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
                onClick={() => {
                  setAuthMode('password');
                  setErrorMessage(null);
                }}
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
                onClick={() => {
                  setAuthMode('magic-link');
                  setErrorMessage(null);
                }}
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
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {magicLinkSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold">Magic login link dispatched!</p>
                <p className="text-slate-600">
                  Please check your inbox at <strong>{email}</strong> and click the link to sign in.
                </p>
                <button
                  type="button"
                  onClick={() => setMagicLinkSent(false)}
                  className="text-emerald-700 underline font-semibold block mx-auto pt-2"
                >
                  Back to login options
                </button>
              </div>
            ) : authMode === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.in"
                  leftIcon={<Mail className="w-4 h-4" />}
                  helperText="We will never share your email with marketing third parties."
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-civic-emerald focus:ring-civic-emerald"
                    />
                    <span>Remember this device</span>
                  </label>
                  <Link to="/onboarding" className="font-semibold text-civic-emerald hover:underline">
                    Skip as Guest →
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Dashboard
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.in"
                  leftIcon={<Mail className="w-4 h-4" />}
                  helperText="We will email you a secure, password-free login link."
                />

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 leading-relaxed">
                  Click the link in your email to immediately access your Sahayak profile without typing a password.
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                  rightIcon={<Sparkles className="w-4 h-4" />}
                >
                  Send Login Link
                </Button>
              </form>
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

