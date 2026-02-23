
-- Fix: recreate view with SECURITY INVOKER
DROP VIEW IF EXISTS public.integrations_safe;
CREATE VIEW public.integrations_safe WITH (security_invoker = true) AS
SELECT id, user_id, provider, extra_data, expires_at, created_at, updated_at
FROM public.integrations;

GRANT SELECT ON public.integrations_safe TO authenticated;
GRANT SELECT ON public.integrations_safe TO anon;

-- Revoke direct SELECT on integrations table from anon/authenticated
-- so tokens can only be accessed via service role
REVOKE SELECT ON public.integrations FROM anon;
REVOKE SELECT ON public.integrations FROM authenticated;
