import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 sm:py-24 gradient-backdrop">
      <div className="container mx-auto px-4">
        <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display tracking-tight sm:text-4xl mb-4">
            Ready to Stop Losing Leads?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of sales professionals who never miss a follow-up. 
            Start your free trial today – no credit card required.
          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Start Scanning Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
