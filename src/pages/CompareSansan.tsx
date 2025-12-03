import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const CompareSansan = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="ScanBusinessCard vs Sansan - Business Card Scanner Comparison"
        description="Compare ScanBusinessCard and Sansan. Affordable bulk card scanning for small teams vs enterprise pricing. Capture 20+ leads in one photo."
        canonical="https://scanbusinesscard.com/compare/sansan"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              ScanBusinessCard vs Sansan
            </h1>
            <p className="text-lg text-muted-foreground">
              Sansan is great for enterprise teams, but if you're an individual sales rep or small team looking for fast, 
              affordable bulk scanning – ScanBusinessCard delivers more value.
            </p>
          </div>

          {/* Key Difference */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-8">
              Enterprise vs <span className="text-primary">Speed & Simplicity</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sansan focuses on company-wide contact databases with complex workflows. ScanBusinessCard focuses on one thing: 
              getting your event leads into your CRM as fast as humanly possible.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Sansan</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Enterprise pricing (contact sales)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Complex onboarding process</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Single card scanning</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>$49/year</strong> – transparent pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Start scanning in 60 seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20+ cards</strong> per photo</span>
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
                    <th className="text-center py-4 px-4">Sansan</th>
                    <th className="text-center py-4 px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Bulk Scanning", sansan: false, sbc: true },
                    { feature: "Cards per photo", sansan: "1", sbc: "20+" },
                    { feature: "Instant Setup", sansan: false, sbc: true },
                    { feature: "Google Sheets Export", sansan: true, sbc: true },
                    { feature: "Free Trial", sansan: "Demo only", sbc: "7 days free" },
                    { feature: "Best For", sansan: "Enterprise", sbc: "Individuals & Teams" },
                    { feature: "Price", sansan: "Contact sales", sbc: "$49/year" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.sansan === "boolean" ? (
                          row.sansan ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        ) : row.sansan}
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

          {/* Use Case */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-6">
              Perfect for Event-Driven Sales
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Trade shows, conferences, networking events – these are goldmines for leads. But only if you can follow up fast. 
              While Sansan users are waiting for IT to set up their account, you've already emailed 100 new contacts 
              and scheduled 5 demos. <strong>Speed is your competitive advantage.</strong>
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display mb-4">Move Fast, Close More</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              No enterprise sales process. No waiting. Just results. Start your free trial now.
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

export default CompareSansan;
