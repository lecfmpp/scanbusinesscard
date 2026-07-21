import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Download, Save, Loader2, ArrowLeft, Users, Camera, ChevronDown, Search, Trash2 } from "lucide-react";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import { useScanCards } from "@/hooks/useScanCards";
import ScanningAnimation from "@/components/ScanningAnimation";
import SignupModal from "@/components/SignupModal";
import EventSelectModal from "@/components/EventSelectModal";
import hubspotIcon from "@/assets/hubspot-icon.svg";
import slackIcon from "@/assets/slack-icon.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessCard {
  id: string;
  full_name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  event_id: string;
}

interface Event {
  id: string;
  name: string;
}

interface SlackChannel {
  id: string;
  name: string;
}

const Leads = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [savingCards, setSavingCards] = useState<Set<string>>(new Set());
  const [phoneErrors, setPhoneErrors] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // HubSpot integration state
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [hubspotLoading, setHubspotLoading] = useState(true);
  const [showHubspotDialog, setShowHubspotDialog] = useState(false);
  const [sendingToHubspot, setSendingToHubspot] = useState(false);

  // Slack integration state
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackLoading, setSlackLoading] = useState(true);
  const [showSlackDialog, setShowSlackDialog] = useState(false);
  const [sendingToSlack, setSendingToSlack] = useState(false);
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [loadingChannels, setLoadingChannels] = useState(false);

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
  } = useScanCards();

  useEffect(() => {
    fetchData();
    checkIntegrations();
  }, [eventId]);

  const checkIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('integrations_safe' as any)
        .select('provider')
        .eq('user_id', user.id) as { data: { provider: string }[] | null; error: any };

      // A denied read is indistinguishable from an empty result unless we check,
      // and silently reports connected integrations as disconnected.
      if (error) throw error;

      setHubspotConnected(data?.some(i => i.provider === 'hubspot') || false);
      setSlackConnected(data?.some(i => i.provider === 'slack') || false);
    } catch (error) {
      console.error('Error checking integrations:', error);
    } finally {
      setHubspotLoading(false);
      setSlackLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (eventId) {
        const { data: eventData } = await supabase
          .from('events')
          .select('id, name')
          .eq('id', eventId)
          .single();
        setEvent(eventData);
      }

      let query = supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data: cardsData, error } = await query;
      if (error) throw error;
      setCards(cardsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const query = searchQuery.toLowerCase();
    return cards.filter(card => 
      card.full_name.toLowerCase().includes(query) ||
      card.job_title.toLowerCase().includes(query) ||
      card.company.toLowerCase().includes(query) ||
      card.email.toLowerCase().includes(query) ||
      card.phone.includes(query)
    );
  }, [cards, searchQuery]);

  const toggleCard = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newSelected = new Set(selectedCards);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCards(newSelected);
  };

  const toggleAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(c => c.id)));
    }
  };

  const updateCardField = (id: string, field: keyof BusinessCard, value: string) => {
    if (field === 'phone') {
      const errors = new Map(phoneErrors);
      if (!value.trim()) {
        errors.delete(id);
        setPhoneErrors(errors);
        setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
        return;
      }
      try {
        if (isValidPhoneNumber(value)) {
          const phoneNumber = parsePhoneNumber(value);
          const formattedPhone = phoneNumber.format('E.164');
          errors.delete(id);
          setPhoneErrors(errors);
          setCards(cards.map(c => c.id === id ? { ...c, [field]: formattedPhone } : c));
        } else {
          errors.set(id, 'Invalid phone number format');
          setPhoneErrors(errors);
          setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
        }
      } catch {
        errors.set(id, 'Invalid phone number');
        setPhoneErrors(errors);
        setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
      }
    } else {
      setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
    }
  };

  const saveCard = async (cardId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const card = cards.find(c => c.id === cardId);
    if (!card || phoneErrors.has(cardId)) {
      toast.error("Please fix errors before saving");
      return;
    }

    setSavingCards(prev => new Set(prev).add(cardId));
    try {
      const { error } = await supabase
        .from('business_cards')
        .update({
          full_name: card.full_name,
          job_title: card.job_title,
          company: card.company,
          email: card.email,
          phone: card.phone,
          website: card.website,
        })
        .eq('id', cardId);

      if (error) throw error;
      toast.success("Card saved");
    } catch {
      toast.error("Failed to save card");
    } finally {
      setSavingCards(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }
  };

  const deleteCard = async () => {
    if (!deleteCardId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', deleteCardId);

      if (error) throw error;
      
      setCards(cards.filter(c => c.id !== deleteCardId));
      selectedCards.delete(deleteCardId);
      setSelectedCards(new Set(selectedCards));
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleting(false);
      setDeleteCardId(null);
    }
  };

  const saveAllSelected = async () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one card");
      return;
    }

    const hasErrors = selected.some(c => phoneErrors.has(c.id));
    if (hasErrors) {
      toast.error("Please fix phone number errors before saving");
      return;
    }

    const cardIds = selected.map(c => c.id);
    setSavingCards(new Set(cardIds));

    try {
      const updates = selected.map(card => 
        supabase
          .from('business_cards')
          .update({
            full_name: card.full_name,
            job_title: card.job_title,
            company: card.company,
            email: card.email,
            phone: card.phone,
            website: card.website,
          })
          .eq('id', card.id)
      );

      await Promise.all(updates);
      toast.success(`Saved ${selected.length} card(s)`);
    } catch {
      toast.error("Failed to save some cards");
    } finally {
      setSavingCards(new Set());
    }
  };

  const copySelected = () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one card");
      return;
    }
    const headers = ["Full Name", "Job Title", "Company", "Email", "Phone", "Website"];
    const rows = selected.map(c => [c.full_name, c.job_title, c.company, c.email, c.phone, c.website]);
    const tsv = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    navigator.clipboard.writeText(tsv);
    toast.success(`Copied ${selected.length} card(s) to clipboard`);
  };

  const exportSelected = () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one card");
      return;
    }
    const headers = ["Full Name", "Job Title", "Company", "Email", "Phone", "Website"];
    const rows = selected.map(c => [c.full_name, c.job_title, c.company, c.email, c.phone, c.website]);
    const csv = [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${event?.name || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded");
  };

  const sendToHubspot = async () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one lead");
      return;
    }

    setSendingToHubspot(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-to-hubspot', {
        body: { leadIds: Array.from(selectedCards) },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success > 0) {
        toast.success(`${data.success} contact${data.success > 1 ? 's' : ''} created in HubSpot!`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} contact${data.failed > 1 ? 's' : ''} failed to sync`);
      }
    } catch (error) {
      console.error('Error sending to HubSpot:', error);
      toast.error('Failed to send leads to HubSpot');
    } finally {
      setSendingToHubspot(false);
      setShowHubspotDialog(false);
    }
  };

  const openSlackDialog = async () => {
    if (selectedCards.size === 0) {
      toast.error("Please select at least one lead");
      return;
    }
    
    setShowSlackDialog(true);
    setLoadingChannels(true);
    setSelectedChannel("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('send-to-slack', {
        body: { action: 'list-channels' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setSlackChannels(data.channels || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('Failed to load Slack channels');
    } finally {
      setLoadingChannels(false);
    }
  };

  const sendToSlack = async () => {
    if (!selectedChannel) {
      toast.error("Please select a channel");
      return;
    }

    setSendingToSlack(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-to-slack', {
        body: { 
          leadIds: Array.from(selectedCards),
          channelId: selectedChannel,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success > 0) {
        toast.success(`${data.success} lead${data.success > 1 ? 's' : ''} sent to Slack!`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} lead${data.failed > 1 ? 's' : ''} failed to send`);
      }
    } catch (error) {
      console.error('Error sending to Slack:', error);
      toast.error('Failed to send leads to Slack');
    } finally {
      setSendingToSlack(false);
      setShowSlackDialog(false);
    }
  };

  const cardToDelete = cards.find(c => c.id === deleteCardId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

      <AlertDialog open={!!deleteCardId} onOpenChange={(open) => !open && setDeleteCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{cardToDelete?.full_name || "this lead"}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteCard} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* HubSpot Send Dialog */}
      <Dialog open={showHubspotDialog} onOpenChange={setShowHubspotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={hubspotIcon} alt="HubSpot" className="h-6 w-6" />
              Send to HubSpot
            </DialogTitle>
            <DialogDescription>
              Send {selectedCards.size} selected lead{selectedCards.size !== 1 ? 's' : ''} to your HubSpot CRM as contacts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHubspotDialog(false)} disabled={sendingToHubspot}>
              Cancel
            </Button>
            <Button 
              onClick={sendToHubspot} 
              disabled={sendingToHubspot}
              className="bg-[#ff7a59] hover:bg-[#ff7a59]/90"
            >
              {sendingToHubspot ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <img src={hubspotIcon} alt="" className="h-4 w-4 mr-2" />
                  Send to HubSpot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slack Send Dialog */}
      <Dialog open={showSlackDialog} onOpenChange={setShowSlackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={slackIcon} alt="Slack" className="h-6 w-6" />
              Send to Slack
            </DialogTitle>
            <DialogDescription>
              Send {selectedCards.size} selected lead{selectedCards.size !== 1 ? 's' : ''} to a Slack channel.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Select Channel</label>
            {loadingChannels ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a channel..." />
                </SelectTrigger>
                <SelectContent>
                  {slackChannels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      #{channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlackDialog(false)} disabled={sendingToSlack}>
              Cancel
            </Button>
            <Button 
              onClick={sendToSlack} 
              disabled={sendingToSlack || !selectedChannel}
              className="bg-[#4A154B] hover:bg-[#4A154B]/90"
            >
              {sendingToSlack ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <img src={slackIcon} alt="" className="h-4 w-4 mr-2" />
                  Send to Slack
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {eventId && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {event ? event.name : "All Leads"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredCards.length} lead{filteredCards.length !== 1 ? 's' : ''} ({selectedCards.size} selected)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={toggleAll} 
            size="sm"
          >
            {selectedCards.size === filteredCards.length && filteredCards.length > 0 ? "Deselect All" : "Select All"}
          </Button>
          <Button variant="secondary" onClick={saveAllSelected} disabled={selectedCards.size === 0} size="sm">
            <Save className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Save All</span>
          </Button>
          <Button variant="secondary" onClick={copySelected} disabled={selectedCards.size === 0} size="sm">
            <Copy className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button variant="secondary" onClick={exportSelected} disabled={selectedCards.size === 0} size="sm">
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          {/* HubSpot Button */}
          {hubspotLoading ? (
            <Button variant="secondary" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : hubspotConnected ? (
            <Button 
              variant="secondary" 
              onClick={() => setShowHubspotDialog(true)} 
              disabled={selectedCards.size === 0}
              size="sm"
              className="gap-1"
            >
              <img src={hubspotIcon} alt="HubSpot" className="h-4 w-4" />
              <span className="hidden sm:inline">HubSpot</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/dashboard/integrations">
                  <Button variant="secondary" size="sm" className="gap-1 opacity-60">
                    <img src={hubspotIcon} alt="HubSpot" className="h-4 w-4" />
                    <span className="hidden sm:inline">HubSpot</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connect HubSpot in Integrations</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Slack Button */}
          {slackLoading ? (
            <Button variant="secondary" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : slackConnected ? (
            <Button 
              variant="secondary" 
              onClick={openSlackDialog} 
              disabled={selectedCards.size === 0}
              size="sm"
              className="gap-1"
            >
              <img src={slackIcon} alt="Slack" className="h-4 w-4" />
              <span className="hidden sm:inline">Slack</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/dashboard/integrations">
                  <Button variant="secondary" size="sm" className="gap-1 opacity-60">
                    <img src={slackIcon} alt="Slack" className="h-4 w-4" />
                    <span className="hidden sm:inline">Slack</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connect Slack in Integrations</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Button onClick={triggerScan} size="sm">
            <Camera className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">New Scan</span>
          </Button>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {cards.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
          <p className="text-muted-foreground mb-6">
            Start scanning business cards to add leads
          </p>
          <Button onClick={triggerScan}>
            <Camera className="h-4 w-4 mr-2" />
            Scan Cards
          </Button>
        </Card>
      ) : filteredCards.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No matching leads</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Accordion type="multiple" className="w-full">
            {filteredCards.map((card) => (
              <AccordionItem key={card.id} value={card.id} className="border-b last:border-0">
                <div className="relative flex items-center gap-3 pl-4 pr-14 py-3 hover:bg-muted/30">
                  <Checkbox 
                    checked={selectedCards.has(card.id)} 
                    onCheckedChange={() => toggleCard(card.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <AccordionTrigger className="flex-1 hover:no-underline py-0 [&>svg]:hidden">
                    <div className="text-left">
                      <p className="font-medium">{card.full_name || "No name"}</p>
                      <p className="text-sm text-muted-foreground">
                        {card.job_title || "No title"}
                      </p>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-transform duration-200 [[data-state=open]_&]:rotate-180">
                      <ChevronDown className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">FULL NAME</label>
                      <Input 
                        value={card.full_name} 
                        onChange={(e) => updateCardField(card.id, 'full_name', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">JOB TITLE</label>
                      <Input 
                        value={card.job_title} 
                        onChange={(e) => updateCardField(card.id, 'job_title', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">COMPANY</label>
                      <Input 
                        value={card.company} 
                        onChange={(e) => updateCardField(card.id, 'company', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">EMAIL</label>
                      <Input 
                        value={card.email} 
                        onChange={(e) => updateCardField(card.id, 'email', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">PHONE</label>
                      <Input
                        value={card.phone}
                        onChange={(e) => updateCardField(card.id, 'phone', e.target.value)}
                        className={phoneErrors.has(card.id) ? 'border-destructive' : ''}
                      />
                      {phoneErrors.has(card.id) && (
                        <span className="text-xs text-destructive mt-1 block">{phoneErrors.get(card.id)}</span>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">WEBSITE</label>
                      <Input 
                        value={card.website} 
                        onChange={(e) => updateCardField(card.id, 'website', e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteCardId(card.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={(e) => saveCard(card.id, e)} 
                      disabled={savingCards.has(card.id)}
                    >
                      {savingCards.has(card.id) ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}
    </div>
    </>
  );
};

export default Leads;
