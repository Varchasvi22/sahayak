import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Sahayak'),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder-anon-key'),
});

const rawEnv =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : typeof process !== 'undefined' && process.env
    ? process.env
    : {};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.warn(
    '⚠️ Missing or invalid environment variables. Falling back to defaults:',
    parsed.error.format()
  );
}

export const env = parsed.success
  ? parsed.data
  : envSchema.parse({
      VITE_APP_NAME: rawEnv.VITE_APP_NAME || 'Sahayak',
      VITE_APP_ENV: rawEnv.VITE_APP_ENV || 'development',
      VITE_SUPABASE_URL: rawEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: rawEnv.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    });
