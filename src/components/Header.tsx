import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Menu, X, Home, DollarSign, LogOut, LogIn } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-[hsl(var(--header-background))] backdrop-blur-sm pt-safe">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2" onClick={closeMobileMenu}>
          <img src={logoIcon} alt="ScanBusinessCard" className="w-7 h-7 md:w-8 md:h-8" />
          <span className="text-base md:text-xl font-bold text-[hsl(var(--header-foreground))]">ScanBusinessCard</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-[hsl(var(--header-foreground))] hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-[hsl(var(--header-foreground))] hover:text-primary transition-colors">
            Pricing
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                My Leads
              </Link>
              <Button 
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-sm font-medium hover:bg-primary hover:text-primary-foreground"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[hsl(var(--header-background))] border-b shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[hsl(var(--header-foreground))] hover:bg-muted transition-colors"
              onClick={closeMobileMenu}
            >
              <Home className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Home</span>
            </Link>
            <Link 
              to="/pricing" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[hsl(var(--header-foreground))] hover:bg-muted transition-colors"
              onClick={closeMobileMenu}
            >
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Pricing</span>
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">My Leads</span>
                </Link>
                <div className="border-t my-2" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[hsl(var(--header-foreground))] hover:bg-primary hover:text-primary-foreground transition-colors w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t my-2" />
                <Link 
                  to="/auth" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
