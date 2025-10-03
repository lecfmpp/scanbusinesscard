import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="border-b bg-[hsl(var(--header-background))]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="MyBusinessCards.ai Logo" className="h-10 w-10" />
          <span className="text-xl font-bold text-[hsl(var(--header-foreground))]">MyBusinessCards.ai</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-[hsl(var(--header-foreground))] hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/auth" className="text-sm font-medium text-[hsl(var(--header-foreground))] hover:text-primary transition-colors">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
