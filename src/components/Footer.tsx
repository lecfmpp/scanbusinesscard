import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">MyBusinessCards.ai</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered business card scanning and contact management solution.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Questions? Reach out to us at<br />
              <a href="mailto:support@mybusinesscards.ai" className="text-primary hover:underline">
                support@mybusinesscards.ai
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MyBusinessCards.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
