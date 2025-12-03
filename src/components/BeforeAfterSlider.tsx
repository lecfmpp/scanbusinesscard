import { useState, useRef } from "react";
import businessCardsBefore from "@/assets/business-cards-table.jpg";
import crmAfter from "@/assets/crm-organized-view.png";

const BeforeAfterSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div className="w-full max-w-lg">
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* After image (CRM view) - full width background */}
        <img
          src={crmAfter}
          alt="Organized CRM view with extracted leads"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before image (business cards pile) - clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={businessCardsBefore}
            alt="Pile of business cards on table"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: containerRef.current?.offsetWidth || "100%" }}
            draggable={false}
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Handle circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-muted-foreground/50 rounded-full" />
              <div className="w-0.5 h-4 bg-muted-foreground/50 rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
          Before
        </div>
        <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
          After
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Drag to compare: messy pile → organized leads
      </p>
    </div>
  );
};

export default BeforeAfterSlider;
