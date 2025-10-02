import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
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
    <div className="max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drop business card images here</p>
        <p className="text-sm text-muted-foreground mb-6">
          or click to browse from your device
        </p>
        
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        <label htmlFor="file-upload">
          <Button asChild disabled={isProcessing}>
            <span>
              <Upload className="h-4 w-4" />
              {isProcessing ? "Processing..." : "Upload Business Cards"}
            </span>
          </Button>
        </label>
      </div>

      <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex gap-3">
        <div className="text-accent mt-0.5">ℹ️</div>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Bulk Scanning Tips:</strong> You can place multiple business cards in a single photo (grid layout, side-by-side, etc.). 
            Our AI will detect and extract ALL cards from each image. Upload up to 25 images for maximum efficiency.
          </p>
          <a href="#" className="text-accent hover:underline">
            Learn more about managing business contacts in our blog
          </a>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
