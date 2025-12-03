import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Download, Save, Loader2, ArrowLeft, Users, Camera, ChevronDown, Building2, Mail, Phone, Globe } from "lucide-react";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import { useScanCards } from "@/hooks/useScanCards";
import ScanningAnimation from "@/components/ScanningAnimation";
import SignupModal from "@/components/SignupModal";
import EventSelectModal from "@/components/EventSelectModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const Leads = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [savingCards, setSavingCards] = useState<Set<string>>(new Set());
  const [phoneErrors, setPhoneErrors] = useState<Map<string, string>>(new Map());

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
  } = useScanCards();

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch event if eventId is provided
      if (eventId) {
        const { data: eventData } = await supabase
          .from('events')
          .select('id, name')
          .eq('id', eventId)
          .single();
        setEvent(eventData);
      }

      // Fetch cards
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
    if (selectedCards.size === cards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(cards.map(c => c.id)));
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

  const saveAllSelected = async () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one card");
      return;
    }

    // Check for errors in selected cards
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
              {cards.length} lead{cards.length !== 1 ? 's' : ''} ({selectedCards.size} selected)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={toggleAll} 
            size="sm"
          >
            {selectedCards.size === cards.length && cards.length > 0 ? "Deselect All" : "Select All"}
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
          <Button onClick={triggerScan} size="sm">
            <Camera className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">New Scan</span>
          </Button>
        </div>
      </div>

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
      ) : (
        <Card className="overflow-hidden">
          <Accordion type="multiple" className="w-full">
            {cards.map((card) => (
              <AccordionItem key={card.id} value={card.id} className="border-b last:border-0">
                <div className="relative flex items-center gap-3 pl-4 pr-14 py-2 hover:bg-muted/30">
                  <Checkbox 
                    checked={selectedCards.has(card.id)} 
                    onCheckedChange={() => toggleCard(card.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <AccordionTrigger className="flex-1 hover:no-underline py-2 [&>svg]:hidden">
                    <div className="flex items-center text-left w-full">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{card.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {card.job_title && `${card.job_title} • `}{card.company || "No company"}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground ml-4">
                        {card.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{card.email}</span>
                          </span>
                        )}
                        {card.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{card.phone}</span>
                          </span>
                        )}
                      </div>
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
                  <div className="flex justify-end mt-4">
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
