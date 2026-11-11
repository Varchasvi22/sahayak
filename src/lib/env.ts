import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Sahayak'),
  VITE_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder-anon-key'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.warn(
    '⚠️ Missing or invalid environment variables. Falling back to defaults:',
    parsed.error.format()
  );
}

export const env = parsed.success
  ? parsed.data
  : envSchema.parse({
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Sahayak',
      VITE_APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    });
