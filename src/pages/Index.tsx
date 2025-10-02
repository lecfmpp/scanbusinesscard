import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadZone from "@/components/UploadZone";
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

      <main className="container mx-auto px-4 py-16">
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
    </div>
  );
};

export default Index;
