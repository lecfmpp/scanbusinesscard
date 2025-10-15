import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-[hsl(var(--footer-background))] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-[hsl(var(--footer-foreground))] mb-3">ScanBusinessCard</h3>
            <p className="text-sm text-[hsl(var(--footer-foreground))]/70">
              AI-powered business card scanning and contact management solution.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-[hsl(var(--footer-foreground))] mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-[hsl(var(--footer-foreground))]/70 hover:opacity-100 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[hsl(var(--footer-foreground))]/70 hover:opacity-100 transition-opacity">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-[hsl(var(--footer-foreground))] mb-3">Contact</h3>
            <p className="text-sm text-[hsl(var(--footer-foreground))]/70">
              Questions? Reach out to us at<br />
              <a href="mailto:support@businesscardtosheets.com" className="text-[hsl(var(--footer-foreground))] hover:opacity-70 transition-opacity break-all">
                support@businesscardtosheets.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-[hsl(var(--footer-foreground))]/70">
          <p>&copy; {new Date().getFullYear()} ScanBusinessCard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
