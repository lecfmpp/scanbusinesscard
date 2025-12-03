import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CompareCamcard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              ScanBusinessCard vs CamCard
            </h1>
            <p className="text-lg text-muted-foreground">
              Looking for a CamCard alternative? See why sales professionals are switching to ScanBusinessCard for faster lead capture at events.
            </p>
          </div>

          {/* Key Difference */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-8">
              The Key Difference: <span className="text-primary">Bulk Scanning</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              CamCard scans cards one at a time. ScanBusinessCard lets you snap a photo of 20+ cards at once. 
              At a busy trade show, that's the difference between hours of work and minutes.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">CamCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">One card at a time scanning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Manual alignment required</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">50 cards = 50 separate scans</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20+ cards</strong> in a single photo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI auto-detects each card</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>50 cards = 3 quick photos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-8">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">CamCard</th>
                    <th className="text-center py-4 px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Bulk Scanning", camcard: false, sbc: true },
                    { feature: "Cards per photo", camcard: "1", sbc: "20+" },
                    { feature: "Google Sheets Export", camcard: false, sbc: true },
                    { feature: "HubSpot Integration", camcard: true, sbc: true },
                    { feature: "Free Trial", camcard: true, sbc: true },
                    { feature: "Starting Price", camcard: "$5.99/mo", sbc: "$9/mo" },
                    { feature: "Cards/month (basic)", camcard: "300", sbc: "600" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.camcard === "boolean" ? (
                          row.camcard ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        ) : row.camcard}
                      </td>
                      <td className="py-4 px-4 text-center bg-primary/5">
                        {typeof row.sbc === "boolean" ? (
                          row.sbc ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        ) : <span className="font-semibold text-primary">{row.sbc}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Time Savings */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-6">
              The Real Cost: Your Time
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-muted-foreground mb-2">~2 hours</p>
                <p className="text-muted-foreground">Time to scan 100 cards with CamCard</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">~5 minutes</p>
                <p className="text-muted-foreground">Time to scan 100 cards with ScanBusinessCard</p>
              </div>
            </div>
            <p className="text-center mt-8 text-muted-foreground">
              At a trade show, those hours are better spent networking and closing deals – not hunched over your phone scanning cards one by one.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display mb-4">Never Lose a Lead Again</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of sales professionals who switched from CamCard. Start your free trial today.
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

export default CompareCamcard;
