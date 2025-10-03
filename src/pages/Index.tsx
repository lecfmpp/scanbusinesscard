import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadZone from "@/components/UploadZone";
import ScanningAnimation from "@/components/ScanningAnimation";
import TypingAnimation from "@/components/TypingAnimation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessCard } from "./Results";
import featureBulkScanning from "@/assets/feature-bulk-scanning.jpg";
import featureDataCapture from "@/assets/feature-data-capture.jpg";
import featureIntegrations from "@/assets/feature-integrations.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const processImages = async (files: File[]) => {
    setIsProcessing(true);
    toast.info("Processing business cards...");

    try {
      // Convert files to base64
      const imagePromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      // Call edge function to process with Gemini
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isProcessing && <ScanningAnimation />}
      
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl mb-6">
              Stop Drowning in Business Cards. Start Winning at Follow-Ups.
            </h1>
            
            <div className="mt-8 mb-6 flex justify-center">
              <TypingAnimation />
            </div>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Leave the trade show with leads, not a pile of paper. Scan multiple cards in one shot and instantly export the data to your favorite tools.
            </p>
          </div>
        </section>

        {/* Upload Section - Hero */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container mx-auto px-4">
            <UploadZone onFilesSelected={processImages} isProcessing={isProcessing} />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                From Chaos to Control in Three Simple Steps
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Business Card to Sheets turns a tedious task into a seamless workflow.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">stacks</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">1. Snap a Photo</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Capture multiple business cards at once with your phone's camera.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">grid_on</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">2. Organize Your Data</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Our advanced OCR technology extracts key information into a structured table.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">ios_share</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">3. Instant Export</h3>
                <p className="mt-2 text-base text-muted-foreground">
                  Export structured data to Google Sheets, HubSpot, and Slack with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Features Designed for Maximum Efficiency
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Packed with features to streamline your business card management.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
              <div className="flex flex-col">
                <img 
                  src={featureBulkScanning} 
                  alt="Multiple business cards arranged for bulk scanning"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Bulk Scanning</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    Scan multiple business cards simultaneously, saving you precious time and effort.
                  </p>
                </div>
              </div>
              <div className="flex flex-col">
                <img 
                  src={featureDataCapture} 
                  alt="Organized contact data in a spreadsheet"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Accurate Data Capture</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    Our OCR technology ensures accurate extraction of names, titles, and contact details.
                  </p>
                </div>
              </div>
              <div className="flex flex-col">
                <img 
                  src={featureIntegrations} 
                  alt="Integration icons for Google Sheets, HubSpot and Slack"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Multiple Integrations</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    Export scanned data directly to Google Sheets, HubSpot, and Slack for easy access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Simplify Your Business Card Management?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start using Business Card to Sheets today and experience the efficiency of bulk scanning and instant data export.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
