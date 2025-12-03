import { Camera, Sparkles, Send } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: "1",
    title: "Snap a Photo",
    description: "Lay out all your business cards and take one photo. Our app detects and processes up to 20 cards simultaneously."
  },
  {
    icon: Sparkles,
    step: "2",
    title: "AI Does the Work",
    description: "Our AI instantly extracts all contact information – names, titles, emails, phones – with incredible accuracy."
  },
  {
    icon: Send,
    step: "3",
    title: "Export & Follow Up",
    description: "Send your contacts directly to Google Sheets, HubSpot, or Slack. Start your outreach before the competition."
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold font-display tracking-tight sm:text-4xl">
            From Card Stack to CRM in 60 Seconds
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The fastest way to turn networking connections into actionable leads
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-2xl rotate-6" />
                <div className="absolute inset-0 bg-primary/5 rounded-2xl -rotate-6" />
                <div className="relative bg-card rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg border border-border/50">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold font-display mb-3">{step.title}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
