import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, ScanLine, Sparkles, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const AltAbbyy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="ABBYY Alternative: The Business Card Scanner with Full Sales Workflow & Preview CRM"
        description="ABBYY is accurate, but stops short of lead qualification. Choose the sales-focused ABBYY Business Card Reader alternative that includes Bulk Scan and Preview CRM."
        canonical="https://www.scanbusinesscard.com/abbyy-business-card-reader-alternative"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ScanLine className="w-4 h-4" />
              ABBYY Alternative
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              Need More Than Just OCR? The ABBYY Alternative with <span className="text-primary">Full Sales Workflow & Preview CRM</span>.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ABBYY is a leader in OCR technology, and we respect their commitment to accuracy. However, for a high-performing sales team, OCR is only the first step. The business card scanner you choose must be integrated into a larger, automated workflow that prioritizes speed, data quality, and follow-up. ABBYY is a great data capture tool; ScanBusinessCard is a great Sales Tool. We combine industry-leading OCR with Bulk Scanning and robust CRM automation to move leads from pocket to pipeline instantly.
            </p>
          </div>

          {/* Accuracy + Efficiency Section */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              Accuracy Meets Efficiency: <span className="text-primary">Why Single-Card Scanners Slow Down Sales</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              ABBYY requires single-card processing, meaning highly accurate data capture comes at the cost of time and volume. For sales teams handling hundreds of leads at a conference, this bottleneck is unacceptable. Our app features high-accuracy OCR combined with True Bulk Scanning—process 20 cards in one shot without sacrificing the quality of the data. You get both speed and accuracy.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-lg">ABBYY BCR</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Single Card Focus – No Bulk Scan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Limited sales follow-up automation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Requires Manual Export to CRM</span>
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
                    <span>Integrated Task Creation & Follow-up</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Automated, One-Tap HubSpot/Slack Sync</span>
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
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4">ABBYY BCR</th>
                    <th className="text-center py-2 px-2 sm:py-4 sm:px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "High-Speed Bulk Scan (20 cards)", competitor: "No (Single Card Focus)", sbc: "YES: 20 Cards at Once" },
                    { feature: "Pre-CRM Lead Qualification", competitor: false, sbc: "YES: Essential Preview CRM" },
                    { feature: "Sales Follow-up Automation", competitor: "Limited", sbc: "YES: Integrated Task Creation" },
                    { feature: "Direct HubSpot/Slack Integration", competitor: "Requires Manual Export", sbc: "YES: Automated, One-Tap Sync" },
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

          {/* Preview CRM Section */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-center mb-6">
              Lead Quality is King: <span className="text-primary">The Power of the Preview CRM</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-8">
              Don't trust raw OCR data to go straight into your valuable CRM. Unlike ABBYY, ScanBusinessCard features an exclusive Preview CRM dashboard. This step allows the salesperson to rapidly review, correct, and add essential notes (like lead score, interest level, and follow-up urgency) before the data hits HubSpot. This quality control step ensures your team only pursues qualified leads, maximizing conversion efficiency.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-background rounded-2xl p-6">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">High-Accuracy OCR</p>
                <p className="text-sm text-muted-foreground">Industry-leading recognition</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Preview CRM</p>
                <p className="text-sm text-muted-foreground">Quality control before sync</p>
              </div>
              <div className="bg-background rounded-2xl p-6">
                <Check className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">Lead Qualification</p>
                <p className="text-sm text-muted-foreground">Add notes & scores</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">
              Go Beyond OCR.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Qualify leads, automate sync, and sell faster. Try the ABBYY alternative built for the modern sales workflow.
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

export default AltAbbyy;
