import { Camera, Zap, Share2, Shield, Clock, Database } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Bulk Scanning",
    description: "Capture 20+ business cards in a single photo. No more scanning one card at a time – save hours at every event."
  },
  {
    icon: Zap,
    title: "AI-Powered Extraction",
    description: "Our advanced OCR instantly extracts names, titles, companies, emails, and phone numbers with 95%+ accuracy."
  },
  {
    icon: Share2,
    title: "Instant CRM Export",
    description: "One-click export to Google Sheets, HubSpot, or Slack. Your leads are ready to follow up before you leave the venue."
  },
  {
    icon: Clock,
    title: "Time Savings",
    description: "What used to take hours now takes seconds. Process 600 cards per month in just minutes total."
  },
  {
    icon: Database,
    title: "Never Lose a Lead",
    description: "All contacts are securely stored in your account. Access them anytime, from any device, forever."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption protects your valuable business contacts. Your data is never shared."
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold font-display tracking-tight sm:text-4xl">
            Built for Sales Professionals
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop losing leads. Start closing deals faster with the only bulk business card scanner.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-display mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
