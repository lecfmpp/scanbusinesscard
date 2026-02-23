
-- Create oauth_states table for secure state validation
CREATE TABLE public.oauth_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- No client access - only service role uses this table
CREATE POLICY "No direct access to oauth_states"
ON public.oauth_states FOR ALL
USING (false);

-- Create index for fast lookups
CREATE INDEX idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX idx_oauth_states_expires ON public.oauth_states(expires_at);

-- Create a secure view for the integrations table that excludes tokens
CREATE VIEW public.integrations_safe AS
SELECT id, user_id, provider, extra_data, expires_at, created_at, updated_at
FROM public.integrations;

-- Grant access to the view
GRANT SELECT ON public.integrations_safe TO authenticated;
GRANT SELECT ON public.integrations_safe TO anon;
