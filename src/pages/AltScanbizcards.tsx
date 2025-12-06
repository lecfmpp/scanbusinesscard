import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Trophy, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const AltScanbizcards = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="ScanBizCards Alternative: Best Bulk Scanner for Trade Show Lead Capture & CRM Sync"
        description="Need faster lead capture than ScanBizCards? Choose the Bulk Scanner designed for events. Instant CRM sync and Preview CRM for superior lead quality."
        canonical="https://www.scanbusinesscard.com/scanbizcards-alternative-trade-show-speed"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Trophy className="w-4 h-4" />
              ScanBizCards Alternative
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              The ScanBizCards Alternative: <span className="text-primary">Speed Up Your Trade Show Follow-up</span> with Bulk Scan & Fast CRM Sync.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ScanBizCards has carved out a niche in the event lead capture market, but in the fast-paced world of trade shows, speed is paramount. The biggest bottleneck after any event is processing the stack of physical cards collected. If your system relies on single-card processing, your follow-up is already delayed. ScanBusinessCard is engineered for event volume, featuring True Bulk Scanning that processes 20 cards in one shot. We remove the lead-entry backlog so you can focus on calling prospects while your competitors are still typing.
            </p>
          </div>

          {/* Lead Lag Section */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              Eliminate the Post-Event Lead Lag with <span className="text-primary">Bulk Processing</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Trade show ROI is directly tied to the speed of follow-up. Every hour spent manually scanning is an hour lost on a potential sale. Your app needs to handle the high-volume burst of cards instantly. ScanBizCards may require more steps or manual effort. ScanBusinessCard gives your team the competitive edge: instantaneous capture of 20 cards at once, followed by automated routing to HubSpot, Slack, or Google Sheets.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-lg">ScanBizCards</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Limited Multi-Card scanning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Limited pre-CRM qualification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Available CRM sync</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4 text-lg">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20 Cards in One Shot</strong> – True Bulk</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Dedicated Preview CRM for qualification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Automated & Reliable HubSpot/Slack Sync</span>
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
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4">ScanBizCards</th>
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "High-Speed Bulk Scan (20 cards)", competitor: "Limited Multi-Card", sbc: "YES: 20 Cards in One Shot" },
                    { feature: "Instant Sync to HubSpot/Slack", competitor: "Available", sbc: "YES: Automated & Reliable" },
                    { feature: "Pre-CRM Lead Qualification", competitor: "Limited", sbc: "YES: Dedicated Preview CRM" },
                    { feature: 'Dedicated "Trade Show" Workflow', competitor: "Yes", sbc: "YES: Built-In Event Lead Manager" },
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

          {/* Lead Quality Section */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              Go Beyond Sync: <span className="text-primary">Superior Lead Quality and Distribution</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-8">
              We provide superior lead quality control. Our Preview CRM allows your team to add qualification data, tags, and follow-up notes to the bulk scan before it hits your main CRM system. Furthermore, our integration with Slack means new leads can be instantly pushed to the relevant sales channel for immediate assignment and action, eliminating the need for a manager to manually triage leads from the scanner app.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-background rounded-2xl p-6">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Instant Processing</p>
                <p className="text-sm text-muted-foreground">20 cards in seconds</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Competitive Edge</p>
                <p className="text-sm text-muted-foreground">Call while others type</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Slack Distribution</p>
                <p className="text-sm text-muted-foreground">Auto-assign to sales reps</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">
              Don't delay follow-up.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Get the competitive edge at your next trade show. Try the Bulk Scanner alternative to ScanBizCards today!
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

export default AltScanbizcards;
