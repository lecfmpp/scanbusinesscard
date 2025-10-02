import { Card } from "@/components/ui/card";

const ScanningAnimation = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Scanning Business Cards</h3>
          <p className="text-muted-foreground">
            Our AI is extracting contact information...
          </p>
        </div>

        <div className="relative">
          {/* Business Card */}
          <div className="bg-gradient-to-br from-card to-muted border-2 border-border rounded-lg p-6 mb-6 shadow-lg">
            <div className="space-y-3">
              <div className="h-4 bg-muted-foreground/20 rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-muted-foreground/20 rounded w-1/2 animate-pulse delay-75" />
              <div className="h-3 bg-muted-foreground/20 rounded w-3/4 animate-pulse delay-150" />
              <div className="mt-4 space-y-2">
                <div className="h-2 bg-muted-foreground/20 rounded w-1/3 animate-pulse delay-300" />
                <div className="h-2 bg-muted-foreground/20 rounded w-1/2 animate-pulse delay-500" />
              </div>
            </div>
          </div>

          {/* Scanning Laser Effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_10px_2px] shadow-primary/50 animate-scan" />
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing</span>
            <span className="font-medium text-primary">Please wait...</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScanningAnimation;
