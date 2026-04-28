import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isNative } from "@/lib/platform";
import { pickImagesNative } from "@/lib/platform/camera";

interface BusinessCard {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
}

export const useScanCards = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingCards, setPendingCards] = useState<BusinessCard[]>([]);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

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

  const triggerScan = async () => {
    if (isNative) {
      try {
        const base64Images = await pickImagesNative();
        if (base64Images && base64Images.length > 0) {
          toast.success(`${base64Images.length} image${base64Images.length !== 1 ? 's' : ''} selected!`);
          await processImages(base64Images);
        }
      } catch (err) {
        console.error("Native camera pick failed:", err);
        toast.error("Failed to access camera/photos.");
      }
      return;
    }
    fileInputRef.current?.click();
  };

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
      
      setPendingCards(cards);
      
      if (!isLoggedIn) {
        sessionStorage.setItem('pendingBusinessCardImages', JSON.stringify(base64Images));
        setShowSignupModal(true);
      } else {
        setShowEventModal(true);
      }
    } catch (error) {
      console.error("Error processing cards:", error);
      toast.error("Failed to process business cards. Please try again.");
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSignupSuccess = async (eventId: string) => {
    setShowSignupModal(false);
    
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

  const handleEventSelected = async (eventId: string) => {
    setShowEventModal(false);
    
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

  const FileInput = () => (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      capture="environment"
      onChange={handleFileSelect}
      className="hidden"
    />
  );

  return {
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
  };
};
