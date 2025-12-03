import { useRef } from "react";

interface IPhoneMockupProps {
  onClick: () => void;
}

const IPhoneMockup = ({ onClick }: IPhoneMockupProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
    onClick();
  };

  return (
    <div 
      className="relative cursor-pointer group transition-transform hover:scale-105 duration-300"
      onClick={handleClick}
    >
      {/* iPhone Frame - Upper half only */}
      <div className="relative w-[280px] md:w-[320px] mx-auto">
        {/* Phone body */}
        <div className="relative bg-secondary rounded-[2.5rem] p-2 shadow-2xl">
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-full z-20" />
          
          {/* Screen */}
          <div className="relative bg-gradient-to-br from-muted to-background rounded-[2rem] overflow-hidden aspect-[9/12]">
            {/* Camera UI overlay */}
            <div className="absolute inset-0 flex flex-col">
              {/* Camera viewfinder area */}
              <div className="flex-1 relative p-4 pt-10">
                {/* Scattered business cards with detection boxes */}
                <div className="relative w-full h-full">
                  {/* Card 1 */}
                  <div className="absolute top-[5%] left-[5%] w-[45%] h-[28%] rotate-[-5deg]">
                    <div className="w-full h-full bg-card rounded-lg shadow-md border border-border p-2 flex flex-col justify-center">
                      <div className="w-8 h-1 bg-primary/30 rounded mb-1" />
                      <div className="w-12 h-1 bg-muted-foreground/30 rounded mb-2" />
                      <div className="w-10 h-0.5 bg-muted-foreground/20 rounded" />
                    </div>
                    {/* Detection box */}
                    <div className="absolute -inset-1 border-2 border-primary rounded-lg animate-pulse" />
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                  </div>

                  {/* Card 2 */}
                  <div className="absolute top-[8%] right-[8%] w-[42%] h-[26%] rotate-[8deg]">
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-card rounded-lg shadow-md border border-border p-2 flex flex-col justify-center">
                      <div className="w-10 h-1 bg-accent/40 rounded mb-1" />
                      <div className="w-8 h-1 bg-muted-foreground/30 rounded mb-2" />
                      <div className="w-6 h-0.5 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="absolute -inset-1 border-2 border-primary rounded-lg animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                  </div>

                  {/* Card 3 */}
                  <div className="absolute top-[38%] left-[15%] w-[40%] h-[25%] rotate-[3deg]">
                    <div className="w-full h-full bg-card rounded-lg shadow-md border border-border p-2 flex flex-col justify-center">
                      <div className="w-6 h-1 bg-secondary/30 rounded mb-1" />
                      <div className="w-10 h-1 bg-muted-foreground/30 rounded mb-2" />
                      <div className="w-8 h-0.5 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="absolute -inset-1 border-2 border-primary rounded-lg animate-pulse" style={{ animationDelay: '0.6s' }} />
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                  </div>

                  {/* Card 4 */}
                  <div className="absolute top-[42%] right-[5%] w-[44%] h-[27%] rotate-[-6deg]">
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-card rounded-lg shadow-md border border-border p-2 flex flex-col justify-center">
                      <div className="w-9 h-1 bg-primary/30 rounded mb-1" />
                      <div className="w-7 h-1 bg-muted-foreground/30 rounded mb-2" />
                      <div className="w-11 h-0.5 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="absolute -inset-1 border-2 border-primary rounded-lg animate-pulse" style={{ animationDelay: '0.9s' }} />
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                  </div>

                  {/* Card 5 */}
                  <div className="absolute bottom-[8%] left-[25%] w-[48%] h-[28%] rotate-[1deg]">
                    <div className="w-full h-full bg-card rounded-lg shadow-md border border-border p-2 flex flex-col justify-center">
                      <div className="w-11 h-1 bg-accent/30 rounded mb-1" />
                      <div className="w-9 h-1 bg-muted-foreground/30 rounded mb-2" />
                      <div className="w-7 h-0.5 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="absolute -inset-1 border-2 border-primary rounded-lg animate-pulse" style={{ animationDelay: '1.2s' }} />
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                  </div>
                </div>
              </div>

              {/* Camera capture button */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 rounded-full border-4 border-card flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-11 h-11 rounded-full bg-card shadow-inner" />
                </div>
              </div>

              {/* Cards detected indicator */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                5 cards detected
              </div>
            </div>
          </div>
        </div>

        {/* Tap to scan hint */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground font-medium whitespace-nowrap group-hover:text-primary transition-colors">
          Tap to scan your cards
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
    </div>
  );
};

export default IPhoneMockup;
