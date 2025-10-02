import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Download, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

export interface BusinessCard {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
}

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCards: BusinessCard[] = location.state?.cards || [];
  
  const [cards, setCards] = useState<BusinessCard[]>(initialCards);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [savingCards, setSavingCards] = useState<Set<string>>(new Set());
  const [phoneErrors, setPhoneErrors] = useState<Map<string, string>>(new Map());

  const toggleCard = (id: string) => {
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

  const copySelected = () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one card");
      return;
    }

    // Create TSV (tab-separated) format for Google Sheets
    const headers = ["Full Name", "Job Title", "Company", "Email", "Phone", "Website"];
    const rows = selected.map(c => [
      c.fullName,
      c.jobTitle,
      c.company,
      c.email,
      c.phone,
      c.website
    ]);
    
    const tsv = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    
    navigator.clipboard.writeText(tsv);
    toast.success(`Copied ${selected.length} card${selected.length > 1 ? 's' : ''} to clipboard`);
  };

  const exportSelected = () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one card");
      return;
    }

    // Create CSV
    const headers = ["Full Name", "Job Title", "Company", "Email", "Phone", "Website"];
    const rows = selected.map(c => [
      c.fullName,
      c.jobTitle,
      c.company,
      c.email,
      c.phone,
      c.website
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `business-cards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("CSV file downloaded");
  };

  const updateCardField = (id: string, field: keyof BusinessCard, value: string) => {
    // Handle phone number validation and formatting
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
          const formattedPhone = phoneNumber.format('E.164'); // +[country code][number]
          errors.delete(id);
          setPhoneErrors(errors);
          setCards(cards.map(c => c.id === id ? { ...c, [field]: formattedPhone } : c));
        } else {
          errors.set(id, 'Invalid phone number format');
          setPhoneErrors(errors);
          setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
        }
      } catch (error) {
        errors.set(id, 'Invalid phone number. Include country code (e.g., +1 for US)');
        setPhoneErrors(errors);
        setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
      }
    } else {
      setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
    }
  };

  const saveCard = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    // Check for phone validation errors before saving
    if (phoneErrors.has(cardId)) {
      toast.error("Please fix phone number errors before saving");
      return;
    }

    setSavingCards(prev => new Set(prev).add(cardId));

    try {
      const { error } = await (supabase as any)
        .from('business_cards')
        .upsert({
          id: card.id,
          full_name: card.fullName,
          job_title: card.jobTitle,
          company: card.company,
          email: card.email,
          phone: card.phone,
          website: card.website,
        });

      if (error) throw error;
      toast.success("Card saved successfully");
    } catch (error) {
      toast.error("Failed to save card");
      console.error(error);
    } finally {
      setSavingCards(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }
  };

  const saveSelectedCards = async () => {
    const selected = cards.filter(c => selectedCards.has(c.id));
    if (selected.length === 0) {
      toast.error("Please select at least one card");
      return;
    }

    // Check for phone validation errors in selected cards
    const hasErrors = selected.some(card => phoneErrors.has(card.id));
    if (hasErrors) {
      toast.error("Please fix phone number errors before saving");
      return;
    }

    setSavingCards(new Set(selected.map(c => c.id)));

    try {
      const { error } = await (supabase as any)
        .from('business_cards')
        .upsert(
          selected.map(card => ({
            id: card.id,
            full_name: card.fullName,
            job_title: card.jobTitle,
            company: card.company,
            email: card.email,
            phone: card.phone,
            website: card.website,
          }))
        );

      if (error) throw error;
      toast.success(`Saved ${selected.length} card${selected.length > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error("Failed to save cards");
      console.error(error);
    } finally {
      setSavingCards(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            MyBusinessCards<span className="text-accent">.ai</span>
          </h1>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">History</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <span>Account</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Results</h2>
              <p className="text-muted-foreground">
                {cards.length} business card{cards.length !== 1 ? 's' : ''} extracted. 
                <span className="ml-1">
                  ({selectedCards.size} selected)
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedCards.size > 1 && (
                <Button
                  onClick={saveSelectedCards}
                  disabled={savingCards.size > 0}
                >
                  <Save className="h-4 w-4" />
                  Save All Selected
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={copySelected}
                disabled={selectedCards.size === 0}
              >
                <Copy className="h-4 w-4" />
                Copy Selected
              </Button>
              <Button
                variant="secondary"
                onClick={exportSelected}
                disabled={selectedCards.size === 0}
              >
                <Download className="h-4 w-4" />
                Export Selected
              </Button>
              <Button onClick={() => navigate("/")}>
                <Upload className="h-4 w-4" />
                New Scan
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedCards.size === cards.length && cards.length > 0}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="p-4 text-left font-semibold text-sm">FULL NAME</th>
                  <th className="p-4 text-left font-semibold text-sm">JOB TITLE</th>
                  <th className="p-4 text-left font-semibold text-sm">COMPANY</th>
                  <th className="p-4 text-left font-semibold text-sm">EMAIL</th>
                  <th className="p-4 text-left font-semibold text-sm">PHONE</th>
                  <th className="p-4 text-left font-semibold text-sm">WEBSITE</th>
                  <th className="p-4 text-left font-semibold text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedCards.has(card.id)}
                        onCheckedChange={() => toggleCard(card.id)}
                        aria-label={`Select ${card.fullName}`}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={card.fullName}
                        onChange={(e) => updateCardField(card.id, 'fullName', e.target.value)}
                        className="min-w-[120px]"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={card.jobTitle}
                        onChange={(e) => updateCardField(card.id, 'jobTitle', e.target.value)}
                        className="min-w-[120px]"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={card.company}
                        onChange={(e) => updateCardField(card.id, 'company', e.target.value)}
                        className="min-w-[120px]"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={card.email}
                        onChange={(e) => updateCardField(card.id, 'email', e.target.value)}
                        className="min-w-[150px]"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <Input
                          value={card.phone}
                          onChange={(e) => updateCardField(card.id, 'phone', e.target.value)}
                          className={`min-w-[120px] ${phoneErrors.has(card.id) ? 'border-destructive' : ''}`}
                          placeholder="+1 234 567 8900"
                        />
                        {phoneErrors.has(card.id) && (
                          <span className="text-xs text-destructive">{phoneErrors.get(card.id)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <Input
                        value={card.website}
                        onChange={(e) => updateCardField(card.id, 'website', e.target.value)}
                        className="min-w-[150px]"
                      />
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        onClick={() => saveCard(card.id)}
                        disabled={savingCards.has(card.id)}
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Results;
