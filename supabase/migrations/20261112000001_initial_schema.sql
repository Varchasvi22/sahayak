-- ==============================================================================
-- SAHAYAK - Migration 1: Initial Database Schema
-- Description: Core tables, foreign keys, check constraints, and performance indexes
-- Target: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. SCHEME CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.scheme_categories (
    id TEXT PRIMARY KEY, -- e.g. 'STUDENTS', 'FARMERS', 'WOMEN', 'HEALTHCARE'
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 2. SCHEMES TABLE (Verified Government Welfare Initiatives)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    official_name TEXT NOT NULL,
    short_title TEXT NOT NULL,
    description TEXT NOT NULL,
    benefits TEXT NOT NULL,
    financial_benefit_amount NUMERIC(12, 2),
    government_level TEXT NOT NULL CHECK (government_level IN ('CENTRAL', 'STATE')),
    applicable_region TEXT, -- Specific State / UT or NULL for All-India Central
    category_id TEXT NOT NULL REFERENCES public.scheme_categories(id) ON UPDATE CASCADE,
    department_name TEXT NOT NULL,
    official_application_url TEXT NOT NULL,
    official_portal_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ALWAYS_ACTIVE' CHECK (status IN ('OPEN', 'CLOSING_SOON', 'CLOSED', 'ALWAYS_ACTIVE')),
    academic_or_financial_year TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Schemes Indexes for Faceted Search
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category_id);
CREATE INDEX IF NOT EXISTS idx_schemes_gov_level ON public.schemes(government_level);
CREATE INDEX IF NOT EXISTS idx_schemes_region ON public.schemes(applicable_region);
CREATE INDEX IF NOT EXISTS idx_schemes_is_active ON public.schemes(is_active);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON public.schemes(status);

-- ==============================================================================
-- 3. ELIGIBILITY RULES TABLE (Deterministic Rule Grammar Clauses)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    field TEXT NOT NULL, -- e.g. 'annual_family_income', 'age', 'social_category'
    operator TEXT NOT NULL CHECK (operator IN (
        'EQUALS', 'NOT_EQUALS', 'LESS_THAN', 'LESS_THAN_OR_EQUAL',
        'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'BETWEEN', 'IN', 'CONTAINS'
    )),
    expected_value JSONB NOT NULL, -- Flexible typed value (number, string, array)
    rule_group TEXT NOT NULL DEFAULT 'default',
    logical_relationship TEXT NOT NULL DEFAULT 'AND' CHECK (logical_relationship IN ('AND', 'OR')),
    label TEXT NOT NULL, -- Human-readable condition description for the audit card
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_eligibility_rules_scheme_id ON public.eligibility_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_rules_field ON public.eligibility_rules(field);

-- ==============================================================================
-- 4. SCHEME DOCUMENTS TABLE (Universal Canonical Documentation Mapping)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.scheme_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    canonical_key TEXT NOT NULL, -- e.g. 'doc_income_cert', 'doc_caste_cert'
    document_name TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    additional_instructions TEXT,
    issuing_authority TEXT,
    validity_period TEXT,
    how_to_obtain_url TEXT,
    approx_days_to_issue INT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_scheme_doc_key UNIQUE (scheme_id, canonical_key)
);

CREATE INDEX IF NOT EXISTS idx_scheme_documents_scheme_id ON public.scheme_documents(scheme_id);
CREATE INDEX IF NOT EXISTS idx_scheme_documents_canonical_key ON public.scheme_documents(canonical_key);

-- ==============================================================================
-- 5. SCHEME SOURCES TABLE (Official Gazette & Verification References)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.scheme_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    official_source_url TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'GAZETTE' CHECK (source_type IN (
        'GAZETTE', 'GUIDELINES_PDF', 'MINISTRY_PORTAL', 'PRESS_RELEASE'
    )),
    last_checked_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scheme_sources_scheme_id ON public.scheme_sources(scheme_id);

-- ==============================================================================
-- 6. APPLICANT PROFILES TABLE (Private Citizen Demographics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    date_of_birth DATE,
    age INT,
    gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'TRANSGENDER', 'OTHER')),
    state_of_residence TEXT,
    district TEXT,
    residence_area TEXT CHECK (residence_area IN ('RURAL', 'URBAN', 'SEMI_URBAN')),
    annual_family_income NUMERIC(12, 2),
    social_category TEXT CHECK (social_category IN ('GENERAL', 'OBC', 'SC', 'ST', 'EWS')),
    employment_status TEXT CHECK (employment_status IN (
        'STUDENT', 'UNEMPLOYED', 'SELF_EMPLOYED', 'SALARIED_PRIVATE',
        'SALARIED_GOVERNMENT', 'FARMER', 'DAILY_WAGE_LABOUR', 'HOMEMAKER', 'RETIRED'
    )),
    occupation TEXT,
    education_level TEXT CHECK (education_level IN (
        'BELOW_10TH', 'CLASS_10_PASS', 'CLASS_12_PASS', 'DIPLOMA',
        'GRADUATE', 'POST_GRADUATE', 'DOCTORATE'
    )),
    is_student BOOLEAN DEFAULT false,
    is_differently_abled BOOLEAN DEFAULT false,
    disability_percentage NUMERIC(5, 2),
    has_bpl_card BOOLEAN DEFAULT false,
    owns_agricultural_land BOOLEAN DEFAULT false,
    additional_attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 7. USER DOCUMENTS TABLE (Citizen's Personal Document Vault)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    canonical_key TEXT NOT NULL,
    document_name TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'NOT_AVAILABLE' CHECK (
        availability_status IN ('AVAILABLE', 'IN_PROGRESS', 'NEEDS_RENEWAL', 'NOT_AVAILABLE')
    ),
    issued_date DATE,
    expiry_date DATE,
    document_reference_masked TEXT, -- Strictly masked e.g. 'XXXX-XXXX-1234'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_user_canonical_doc UNIQUE (user_id, canonical_key)
);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_canonical_key ON public.user_documents(canonical_key);

-- ==============================================================================
-- 8. SAVED SCHEMES TABLE (Citizen Bookmarks & Notes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_user_saved_scheme UNIQUE (user_id, scheme_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_schemes_user_id ON public.saved_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_schemes_scheme_id ON public.saved_schemes(scheme_id);

-- ==============================================================================
-- 9. APPLICATION TASKS TABLE (Preparation Milestones & Ack Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.application_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'DOCUMENT_PREPARATION' CHECK (
        stage IN ('DOCUMENT_PREPARATION', 'PORTAL_REGISTRATION', 'FORM_SUBMISSION', 'DISBURSEMENT_AND_TRACKING')
    ),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')
    ),
    due_date DATE,
    portal_url TEXT,
    acknowledgment_number TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_application_tasks_user_id ON public.application_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_application_tasks_scheme_id ON public.application_tasks(scheme_id);

-- ==============================================================================
-- 10. AUTOMATIC UPDATED_AT TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_schemes_updated_at ON public.schemes;
CREATE TRIGGER trigger_schemes_updated_at
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_user_documents_updated_at ON public.user_documents;
CREATE TRIGGER trigger_user_documents_updated_at
    BEFORE UPDATE ON public.user_documents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 11. AUTOMATIC PROFILE INITIALIZATION ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        TIMEZONE('utc', NOW()),
        TIMEZONE('utc', NOW())
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
