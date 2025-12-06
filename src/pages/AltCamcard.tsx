import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const AltCamcard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="CamCard Alternative: The 20x Faster Bulk Scanner for Sales Teams"
        description="Stop wasting time with CamCard's slow batch scanning. ScanBusinessCard offers true Bulk Scan technology and direct HubSpot/CRM integration for sales teams."
        canonical="https://www.scanbusinesscard.com/camcard-alternative-bulk-scanner"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              CamCard Alternative
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              Tired of Slow CamCard Batch Scanning? Get the <span className="text-primary">20x Faster</span> Business Card Scanner Built for Sales.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              CamCard has been a long-time player in the business card scanning space. However, for modern sales teams and event professionals who capture hundreds of leads, speed is everything. When dealing with stacks of cards from a trade show, CamCard's multi-scan feature often falls short, leading to processing bottlenecks and delayed follow-up. We built ScanBusinessCard specifically to eliminate this lead-capture lag, giving you true Bulk Scanning power with instant CRM automation.
            </p>
          </div>

          {/* Speed Test Section */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              The Speed Test: Why CamCard Fails at <span className="text-primary">High-Volume Lead Capture</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Many apps offer "batch" or "multi-scan," but they often require several manual steps. CamCard's system simply isn't optimized for processing 20+ cards in one quick shot. If your sales team is spending hours manually processing leads after an event, you need a specialized solution. ScanBusinessCard is engineered for maximum speed, capturing and digitizing a full stack of cards in the same time CamCard handles just a handful.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-lg">CamCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Limited/Slow Multi-Scan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">General Contact Manager focus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Limited CRM integration (via export)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4 text-lg">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20 Cards at Once</strong> – True Bulk Scanning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Built for Sales & Events workflow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Direct, Automated HubSpot/Slack Sync</span>
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
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4">CamCard</th>
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "True Bulk/Batch Scanning (20+ cards)", competitor: false, sbc: "YES: 20 Cards at Once" },
                    { feature: "Sales Team Focus & Workflow", competitor: "General Contact Manager", sbc: "YES: Built for Sales & Events" },
                    { feature: "Pre-CRM Lead Qualification", competitor: false, sbc: "YES: Exclusive Preview CRM" },
                    { feature: "HubSpot/Slack Integration", competitor: "Limited (Via Export)", sbc: "YES: Direct, Automated Sync" },
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

          {/* Automation Section */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              Move Beyond Scanning: <span className="text-primary">Automate Your Sales Follow-Up</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-8">
              For sales professionals, the scan is only the first step. ScanBusinessCard turns scanned data directly into actionable leads. Our native integrations with HubSpot, Slack, and Google Sheets ensure that the lead is immediately routed to the right person, eliminating the lead-lag that kills post-event conversion rates. Plus, our Preview CRM lets you qualify and tag leads before they hit your main system, ensuring data cleanliness.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-background rounded-2xl p-6">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">90% Faster</p>
                <p className="text-sm text-muted-foreground">Lead processing time</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <Zap className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Instant Sync</p>
                <p className="text-sm text-muted-foreground">To HubSpot & Slack</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <Check className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Preview CRM</p>
                <p className="text-sm text-muted-foreground">Qualify before syncing</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">
              Ready to cut your lead processing time by 90%?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Stop struggling with CamCard. Try the fastest Bulk Scanner for free today!
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

export default AltCamcard;
