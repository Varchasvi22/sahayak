import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { INDIAN_STATES_AND_UTS } from '@/data/constants';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await signUp(email.trim(), password, name.trim());
    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-civic-sand min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-lg space-y-4">
        {/* Top Trust Notice */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-civic-emerald bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200/80 mx-auto w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Aadhaar Guarantee • Your Personal Data Never Sold</span>
        </div>

        <Card className="shadow-card border-civic-border">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-civic-navy text-white font-bold flex items-center justify-center text-xl shadow-xs">
              स
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Create Your Citizen Profile
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Unlock personalized welfare evaluations and cross-scheme document tracking.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Full Name (for display)"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="citizen@example.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Used strictly for account access and document status notifications."
              />

              <Input
                label="Create Password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Select
                label="State / Union Territory of Residence"
                options={INDIAN_STATES_AND_UTS.map((s) => ({ value: s, label: s }))}
                value={state}
                onChange={(e) => setState(e.target.value)}
                helperText="Enables instant filtering of state-specific welfare benefits."
              />

              {/* Privacy Commitments List */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5 text-[11px] text-slate-600">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-civic-emerald" />
                  <span>Our Privacy Commitments to You:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-civic-emerald" />
                  <span>We do NOT collect or store your 12-digit Aadhaar number.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-civic-emerald" />
                  <span>All evaluations run locally against verified government rules.</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account & Check Eligibility
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-civic-emerald hover:underline">
                Sign In Here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

