import { useCallback, useState } from "react";
import { Camera, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const UploadZone = ({ onFilesSelected, isProcessing }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith("image/")
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div className="max-w-4xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 md:p-16 text-center transition-all duration-300",
          "bg-gradient-to-br from-primary/5 via-background to-accent/5",
          isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-primary/30",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        {/* Visual Indicator - Multiple Cards */}
        <div className="flex justify-center items-center gap-4 mb-6 md:mb-8">
          <div className="relative">
            <CreditCard className="h-16 w-16 md:h-20 md:w-20 text-primary/40 rotate-[-12deg]" strokeWidth={1.5} />
          </div>
          <div className="relative">
            <CreditCard className="h-16 w-16 md:h-20 md:w-20 text-primary rotate-[0deg]" strokeWidth={1.5} />
          </div>
          <div className="relative">
            <CreditCard className="h-16 w-16 md:h-20 md:w-20 text-primary/40 rotate-[12deg]" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
          Scan Multiple Business Cards
        </h3>
        <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
          Take a photo or upload images of your business cards. Our AI will instantly extract all contact information into an organized table.
        </p>
        
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        <div className="flex justify-center">
          <label htmlFor="file-upload" className="inline-block">
            <Button 
              asChild 
              disabled={isProcessing}
              size="lg"
              className="text-sm md:text-lg px-6 py-5 md:px-12 md:py-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <span className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
                <Camera className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0" />
                <span className="hidden sm:inline">{isProcessing ? "Processing Your Cards..." : "Take Photo of Business Cards"}</span>
                <span className="sm:hidden">{isProcessing ? "Processing..." : "Take Photo"}</span>
                <ArrowRight className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0" />
              </span>
            </Button>
          </label>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground mt-6">
          Or drag and drop your images here • Supports multiple cards per photo
        </p>
      </div>
    </div>
  );
};

export default UploadZone;
