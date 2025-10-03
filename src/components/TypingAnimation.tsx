import { useState, useEffect } from "react";

const integrations = [
  { name: "Slack", color: "text-purple-600" },
  { name: "Google Sheets", color: "text-green-600" },
  { name: "HubSpot", color: "text-orange-600" }
];

const TypingAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentIntegration = integrations[currentIndex].name;
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(pauseTimer);
    }

    const typingSpeed = isDeleting ? 50 : 100;
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentIntegration.length) {
          setDisplayText(currentIntegration.slice(0, displayText.length + 1));
        } else {
          setIsPaused(true);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % integrations.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentIndex, isPaused]);

  return (
    <div className="text-2xl md:text-4xl font-bold mb-8">
      <span className="text-foreground">From a photo to </span>
      <span className={integrations[currentIndex].color}>
        {displayText}
        <span className="animate-pulse">|</span>
      </span>
      <span className="text-foreground"> in seconds.</span>
    </div>
  );
};

export default TypingAnimation;
