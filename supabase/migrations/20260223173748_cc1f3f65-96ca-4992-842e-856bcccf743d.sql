
-- Explicit DELETE deny policies for subscriptions and scan_usage tables
CREATE POLICY "Prevent user deletion of subscriptions"
ON public.subscriptions FOR DELETE
USING (false);

CREATE POLICY "Prevent user deletion of scan_usage"
ON public.scan_usage FOR DELETE
USING (false);
