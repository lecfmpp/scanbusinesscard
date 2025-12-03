-- Create events table for organizing scanned leads
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies for events
CREATE POLICY "Users can view their own events"
ON public.events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
ON public.events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
ON public.events FOR DELETE
USING (auth.uid() = user_id);

-- Add user_id and event_id to business_cards
ALTER TABLE public.business_cards 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

-- Drop the old public access policy
DROP POLICY IF EXISTS "Allow all access to business cards" ON public.business_cards;

-- Create new user-scoped RLS policies for business_cards
CREATE POLICY "Users can view their own business cards"
ON public.business_cards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business cards"
ON public.business_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business cards"
ON public.business_cards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business cards"
ON public.business_cards FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for events updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();