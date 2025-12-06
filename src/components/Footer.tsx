import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-display">ScanBusinessCard</span>
            </div>
            <p className="text-sm text-secondary-foreground/70">
              The fastest way to turn business cards into actionable leads. Built for sales professionals.
            </p>
          </div>
          
          {/* Compare */}
          <div>
            <h3 className="font-semibold mb-4">Compare</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/compare/camcard" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  vs CamCard
                </Link>
              </li>
              <li>
                <Link to="/compare/abbyy" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  vs ABBYY
                </Link>
              </li>
              <li>
                <Link to="/compare/sansan" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  vs Sansan
                </Link>
              </li>
              <li>
                <Link to="/compare/hubspot-scanner" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  vs HubSpot Scanner
                </Link>
              </li>
              <li>
                <Link to="/compare/evernote" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  vs Evernote
                </Link>
              </li>
            </ul>
          </div>

          {/* Alternatives */}
          <div>
            <h3 className="font-semibold mb-4">Alternatives</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/camcard-alternative-bulk-scanner" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  CamCard Alternative
                </Link>
              </li>
              <li>
                <Link to="/popl-physical-card-scanner-alternative" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Popl Alternative
                </Link>
              </li>
              <li>
                <Link to="/abbyy-business-card-reader-alternative" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  ABBYY Alternative
                </Link>
              </li>
              <li>
                <Link to="/scanbizcards-alternative-trade-show-speed" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  ScanBizCards Alternative
                </Link>
              </li>
              <li>
                <Link to="/haystack-alternative-sales-teams" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Haystack Alternative
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-secondary-foreground/70">
              Questions? Reach out to us at<br />
              <a href="mailto:support@scanbusinesscard.com" className="text-secondary-foreground hover:text-primary transition-colors">
                support@scanbusinesscard.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/70">
          <p>&copy; {new Date().getFullYear()} ScanBusinessCard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
