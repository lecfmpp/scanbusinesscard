import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FAQSection } from "@/components/FAQSection";
import { CTASection } from "@/components/CTASection";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Bulk Business Card Scanner for Sales Pros"
        description="Scan 20+ business cards in one photo. AI-powered extraction, instant CRM export to Slack, Google Sheets, or HubSpot. Never lose a lead from events again."
        canonical="https://scanbusinesscard.com/"
      />
      <Header />

      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
