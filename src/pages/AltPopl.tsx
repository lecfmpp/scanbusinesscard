import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, CreditCard, Smartphone, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const AltPopl = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Popl Alternative: Best Scanner for Physical Business Cards at Trade Shows"
        description="Popl is great for digital, but what about physical cards? ScanBusinessCard is the best Popl alternative for fast Bulk Scan and CRM sync at your next trade show or event."
        canonical="https://www.scanbusinesscard.com/popl-physical-card-scanner-alternative"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CreditCard className="w-4 h-4" />
              Popl Alternative
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              The Popl Alternative for Physical Cards: <span className="text-primary">Fast Bulk Scanning</span> for Trade Show Leads.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Popl has revolutionized digital card sharing, but the reality of B2B networking is this: physical business cards are not going away. When your sales team returns from a major conference with a pocket full of paper cards, you need a solution built for speed and volume. Popl's primary focus is digital exchange, which makes processing physical stacks cumbersome. ScanBusinessCard is the tool designed for the mixed-media reality of events, providing unparalleled Bulk Capture for every physical card you receive.
            </p>
          </div>

          {/* Problem Section */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              The Problem: <span className="text-primary">Digital-First Tools Can't Handle Physical Volume</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Digital card apps like Popl are fantastic when both parties have the technology, but you can't control how your prospects network. For every Popl exchange, you still receive ten physical cards. ScanBusinessCard solves the resulting productivity nightmare. We prioritize high-speed, high-volume physical scanning so your sales team can handle any type of lead capture without slowing down.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">Popl</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Requires separate card scanner for physical</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Focuses on Digital Sharing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">No data quality control</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-lg">ScanBusinessCard</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20 Cards in One Shot</strong> – Physical Bulk Scan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Designed for Event Lead Flow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Essential Preview CRM for clean data</span>
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
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4">Popl</th>
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Physical Card Bulk Scan (20+ cards)", competitor: "Requires separate card scanner", sbc: "YES: 20 Cards in One Shot" },
                    { feature: "Lead Capture Workflow for Sales", competitor: "Focuses on Digital Sharing", sbc: "YES: Designed for Event Lead Flow" },
                    { feature: "Direct HubSpot/CRM Integration", competitor: "Yes (via web/API)", sbc: "YES: Built-in, One-Tap Sync" },
                    { feature: "Data Quality Control (Preview CRM)", competitor: false, sbc: "YES: Essential for clean data" },
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

          {/* Integration Section */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              Instant Sync to Sales Tools <span className="text-primary">(HubSpot, Slack, Google Sheets)</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto">
              Whether you get the lead digitally or physically, the goal is the same: rapid follow-up. ScanBusinessCard ensures every lead is instantly available in your sales system. Stop manually entering leads from physical cards—our app does the heavy lifting, not just scanning, but immediately formatting and routing the contact information to your preferred CRM, HubSpot, or Slack channel.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">
              Still carrying physical cards?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Stop delaying follow-up. Switch from Popl and start bulk scanning and syncing leads instantly!
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

export default AltPopl;
