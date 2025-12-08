import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Building2, Users, Shield, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const AltHaystack = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Haystack Alternative: Scan Business Card Built for Sales Teams, Events, and Enterprise CRM Sync"
        description="Haystack is great for individuals, but not for teams. Choose Scan Business Card that supports large sales organizations with CRM sync and enterprise lead management."
        canonical="https://www.scanbusinesscard.com/haystack-alternative-sales-teams"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Haystack Alternative
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              Haystack is Fine. Scan Business Card is <span className="text-primary">Built for Sales Teams</span>. The Enterprise Alternative.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Haystack is recognized for its beautiful design and focus on digital card sharing. However, for sales managers and growing teams, a card scanner must be an enterprise-grade lead capture tool, not just a personal networking utility. Haystack often lacks the features necessary for high-volume physical card capture, data governance, and scalable CRM integration. Scan Business Card is the solution: a robust, scalable tool designed to manage and automate lead flow for the entire sales organization.
            </p>
          </div>

          {/* Growth Gap Section */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              The Growth Gap: <span className="text-primary">Haystack Doesn't Scale with Your Sales Team</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              As your team and event calendar grow, you need a tool that can keep up with the volume of physical cards collected. Relying on a tool designed for individual use creates bottlenecks and data fragmentation. Our app is purpose-built for enterprise scale:
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-primary/5 rounded-2xl p-6 text-center">
                <Check className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-semibold">True Bulk Scanning</p>
                <p className="text-sm text-muted-foreground">Process up to 20 cards at once</p>
              </div>
              <div className="bg-primary/5 rounded-2xl p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-semibold">Team Lead Distribution</p>
                <p className="text-sm text-muted-foreground">Route leads automatically</p>
              </div>
              <div className="bg-primary/5 rounded-2xl p-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-semibold">Data Governance</p>
                <p className="text-sm text-muted-foreground">Centralized, compliant capture</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-lg">Haystack</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Focuses on Digital – No Bulk Physical Scan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Limited centralized team management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Single user focus for integrations</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4 text-lg">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20 Cards in One Shot</strong> – True Bulk Scanning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Full Admin Dashboard for teams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Robust Team Syncing to HubSpot/Slack</span>
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
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4">Haystack</th>
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "High-Speed Bulk Scan (20 cards)", competitor: "No (Focuses on Digital)", sbc: "YES: 20 Cards in One Shot" },
                    { feature: "Centralized Team Management", competitor: "Limited", sbc: "YES: Full Admin Dashboard" },
                    { feature: "Preview CRM for Lead Qualification", competitor: false, sbc: "YES: Essential for clean data" },
                    { feature: "Direct HubSpot/Slack Integration", competitor: "Limited (Single User Focus)", sbc: "YES: Robust Team Syncing" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2 sm:py-4 sm:px-4 font-medium">{row.feature}</td>
                      <td className="py-2 px-2 sm:py-4 sm:px-4 text-center">
                        {typeof row.competitor === "boolean" ? (
                          row.competitor ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /> : <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mx-auto" />
                        ) : <span className="text-muted-foreground">{row.competitor}</span>}
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
          </div>

          {/* CRM Workflow Section */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              From Business Card to Pipeline: <span className="text-primary">Automated CRM Workflow</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-8">
              We do more than just digitize. ScanBusinessCard turns scanned cards into qualified leads instantly. Leverage our native, automated integrations with HubSpot, Google Sheets, and Slack to eliminate manual data entry and ensure immediate follow-up. For sales organizations, this focus on workflow automation is the difference between a high ROI event and a wasted opportunity.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-background rounded-2xl p-6">
                <Building2 className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Enterprise Scale</p>
                <p className="text-sm text-muted-foreground">Handle team volume</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <FileSpreadsheet className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Export to Sheets</p>
                <p className="text-sm text-muted-foreground">One-click data export</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Team Distribution</p>
                <p className="text-sm text-muted-foreground">Route to right rep</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">
              Ready to upgrade from a personal tool?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Get enterprise-grade lead capture and bulk scanning. Request team pricing for ScanBusinessCard today!
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

export default AltHaystack;
