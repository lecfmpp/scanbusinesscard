import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="border-b bg-[hsl(var(--header-background))]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Business Card to Sheets Logo" className="h-8 w-8 md:h-10 md:w-10" />
          <span className="text-base md:text-xl font-bold text-[hsl(var(--header-foreground))]">Business Card to Sheets</span>
        </Link>
        
        <nav className="flex items-center gap-3 md:gap-6">
          <Link to="/" className="text-xs md:text-sm font-medium text-[hsl(var(--header-foreground))] hover:opacity-70 transition-opacity">
            Home
          </Link>
          <Link to="/auth" className="text-xs md:text-sm font-medium text-[hsl(var(--header-foreground))] hover:opacity-70 transition-opacity">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
