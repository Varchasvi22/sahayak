-- ==============================================================================
-- SAHAYAK - Migration 2: Row Level Security (RLS) Policies
-- Description: Zero-compromise data isolation and public catalog read access
-- Target: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.scheme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_tasks ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. PUBLIC SCHEME CATALOG POLICIES (Read-Only for Citizens & Unauthenticated)
-- ==============================================================================

-- Scheme Categories: Public Read
CREATE POLICY "Public can view scheme categories"
    ON public.scheme_categories FOR SELECT
    USING (true);

-- Schemes: Public Read (Only active schemes)
CREATE POLICY "Public can view active schemes"
    ON public.schemes FOR SELECT
    USING (is_active = true);

-- Eligibility Rules: Public Read for active schemes
CREATE POLICY "Public can view eligibility rules of active schemes"
    ON public.eligibility_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schemes
            WHERE public.schemes.id = public.eligibility_rules.scheme_id
            AND public.schemes.is_active = true
        )
    );

-- Scheme Documents: Public Read for active schemes
CREATE POLICY "Public can view required documents of active schemes"
    ON public.scheme_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schemes
            WHERE public.schemes.id = public.scheme_documents.scheme_id
            AND public.schemes.is_active = true
        )
    );

-- Scheme Sources: Public Read for active schemes
CREATE POLICY "Public can view verified sources of active schemes"
    ON public.scheme_sources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.schemes
            WHERE public.schemes.id = public.scheme_sources.scheme_id
            AND public.schemes.is_active = true
        )
    );

-- ==============================================================================
-- 3. ADMIN WRITE POLICIES ON CATALOG TABLES
-- ==============================================================================
-- Only service_role or users with admin JWT claim can insert, update, or delete schemes
CREATE POLICY "Admin full access to scheme categories"
    ON public.scheme_categories FOR ALL
    TO authenticated
    USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

CREATE POLICY "Admin full access to schemes"
    ON public.schemes FOR ALL
    TO authenticated
    USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

CREATE POLICY "Admin full access to eligibility rules"
    ON public.eligibility_rules FOR ALL
    TO authenticated
    USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

CREATE POLICY "Admin full access to scheme documents"
    ON public.scheme_documents FOR ALL
    TO authenticated
    USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

CREATE POLICY "Admin full access to scheme sources"
    ON public.scheme_sources FOR ALL
    TO authenticated
    USING (COALESCE(auth.jwt() ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') = 'admin');

-- ==============================================================================
-- 4. PRIVATE CITIZEN PROFILES POLICIES
-- ==============================================================================
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- ==============================================================================
-- 5. PRIVATE USER DOCUMENTS (DOCUMENT VAULT) POLICIES
-- ==============================================================================
CREATE POLICY "Users can view own document readiness records"
    ON public.user_documents FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document readiness records"
    ON public.user_documents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document readiness records"
    ON public.user_documents FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own document readiness records"
    ON public.user_documents FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. PRIVATE SAVED SCHEMES POLICIES
-- ==============================================================================
CREATE POLICY "Users can view own saved schemes"
    ON public.saved_schemes FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark schemes"
    ON public.saved_schemes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved scheme notes"
    ON public.saved_schemes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks"
    ON public.saved_schemes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. PRIVATE APPLICATION TASKS POLICIES
-- ==============================================================================
CREATE POLICY "Users can view own application tasks"
    ON public.application_tasks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own application tasks"
    ON public.application_tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own application tasks"
    ON public.application_tasks FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own application tasks"
    ON public.application_tasks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
