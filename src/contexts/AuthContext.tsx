import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching citizen profile:', error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Profile fetch exception:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
      }
      setIsLoading(false);
    });

    // 2. Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase credentials are not yet configured in .env. Please add real credentials.'
        ),
      };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithOtp = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase credentials are not yet configured in .env. Please add real credentials.'
        ),
      };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard',
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase credentials are not yet configured in .env. Please add real credentials.'
        ),
      };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin + '/onboarding',
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithPassword,
        signInWithOtp,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
