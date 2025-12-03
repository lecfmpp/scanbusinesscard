import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, CheckCircle, Zap } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import ScanningAnimation from "@/components/ScanningAnimation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessCard } from "@/pages/Results";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkPendingImages = async () => {
      const pendingImages = sessionStorage.getItem('pendingBusinessCardImages');
      if (pendingImages) {
        sessionStorage.removeItem('pendingBusinessCardImages');
        const base64Images = JSON.parse(pendingImages);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await processStoredImages(base64Images);
        }
      }
    };
    checkPendingImages();
  }, []);

  const processStoredImages = async (base64Images: string[]) => {
    setIsProcessing(true);
    toast.info("Processing business cards...");
    try {
      const { data, error } = await supabase.functions.invoke('scan-business-cards', {
        body: { images: base64Images }
      });
      if (error) throw error;
      const cards: BusinessCard[] = data.cards;
      toast.success(`Successfully extracted ${cards.length} business card${cards.length !== 1 ? 's' : ''}`);
      navigate("/results", { state: { cards } });
    } catch (error) {
      console.error("Error processing cards:", error);
      toast.error("Failed to process business cards. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processImages = async (files: File[]) => {
    try {
      toast.success(`${files.length} business card${files.length !== 1 ? 's' : ''} selected! Preparing for processing...`);
      const imagePromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      const base64Images = await Promise.all(imagePromises);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        sessionStorage.setItem('pendingBusinessCardImages', JSON.stringify(base64Images));
        toast.info("Your images are ready! Please sign in to process them.");
        navigate("/auth?returnTo=/");
        return;
      }
      await processStoredImages(base64Images);
    } catch (error) {
      console.error("Error preparing images:", error);
      toast.error("Failed to prepare images. Please try again.");
    }
  };

  return (
    <>
      {isProcessing && <ScanningAnimation />}
      
      <section className="relative min-h-[90vh] gradient-backdrop overflow-hidden">
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

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          {/* Glass card container */}
          <div className="glass-card p-8 md:p-12 lg:p-16 max-w-5xl mx-auto">
            {/* Social proof badge */}
            <div className="flex justify-center mb-8">
              <div className="pill-badge">
                <Users className="w-4 h-4 text-accent" />
                <span>Trusted by 10k+ Sales Pros</span>
              </div>
            </div>

            {/* Main headline */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6">
                Your leads{" "}
                <span className="highlight-text text-primary">under control</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Snap a photo of 20+ cards instantly. We digitize and sync them to your CRM in seconds. Never lose another lead from events again.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mb-12">
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg"
                onClick={() => document.getElementById('upload-zone')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Start Scanning Free
              </Button>
            </div>

            {/* Upload Zone */}
            <div id="upload-zone">
              <UploadZone onFilesSelected={processImages} isProcessing={isProcessing} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
