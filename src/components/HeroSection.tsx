import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CreditCard, CheckCircle, Zap } from "lucide-react";
import IPhoneMockup from "@/components/IPhoneMockup";
import businessCardsTable from "@/assets/business-cards-table.jpg";
import ScanningAnimation from "@/components/ScanningAnimation";
import SignupModal from "@/components/SignupModal";
import EventSelectModal from "@/components/EventSelectModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BusinessCard {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
}

export const HeroSection = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingCards, setPendingCards] = useState<BusinessCard[]>([]);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for pending images after login (for users who were redirected to signup modal)
  useEffect(() => {
    const processPendingAfterLogin = async () => {
      if (!isLoggedIn) return;
      
      const pendingImages = sessionStorage.getItem('pendingBusinessCardImages');
      const pendingEventId = sessionStorage.getItem('pendingEventId');
      
      if (pendingImages && pendingEventId) {
        sessionStorage.removeItem('pendingBusinessCardImages');
        sessionStorage.removeItem('pendingEventId');
        
        const base64Images = JSON.parse(pendingImages);
        await processAndSaveCards(base64Images, pendingEventId);
      }
    };
    
    processPendingAfterLogin();
  }, [isLoggedIn]);

  const processImages = async (base64Images: string[]) => {
    setIsProcessing(true);
    toast.info("Processing business cards...");
    
    try {
      const { data, error } = await supabase.functions.invoke('scan-business-cards', {
        body: { images: base64Images }
      });
      
      if (error) throw error;
      
      const cards: BusinessCard[] = data.cards;
      
      if (cards.length === 0) {
        toast.error("No business cards detected. Please try again with a clearer image.");
        return;
      }
      
      toast.success(`Found ${cards.length} business card${cards.length !== 1 ? 's' : ''}!`);
      
      // Store cards temporarily
      setPendingCards(cards);
      
      if (!isLoggedIn) {
        // Store images for after signup
        sessionStorage.setItem('pendingBusinessCardImages', JSON.stringify(base64Images));
        setShowSignupModal(true);
      } else {
        // Show event selection modal
        setShowEventModal(true);
      }
    } catch (error) {
      console.error("Error processing cards:", error);
      toast.error("Failed to process business cards. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processAndSaveCards = async (base64Images: string[], eventId: string) => {
    setIsProcessing(true);
    
    try {
      // If we already have pending cards, use them
      let cardsToSave = pendingCards;
      
      // If no pending cards (e.g., after login redirect), process the images again
      if (cardsToSave.length === 0) {
        const { data, error } = await supabase.functions.invoke('scan-business-cards', {
          body: { images: base64Images }
        });
        
        if (error) throw error;
        cardsToSave = data.cards;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Save cards to database
      const cardsToInsert = cardsToSave.map(card => ({
        id: card.id,
        user_id: user.id,
        event_id: eventId,
        full_name: card.fullName,
        job_title: card.jobTitle,
        company: card.company,
        email: card.email,
        phone: card.phone,
        website: card.website,
      }));
      
      const { error: insertError } = await supabase
        .from('business_cards')
        .insert(cardsToInsert);
      
      if (insertError) throw insertError;
      
      toast.success(`Saved ${cardsToSave.length} lead${cardsToSave.length !== 1 ? 's' : ''} to your CRM!`);
      setPendingCards([]);
      navigate(`/dashboard/leads/${eventId}`);
    } catch (error) {
      console.error("Error saving cards:", error);
      toast.error("Failed to save cards. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    toast.success(`${files.length} image${files.length !== 1 ? 's' : ''} selected!`);
    
    const imagePromises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    const base64Images = await Promise.all(imagePromises);
    await processImages(base64Images);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSignupSuccess = async (eventId: string) => {
    setShowSignupModal(false);
    sessionStorage.setItem('pendingEventId', eventId);
    
    // Get stored images and process them
    const pendingImages = sessionStorage.getItem('pendingBusinessCardImages');
    if (pendingImages) {
      const base64Images = JSON.parse(pendingImages);
      sessionStorage.removeItem('pendingBusinessCardImages');
      sessionStorage.removeItem('pendingEventId');
      await processAndSaveCards(base64Images, eventId);
    }
  };

  const handleEventSelected = async (eventId: string) => {
    setShowEventModal(false);
    setSelectedEventId(eventId);
    
    // Save the pending cards with selected event
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || pendingCards.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const cardsToInsert = pendingCards.map(card => ({
        id: card.id,
        user_id: user.id,
        event_id: eventId,
        full_name: card.fullName,
        job_title: card.jobTitle,
        company: card.company,
        email: card.email,
        phone: card.phone,
        website: card.website,
      }));
      
      const { error } = await supabase
        .from('business_cards')
        .insert(cardsToInsert);
      
      if (error) throw error;
      
      toast.success(`Saved ${pendingCards.length} lead${pendingCards.length !== 1 ? 's' : ''} to your CRM!`);
      setPendingCards([]);
      navigate(`/dashboard/leads/${eventId}`);
    } catch (error) {
      console.error("Error saving cards:", error);
      toast.error("Failed to save cards. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMockupClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {isProcessing && <ScanningAnimation />}
      
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
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <section className="relative gradient-backdrop overflow-hidden pt-4 pb-8 md:pt-8 md:pb-12">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl rotate-12 animate-float-slow hidden lg:block" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl -rotate-6 animate-float hidden lg:block" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-gradient-yellow/20 to-gradient-yellow/5 rounded-3xl rotate-6 animate-float-slow hidden lg:block" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg -rotate-12 animate-float hidden lg:block" style={{ animationDelay: '0.5s' }} />
        
        {/* Floating card icons */}
        <div className="absolute top-1/4 left-[5%] floating-element hidden xl:block" style={{ animationDelay: '1.5s' }}>
          <div className="bg-card shadow-xl rounded-xl p-3 border border-border/50">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="absolute top-1/3 right-[8%] floating-element hidden xl:block" style={{ animationDelay: '2.5s' }}>
          <div className="bg-card shadow-xl rounded-xl p-3 border border-border/50">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-[8%] floating-element hidden xl:block" style={{ animationDelay: '0.8s' }}>
          <div className="bg-card shadow-xl rounded-xl p-3 border border-border/50">
            <Zap className="w-8 h-8 text-gradient-yellow" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Social proof badge */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="pill-badge">
              <Users className="w-4 h-4 text-accent" />
              <span>Trusted by 10k+ Sales Pros</span>
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-3 md:mb-4">
              Your leads{" "}
              <span className="highlight-text text-primary">under control</span>.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Snap a photo of 20+ cards instantly. We digitize and sync them to your CRM in seconds.
            </p>
          </div>

          {/* iPhone Mockup */}
          <div className="flex justify-center">
            <IPhoneMockup onClick={handleMockupClick} />
          </div>
        </div>
        
        {/* Business cards table image */}
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 overflow-hidden pointer-events-none">
          <img 
            src={businessCardsTable} 
            alt="Business cards scattered on table" 
            className="w-full h-full object-cover object-top opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      </section>
    </>
  );
};
