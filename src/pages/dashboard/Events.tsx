import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Plus, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useScanCards } from "@/hooks/useScanCards";
import ScanningAnimation from "@/components/ScanningAnimation";
import SignupModal from "@/components/SignupModal";
import EventSelectModal from "@/components/EventSelectModal";

interface EventWithCount {
  id: string;
  name: string;
  created_at: string;
  leads_count: number;
}

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    triggerScan,
    isProcessing,
    pendingCards,
    showSignupModal,
    setShowSignupModal,
    showEventModal,
    setShowEventModal,
    handleSignupSuccess,
    handleEventSelected,
    FileInput,
    PaywallDialog,
    subscription,
  } = useScanCards();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      const eventsWithCounts: EventWithCount[] = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('business_cards')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            ...event,
            leads_count: count || 0,
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Skeletons rather than a centred spinner: they hold the final layout, so the
  // page settles into place instead of jumping when the data lands.
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="mb-6 h-24 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
              <Skeleton className="mb-3 h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {isProcessing && <ScanningAnimation />}
      <FileInput />
      <PaywallDialog />
      
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        leadsCount={pendingCards.length}
        onSuccess={handleSignupSuccess}
      />
      
      <EventSelectModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventSelected={handleEventSelected}
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground mt-1">
              Organize your leads by events and conferences
            </p>
          </div>
          <Button onClick={triggerScan} className="hidden sm:flex">
            <Camera className="h-4 w-4 mr-2" />
            Scan New Cards
          </Button>
        </div>

        {/* Usage meter. Showing the balance before it runs out turns the paywall
            into an expected next step rather than a wall the user hits blind. */}
        {!subscription.loading && subscription.scansLimit > 0 && (
          <div className="mb-6 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {subscription.scansRemaining} of {subscription.scansLimit} scans left
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscription.subscribed && !subscription.inTrial
                    ? "Resets at the end of your billing period"
                    : "Free trial"}
                </p>
              </div>
              {!subscription.subscribed || subscription.inTrial ? (
                <Button size="sm" variant="outline" onClick={() => navigate("/dashboard/billing")}>
                  Upgrade
                </Button>
              ) : null}
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(100, (subscription.scansUsed / subscription.scansLimit) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by scanning your first business cards from an event
            </p>
            <Button onClick={triggerScan}>
              <Camera className="h-4 w-4 mr-2" />
              Scan Your First Cards
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card
                key={event.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/50"
                onClick={() => navigate(`/dashboard/leads/${event.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{event.leads_count} lead{event.leads_count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Mobile FAB. Offset clears the tab bar (h-16) plus the home indicator,
            which the old bottom-6 sat directly on top of. */}
        <Button
          onClick={triggerScan}
          className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)] h-14 w-14 rounded-full shadow-lg sm:hidden"
          size="icon"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};

export default Events;
