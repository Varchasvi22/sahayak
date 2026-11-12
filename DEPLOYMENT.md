# SAHAYAK (सहायक) - Production Deployment Guide 🚀

This document outlines the end-to-end production setup, Supabase migration procedure, Vercel configuration, and security verification required to deploy Sahayak to production.

---

## 📋 Pre-Deployment Checklist

- [x] All 6 automated test suites passing (`npm run test`)
- [x] TypeScript compiler passes with 0 errors (`npm run type-check`)
- [x] Production bundle successfully minified & chunked under 500 kB (`npm run build`)
- [x] Client SPA rewrites and security headers configured (`vercel.json`)
- [x] Row Level Security (RLS) policies verified on all 9 database tables
- [x] Zero Aadhaar collection / Zero document scan upload architecture strictly upheld
- [x] No `service_role` or secret keys included in client build

---

## 🗄️ 1. Supabase Production Database Setup

### Step 1.1: Create a Production Project
1. Log in to [Supabase Management Console](https://supabase.com/dashboard).
2. Create a new organization / project:
   - **Project Name:** `sahayak-production`
   - **Region:** `ap-south-1` (Mumbai, India - lowest latency for Indian citizens)
   - **Database Password:** Store securely in password manager.

### Step 1.2: Execute Database Migrations (in exact order)
Navigate to **SQL Editor** in your Supabase dashboard and run the migrations from the `supabase/migrations/` directory:

1. **Migration 1 - Base Schema:**
   - File: [`supabase/migrations/20261112000001_initial_schema.sql`](file:///C:/Users/varch/codes/OOPS_Project/supabase/migrations/20261112000001_initial_schema.sql)
   - Creates: `scheme_categories`, `schemes`, `eligibility_rules`, `scheme_documents`, `scheme_sources`, `profiles`, `user_documents`, `saved_schemes`, `application_tasks`, and triggers.

2. **Migration 2 - Row Level Security (RLS) Policies:**
   - File: [`supabase/migrations/20261112000002_rls_policies.sql`](file:///C:/Users/varch/codes/OOPS_Project/supabase/migrations/20261112000002_rls_policies.sql)
   - Enforces: Strict user isolation (`auth.uid() = user_id`) on all citizen vaults and read-only access for active public schemes.

3. **Migration 3 - Statutory Seed Data:**
   - File: [`supabase/migrations/20261112000003_seed_verified_data.sql`](file:///C:/Users/varch/codes/OOPS_Project/supabase/migrations/20261112000003_seed_verified_data.sql)
   - Populates: Verified Central & State initiatives (PM-Kisan, Ayushman Bharat, Post-Matric SC, Yuva Nidhi, SSY) with official gazette URLs.

4. **Migration 4 - Scheme Governance & Admin Auditing:**
   - File: [`supabase/migrations/20261112000004_admin_management.sql`](file:///C:/Users/varch/codes/OOPS_Project/supabase/migrations/20261112000004_admin_management.sql)
   - Creates: Publication status taxonomy (`DRAFT`, `PENDING_VERIFICATION`, `VERIFIED`, `NEEDS_REVIEW`, `ARCHIVED`), `scheme_audit_logs`, `admin_roles`, and audit triggers.

### Step 1.3: Enable Supabase Authentication
1. Go to **Authentication -> Providers -> Email**:
   - Enable **Email provider**.
   - (Optional) Toggle **Confirm email** based on requirements.
2. In **URL Configuration**:
   - **Site URL:** `https://your-production-domain.vercel.app`
   - **Redirect URLs:** Add `https://your-production-domain.vercel.app/**`

---

## ☁️ 2. Vercel Deployment Configuration

### Step 2.1: Project Import
1. Connect your GitHub repository to Vercel.
2. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 2.2: Environment Variables Configuration
In **Vercel Project Settings -> Environment Variables**, configure:

| Variable Name | Environment | Value Description | Example / Notes |
|---|---|---|---|
| `VITE_APP_NAME` | All | Application Title | `Sahayak` |
| `VITE_APP_ENV` | Production | Runtime Mode | `production` |
| `VITE_SUPABASE_URL` | All | Supabase API URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | All | Supabase Public Anon Key | Browser-safe anon key (RLS enforced) |
| `GEMINI_API_KEY` | Server / Edge | Google Gemini LLM API Key | Keep secret (never prefix with `VITE_`) |

> [!CAUTION]
> Never set `SUPABASE_SERVICE_ROLE_KEY` as a client-side environment variable. Only the public `anon` key is safe for client applications.

### Step 2.3: SPA Routing & Security Headers
Vercel automatically applies [`vercel.json`](file:///C:/Users/varch/codes/OOPS_Project/vercel.json) from the repository root:
- Rewrites all client routes (`/dashboard`, `/schemes/*`, `/vault`, etc.) to `/index.html`.
- Imposes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.
- Caches immutable assets in `/assets/` for 1 year (`max-age=31536000`).

---

## 🔒 3. Production Security & Data Integrity Verification

After deployment, perform this 5-point verification on the live domain:

1. **RLS Verification:**
   - Sign up with User A and create a document record.
   - Sign up with User B in an Incognito window and ensure User A's documents, profile, and tasks are completely invisible.
2. **Catalog Read Access:**
   - Open `/schemes` without logging in. All verified schemes must be visible with official URLs.
3. **Admin Gate Protection:**
   - Attempt to access `/admin` with a standard citizen account. The system must display the `AdminAuthGate` and block mutations.
4. **AI Assistant Fallback:**
   - Ask a question in `/assistant`. If the Gemini API is unreachable or rate-limited, verify that grounded fallback rules provide verified answers with 0 hallucinations.
5. **Zero Aadhaar Verification:**
   - Confirm that nowhere across onboarding, profile, or document vault is a 12-digit Aadhaar requested or stored.

---

## 🔄 4. Rollback & Maintenance Plan

- **Vercel Instant Rollback:** In Vercel Dashboard -> Deployments, select any previous healthy deployment and click **Instant Rollback**.
- **Supabase Point-in-Time Recovery (PITR):** Enable automated daily backups in Supabase Project Settings -> Database -> Backups.
