import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const CompareEvernote = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="ScanBusinessCard vs Evernote Scannable - Comparison"
        description="Compare ScanBusinessCard and Evernote Scannable. Purpose-built business card scanner with bulk scanning, CRM export, and event organization."
        canonical="https://scanbusinesscard.com/compare/evernote"
      />
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              ScanBusinessCard vs Evernote Scannable
            </h1>
            <p className="text-lg text-muted-foreground">
              Evernote Scannable is a solid document scanner, but it wasn't built for sales professionals 
              who need to capture leads fast. Here's why teams are switching.
            </p>
          </div>

          {/* Key Difference */}
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-8">
              General Scanner vs <span className="text-primary">Lead Capture Machine</span>
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Evernote Scannable handles receipts, documents, and yes – business cards one at a time. 
              ScanBusinessCard does one thing exceptionally well: turning stacks of cards into CRM-ready leads in seconds.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Evernote Scannable</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">General purpose scanner</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">One document/card at a time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Saves to Evernote only</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
                <h3 className="font-semibold mb-4">ScanBusinessCard</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Built for sales teams</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>20+ cards</strong> in one photo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Direct CRM & Sheets export</span>
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
                    <th className="text-center py-4 px-4">Evernote Scannable</th>
                    <th className="text-center py-4 px-4 bg-primary/5">ScanBusinessCard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Bulk Scanning", evernote: false, sbc: true },
                    { feature: "Cards per photo", evernote: "1", sbc: "20+" },
                    { feature: "Business Card Focus", evernote: false, sbc: true },
                    { feature: "Google Sheets Export", evernote: false, sbc: true },
                    { feature: "HubSpot Integration", evernote: false, sbc: true },
                    { feature: "Slack Integration", evernote: false, sbc: true },
                    { feature: "Price", evernote: "Free", sbc: "$49/year" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.evernote === "boolean" ? (
                          row.evernote ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        ) : row.evernote}
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

          {/* Lost Leads */}
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-6">
              The Hidden Cost of Lost Leads
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-6">
              Every business card that sits in your pocket or gets lost in a pile is a potential deal that never happened. 
              With Scannable, cards go to Evernote – great for archiving, not for action.
            </p>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              With ScanBusinessCard, your leads go directly into your sales workflow. 
              <strong> The faster you follow up, the more deals you close.</strong>
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold font-display mb-4">Turn Cards Into Customers</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Stop archiving leads. Start closing them. Try ScanBusinessCard free for 7 days.
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

export default CompareEvernote;
