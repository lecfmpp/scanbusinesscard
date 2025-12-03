import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MONTHLY_PRICE = 9;
const YEARLY_PRICE = 49;
const YEARLY_SAVINGS = MONTHLY_PRICE * 12 - YEARLY_PRICE;

export const PricingCard = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to subscribe");
        window.location.href = "/auth";
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planType: isYearly ? "yearly" : "monthly" },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "7-day free trial (1 scan)",
    "30 scans per month",
    "20 cards per scan",
    "AI-powered extraction",
    "Export to CSV/Sheets",
  ];

  const yearlyExtraFeature = "Live WhatsApp support forever";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-primary"
        />
        <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
        </span>
      </div>

      {/* Savings message - handwritten style */}
      {isYearly && (
        <div className="text-center mb-4 animate-fade-in">
          <p 
            className="text-primary font-handwriting text-lg transform -rotate-2"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Save ${YEARLY_SAVINGS} per year! 🎉
          </p>
        </div>
      )}

      {/* Pricing Card */}
      <Card className={`relative overflow-hidden transition-all duration-300 ${isYearly ? "ring-2 ring-primary shadow-lg" : ""}`}>
        {isYearly && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            BEST VALUE
          </div>
        )}
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Pro Plan</CardTitle>
          <div className="mt-4">
            <span className="text-5xl font-bold">
              ${isYearly ? YEARLY_PRICE : MONTHLY_PRICE}
            </span>
            <span className="text-muted-foreground ml-2">
              /{isYearly ? "year" : "month"}
            </span>
          </div>
          {isYearly && (
            <p className="text-sm text-muted-foreground mt-1">
              Just ${(YEARLY_PRICE / 12).toFixed(2)}/month
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            
            {/* WhatsApp support - highlighted for yearly */}
            <li className={`flex items-center gap-3 ${isYearly ? "bg-primary/10 -mx-4 px-4 py-2 rounded-lg" : "opacity-50"}`}>
              <MessageCircle className={`h-5 w-5 flex-shrink-0 ${isYearly ? "text-green-500" : "text-muted-foreground"}`} />
              <span className={`text-sm ${isYearly ? "font-medium text-foreground" : "line-through text-muted-foreground"}`}>
                {yearlyExtraFeature}
              </span>
              {!isYearly && (
                <span className="text-xs text-muted-foreground">(yearly only)</span>
              )}
            </li>
          </ul>

          <Button 
            onClick={handleSubscribe} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Loading..." : "Start 7-Day Free Trial"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-3">
            Cancel anytime. No questions asked.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
