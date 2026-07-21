-- =========================================================================
-- ScanBusinessCard — full schema for a NEW Supabase project
-- Target: yvfutrzyckkeikwstovq
--
-- Consolidated from supabase/migrations/*.sql plus the business_cards
-- definition recovered from src/integrations/supabase/types.ts (its original
-- CREATE TABLE was made by Lovable before the migration export, so it does
-- not appear in the migrations folder).
--
-- Run ONCE in the SQL editor of the new project. Idempotent where practical.
-- This creates SCHEMA ONLY. Data (923 business_cards, 34 events, 2
-- integrations, 2 oauth_states) must be exported/imported separately.
-- =========================================================================

-- ---------- shared trigger function ----------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public
SECURITY INVOKER;


-- ---------- events (must exist before business_cards FK) ----------
CREATE TABLE IF NOT EXISTS public.events (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view their own events"
  ON public.events FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
CREATE POLICY "Users can create their own events"
  ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events"
  ON public.events FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own events"
  ON public.events FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ---------- business_cards ----------
CREATE TABLE IF NOT EXISTS public.business_cards (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name  TEXT NOT NULL DEFAULT '',
  job_title  TEXT NOT NULL DEFAULT '',
  company    TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  website    TEXT NOT NULL DEFAULT '',
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id   UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own business cards" ON public.business_cards;
CREATE POLICY "Users can view their own business cards"
  ON public.business_cards FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own business cards" ON public.business_cards;
CREATE POLICY "Users can create their own business cards"
  ON public.business_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own business cards" ON public.business_cards;
CREATE POLICY "Users can update their own business cards"
  ON public.business_cards FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own business cards" ON public.business_cards;
CREATE POLICY "Users can delete their own business cards"
  ON public.business_cards FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_business_cards_updated_at ON public.business_cards;
CREATE TRIGGER update_business_cards_updated_at
  BEFORE UPDATE ON public.business_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_business_cards_user  ON public.business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_business_cards_event ON public.business_cards(event_id);


-- ---------- subscriptions ----------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID NOT NULL,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  status                 TEXT NOT NULL DEFAULT 'inactive',
  plan_type              TEXT NOT NULL DEFAULT 'monthly',
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  trial_ends_at          TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Prevent user deletion of subscriptions" ON public.subscriptions;
CREATE POLICY "Prevent user deletion of subscriptions"
  ON public.subscriptions FOR DELETE USING (false);

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ---------- scan_usage ----------
CREATE TABLE IF NOT EXISTS public.scan_usage (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL,
  scan_count   INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_end   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own usage" ON public.scan_usage;
CREATE POLICY "Users can view their own usage"
  ON public.scan_usage FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.scan_usage;
CREATE POLICY "Users can insert their own usage"
  ON public.scan_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own usage" ON public.scan_usage;
CREATE POLICY "Users can update their own usage"
  ON public.scan_usage FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Prevent user deletion of scan_usage" ON public.scan_usage;
CREATE POLICY "Prevent user deletion of scan_usage"
  ON public.scan_usage FOR DELETE USING (false);

DROP TRIGGER IF EXISTS update_scan_usage_updated_at ON public.scan_usage;
CREATE TRIGGER update_scan_usage_updated_at
  BEFORE UPDATE ON public.scan_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ---------- integrations (OAuth tokens — service role only) ----------
CREATE TABLE IF NOT EXISTS public.integrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  provider      TEXT NOT NULL,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  extra_data    JSONB,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own integrations" ON public.integrations;
CREATE POLICY "Users can view their own integrations"
  ON public.integrations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own integrations" ON public.integrations;
CREATE POLICY "Users can insert their own integrations"
  ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.integrations;
CREATE POLICY "Users can update their own integrations"
  ON public.integrations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.integrations;
CREATE POLICY "Users can delete their own integrations"
  ON public.integrations FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Token-free view. security_invoker so the caller's RLS applies.
DROP VIEW IF EXISTS public.integrations_safe;
CREATE VIEW public.integrations_safe WITH (security_invoker = true) AS
SELECT id, user_id, provider, extra_data, expires_at, created_at, updated_at
FROM public.integrations;

GRANT SELECT ON public.integrations_safe TO authenticated;
GRANT SELECT ON public.integrations_safe TO anon;

-- Raw tokens are reachable only by the service role.
REVOKE SELECT ON public.integrations FROM anon;
REVOKE SELECT ON public.integrations FROM authenticated;

-- The view above is security_invoker, so it reads public.integrations with the
-- CALLER's privileges. The blanket REVOKE therefore breaks the view too — the
-- grant check fails before RLS is consulted, and every authenticated read of
-- integrations_safe errors out. Grant SELECT back on the token-free columns
-- only: RLS still limits rows to the owner (auth.uid() = user_id), while
-- access_token and refresh_token stay unreadable even on a direct query.
GRANT SELECT (id, user_id, provider, extra_data, expires_at, created_at, updated_at)
  ON public.integrations TO authenticated;


-- ---------- oauth_states (service role only) ----------
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state      TEXT NOT NULL UNIQUE,
  user_id    UUID NOT NULL,
  provider   TEXT NOT NULL,
  platform   TEXT NOT NULL DEFAULT 'web',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct access to oauth_states" ON public.oauth_states;
CREATE POLICY "No direct access to oauth_states"
  ON public.oauth_states FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state   ON public.oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON public.oauth_states(expires_at);


-- ---------- blog_posts (daily blog pipeline) ----------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  seo_title          TEXT,
  seo_description    TEXT,
  excerpt            TEXT,
  body_md            TEXT,
  body_html          TEXT,
  cover_image_url    TEXT,
  cover_image_alt    TEXT,
  og_image_url       TEXT,
  category           TEXT,
  category_color     TEXT,
  author_name        TEXT,
  author_avatar      TEXT,
  author_role        TEXT,
  focus_keyword      TEXT,
  secondary_keywords TEXT[],
  canonical_url      TEXT,
  schema_type        TEXT,
  schema_json        TEXT,
  read_time          TEXT,
  word_count         INTEGER,
  seo_score          INTEGER,
  status             TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','published','archived')),
  featured           BOOLEAN NOT NULL DEFAULT false,
  published_at       TIMESTAMPTZ,
  scheduled_for      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_status_published_idx
  ON public.blog_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public reads PUBLISHED posts only. Writes are service-role only, which is
-- what stops anyone with the anon key from publishing to your blog.
DROP POLICY IF EXISTS "public can read published posts" ON public.blog_posts;
CREATE POLICY "public can read published posts"
  ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (status = 'published');


-- ---------- verify ----------
-- SELECT table_name FROM information_schema.tables
--  WHERE table_schema='public' ORDER BY table_name;
