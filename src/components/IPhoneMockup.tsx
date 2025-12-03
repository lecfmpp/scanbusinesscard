import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import businessCardsImage from "@/assets/business-cards-table.jpg";

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
    <div className="relative">
      {/* iPhone Frame - Realistic proportions */}
      <div className="relative w-[260px] sm:w-[280px] md:w-[300px] mx-auto">
        {/* Phone outer frame */}
        <div className="relative bg-[#1a1a1a] rounded-[3rem] p-[10px] shadow-2xl ring-1 ring-white/10">
          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-20 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1a1a1a] ring-1 ring-gray-800" />
          </div>
          
          {/* Screen bezel */}
          <div className="relative bg-black rounded-[2.3rem] overflow-hidden">
            {/* Screen content */}
            <div className="relative aspect-[9/19.5]">
              {/* Business cards photo */}
              <img 
                src={businessCardsImage} 
                alt="Business cards on table"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Camera UI overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
              
              {/* Top status bar */}
              <div className="absolute top-0 left-0 right-0 pt-12 px-6 flex justify-between text-white text-xs font-medium">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                  </div>
                  <span className="ml-1">5G</span>
                  <div className="w-6 h-3 border border-white rounded-sm ml-1 relative">
                    <div className="absolute inset-0.5 right-1 bg-white rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Cards detected badge */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                12 cards detected
              </div>

              {/* Scanning frame corners */}
              <div className="absolute top-28 left-6 right-6 bottom-32">
                {/* Top left corner */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                {/* Top right corner */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
                {/* Bottom left corner */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                {/* Bottom right corner */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
                {/* Flash */}
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {/* Capture button */}
                <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white" />
                </div>
                {/* Switch camera */}
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute -left-[2px] top-28 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute -left-[2px] top-40 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute -left-[2px] top-56 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute -right-[2px] top-36 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />
      </div>

      {/* CTA Button - Overlaying the phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <Button
          onClick={handleClick}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-7 text-base md:text-lg font-bold shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105 transition-all duration-300 whitespace-nowrap"
        >
          <Camera className="w-5 h-5 mr-2" />
          Capture My Leads
        </Button>
      </div>

      {/* Glow effect behind phone */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 blur-3xl scale-110 opacity-60" />
    </div>
  );
};

export default IPhoneMockup;
