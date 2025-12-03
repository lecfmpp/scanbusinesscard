import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CompareAbbyy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              ScanBusinessCard vs ABBYY Business Card Reader
            </h1>
            <p className="text-lg text-muted-foreground">
              Looking for an ABBYY alternative that saves you hours at events? ScanBusinessCard's bulk scanning feature processes 20 cards in one shot.
            </p>
          </div>

          {/* Key Difference */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-8">
              Why Professionals Are Switching
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              ABBYY Business Card Reader is great for occasional use. But when you're at a trade show collecting 50+ cards, 
              scanning them one by one means missing follow-up opportunities while your competitors are already reaching out.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">ABBYY BCR</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Single card scanning only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Premium pricing for basic features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Complex export workflow</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Bulk scan 20+ cards</strong> at once</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Simple, transparent pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>One-click export to CRM</span>
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
                    <th className="text-center py-4 px-4">ABBYY BCR</th>
                    <th className="text-center py-4 px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Bulk Scanning", abbyy: false, sbc: true },
                    { feature: "Cards per photo", abbyy: "1", sbc: "20+" },
                    { feature: "OCR Accuracy", abbyy: "High", sbc: "95%+" },
                    { feature: "Google Sheets Export", abbyy: false, sbc: true },
                    { feature: "Free Trial", abbyy: "Limited", sbc: "7 days" },
                    { feature: "Price", abbyy: "$59.99/year", sbc: "$49/year" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.abbyy === "boolean" ? (
                          row.abbyy ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        ) : row.abbyy}
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

          {/* Event Scenario */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-6">
              Picture This: End of a Trade Show
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              You've collected 75 business cards. Your flight leaves in 2 hours. With ABBYY, you're scrambling to scan cards one by one, 
              risking missing valuable contacts. With ScanBusinessCard, you spread them out, take 4 photos, and your leads are in 
              Google Sheets before you reach the airport. <strong>First mover advantage = more closed deals.</strong>
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display mb-4">Speed Wins Deals</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Don't let slow scanning cost you opportunities. Try ScanBusinessCard free for 7 days.
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

export default CompareAbbyy;
