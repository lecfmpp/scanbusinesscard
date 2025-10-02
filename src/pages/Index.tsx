import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadZone from "@/components/UploadZone";
import ScanningAnimation from "@/components/ScanningAnimation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessCard } from "./Results";

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

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            MyBusinessCards<span className="text-accent">.ai</span>
          </h1>
          <h2 className="text-4xl font-bold mb-4">
            From Photo to Sheet in 60 Seconds
          </h2>
          <p className="text-xl text-muted-foreground">
            Turn Business Cards into Editable Tables with Just a Click
          </p>
        </div>

        <UploadZone onFilesSelected={processImages} isProcessing={isProcessing} />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
