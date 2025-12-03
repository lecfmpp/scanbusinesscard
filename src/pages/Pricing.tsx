import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PricingCard } from "@/components/PricingCard";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a 7-day free trial. Scan your first batch of business cards and see the magic happen.
            </p>
          </div>

          <PricingCard />

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto text-left space-y-6">
              <div>
                <h3 className="font-medium mb-2">What's included in the free trial?</h3>
                <p className="text-muted-foreground text-sm">
                  You get 7 days to try the service with 1 scan (up to 20 business cards). 
                  No credit card required to start.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">How many cards can I scan?</h3>
                <p className="text-muted-foreground text-sm">
                  Each scan can process up to 20 business cards at once. With the Pro plan, 
                  you get 30 scans per month, that's up to 600 cards!
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">What's the WhatsApp support?</h3>
                <p className="text-muted-foreground text-sm">
                  Yearly subscribers get lifetime access to our WhatsApp support channel 
                  for priority assistance and feature requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
