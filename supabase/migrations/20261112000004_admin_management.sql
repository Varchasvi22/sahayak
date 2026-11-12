-- ==============================================================================
-- SAHAYAK - Migration 4: Admin Management, Verification & Audit Logging
-- Description: Publication statuses, reviewer metadata, scheme audit logs,
--              admin role registry, and hardened RLS policies.
-- Target: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. ADD PUBLICATION & VERIFICATION COLUMNS TO SCHEMES
ALTER TABLE public.schemes
    ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'VERIFIED'
    CHECK (publication_status IN ('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'NEEDS_REVIEW', 'ARCHIVED'));

ALTER TABLE public.schemes
    ADD COLUMN IF NOT EXISTS verified_by_id UUID REFERENCES auth.users(id);

ALTER TABLE public.schemes
    ADD COLUMN IF NOT EXISTS verified_by_name TEXT DEFAULT 'Ministry Gazette Officer';

ALTER TABLE public.schemes
    ADD COLUMN IF NOT EXISTS audit_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_schemes_publication_status ON public.schemes(publication_status);

-- 2. CREATE SCHEME AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.scheme_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN (
        'SCHEME_CREATED',
        'SCHEME_UPDATED',
        'STATUS_CHANGED',
        'PUBLICATION_STATUS_CHANGED',
        'SCHEME_DEACTIVATED',
        'SCHEME_REACTIVATED',
        'RULES_UPDATED',
        'DOCUMENTS_UPDATED',
        'SOURCES_UPDATED'
    )),
    performed_by_id UUID,
    performed_by_name TEXT NOT NULL,
    performed_by_email TEXT,
    previous_state JSONB,
    new_state JSONB,
    change_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_scheme_id ON public.scheme_audit_logs(scheme_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.scheme_audit_logs(created_at DESC);

-- 3. CREATE ADMIN ROLES TABLE
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'REVIEWER')),
    assigned_by UUID,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. FUNCTION TO CHECK ADMIN AUTHORIZATION
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. Check if user ID is in admin_roles table
    IF EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE public.admin_roles.user_id = COALESCE(check_user_id, auth.uid())
    ) THEN
        RETURN true;
    END IF;

    -- 2. Check if JWT user metadata specifies admin
    IF COALESCE(auth.jwt() ->> 'role', '') = 'admin'
       OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
       OR COALESCE(auth.jwt() -> 'user_metadata' ->> 'is_admin', 'false') = 'true' THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.scheme_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 6. AUDIT LOGS POLICIES (Admins only)
CREATE POLICY "Admins can view audit logs"
    ON public.scheme_audit_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
    ON public.scheme_audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- 7. ADMIN ROLES POLICIES
CREATE POLICY "Admins can view admin roles"
    ON public.admin_roles FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 8. CITIZENS ONLY SEE VERIFIED AND ACTIVE SCHEMES
-- Replace existing public schemes policy with publication status check
DROP POLICY IF EXISTS "Public can view active schemes" ON public.schemes;
CREATE POLICY "Public can view verified and active schemes"
    ON public.schemes FOR SELECT
    USING (
        (is_active = true AND publication_status = 'VERIFIED')
        OR public.is_admin()
    );

-- 9. ADMIN WRITE POLICIES ON SCHEMES
DROP POLICY IF EXISTS "Admin full access to schemes" ON public.schemes;
CREATE POLICY "Admin full access to schemes"
    ON public.schemes FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access to eligibility rules" ON public.eligibility_rules;
CREATE POLICY "Admin full access to eligibility rules"
    ON public.eligibility_rules FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access to scheme documents" ON public.scheme_documents;
CREATE POLICY "Admin full access to scheme documents"
    ON public.scheme_documents FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access to scheme sources" ON public.scheme_sources;
CREATE POLICY "Admin full access to scheme sources"
    ON public.scheme_sources FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
