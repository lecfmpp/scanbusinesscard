import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const CompareHubspotScanner = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="ScanBusinessCard vs HubSpot Card Scanner - Comparison"
        description="Compare ScanBusinessCard and HubSpot Card Scanner. Bulk scan 20+ business cards at once and seamlessly export to HubSpot CRM."
        canonical="https://scanbusinesscard.com/compare/hubspot-scanner"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              ScanBusinessCard vs HubSpot Card Scanner
            </h1>
            <p className="text-lg text-muted-foreground">
              Love HubSpot? So do we. That's why we integrate with it. But HubSpot's built-in scanner has one major limitation – 
              it only scans one card at a time.
            </p>
          </div>

          {/* Key Difference */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-8">
              Same Destination, <span className="text-primary">Faster Route</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              HubSpot's card scanner is convenient for one-off scans. But at a conference where you've collected 50 cards? 
              ScanBusinessCard gets those contacts into HubSpot 10x faster.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">HubSpot Card Scanner</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">One card at a time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Requires HubSpot mobile app</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Limited to HubSpot ecosystem</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20+ cards</strong> per photo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Works from any browser</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Export to HubSpot, Sheets, Slack</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-8">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm md:text-base">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 sm:py-4 sm:px-4">Feature</th>
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4">HubSpot</th>
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4 bg-primary/5">Us</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Bulk Scanning", hubspot: false, sbc: true },
                    { feature: "Cards/photo", hubspot: "1", sbc: "20+" },
                    { feature: "HubSpot", hubspot: "Native", sbc: "1-click" },
                    { feature: "Sheets Export", hubspot: false, sbc: true },
                    { feature: "Slack", hubspot: false, sbc: true },
                    { feature: "Web app", hubspot: false, sbc: true },
                    { feature: "Price", hubspot: "Free*", sbc: "$49/yr" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2 sm:py-4 sm:px-4 font-medium">{row.feature}</td>
                      <td className="py-2 px-2 sm:py-4 sm:px-4 text-center">
                        {typeof row.hubspot === "boolean" ? (
                          row.hubspot ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /> : <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mx-auto" />
                        ) : row.hubspot}
                      </td>
                      <td className="py-2 px-2 sm:py-4 sm:px-4 text-center bg-primary/5">
                        {typeof row.sbc === "boolean" ? (
                          row.sbc ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto" /> : <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mx-auto" />
                        ) : <span className="font-semibold text-primary">{row.sbc}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4">
              *HubSpot Card Scanner requires HubSpot CRM subscription
            </p>
          </div>

          {/* Workflow */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-6">
              The Perfect HubSpot Companion
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Think of ScanBusinessCard as a turbocharger for your HubSpot workflow. Collect cards at events, 
              bulk scan them in seconds, export to HubSpot with one click. Your sales pipeline stays full, 
              and you never lose a hot lead to a forgotten business card in your pocket.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display mb-4">Supercharge Your HubSpot</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Keep using HubSpot. Just get leads into it faster. Try ScanBusinessCard free for 7 days.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompareHubspotScanner;
