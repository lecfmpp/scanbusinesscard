import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PricingCard } from "@/components/PricingCard";
import { Check } from "lucide-react";
import SEO from "@/components/SEO";

const Pricing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Where Stripe returns an abandoned checkout. Landing back on the plans with
  // an explicit "nothing was charged" is what stops the support email.
  useEffect(() => {
    if (searchParams.get("checkout") === "canceled") {
      toast.info("Checkout canceled — you have not been charged.");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Pricing - Affordable Business Card Scanning Plans"
        description="Simple, transparent pricing for bulk business card scanning. Start with a 7-day free trial. Monthly and yearly plans available for sales professionals."
        canonical="https://scanbusinesscard.com/pricing"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-display mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a 7-day free trial. Scan your first batch of business cards and see the magic happen.
            </p>
          </div>

          <PricingCard />

          {/* What's included */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold font-display text-center mb-8">Everything You Need</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Bulk scan up to 20 cards at once",
                "AI-powered data extraction",
                "Export to CSV & Google Sheets",
                "Secure cloud storage",
                "Mobile-optimized interface",
                "Email & chat support",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
