import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, FolderOpen } from "lucide-react";

interface Event {
  id: string;
  name: string;
  created_at: string;
}

interface EventSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventSelected: (eventId: string) => void;
}

const EventSelectModal = ({ isOpen, onClose, onEventSelected }: EventSelectModalProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [newEventName, setNewEventName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      
      // If no events exist, default to creating new
      if (!data || data.length === 0) {
        setIsCreatingNew(true);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let eventId: string;

      if (isCreatingNew) {
        if (!newEventName.trim()) {
          toast.error("Please enter an event name");
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .insert({
            user_id: user.id,
            name: newEventName.trim(),
          })
          .select()
          .single();

        if (eventError) throw eventError;
        eventId = eventData.id;
      } else {
        if (!selectedEventId) {
          toast.error("Please select an event");
          setLoading(false);
          return;
        }
        eventId = selectedEventId;
      }

      onEventSelected(eventId);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Select Event
          </DialogTitle>
          <DialogDescription>
            Which event are these business cards from?
          </DialogDescription>
        </DialogHeader>

        {loadingEvents ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {events.length > 0 && !isCreatingNew ? (
              <>
                <div className="space-y-2">
                  <Label>Choose an existing event</Label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsCreatingNew(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-event-name">Event Name</Label>
                  <Input
                    id="new-event-name"
                    placeholder="e.g., CES 2025, Tech Conference NYC"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    autoFocus
                  />
                </div>

                {events.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsCreatingNew(false)}
                  >
                    Choose existing event instead
                  </Button>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue with Scan"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventSelectModal;
