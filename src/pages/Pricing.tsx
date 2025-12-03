import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PricingCard } from "@/components/PricingCard";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
