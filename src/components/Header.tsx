import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-[hsl(var(--header-background))]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
          <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-[hsl(var(--header-foreground))]" />
          <span className="text-base md:text-xl font-bold text-[hsl(var(--header-foreground))]">ScanBusinessCard</span>
        </Link>
        
        <nav className="flex items-center gap-3 md:gap-6">
          <Link to="/" className="text-xs md:text-sm font-medium text-[hsl(var(--header-foreground))] hover:opacity-70 transition-opacity">
            Home
          </Link>
          <Link to="/pricing" className="text-xs md:text-sm font-medium text-[hsl(var(--header-foreground))] hover:opacity-70 transition-opacity">
            Pricing
          </Link>
          {isLoggedIn ? (
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-xs md:text-sm font-medium text-[hsl(var(--header-foreground))] hover:opacity-70 h-auto p-0"
            >
              Logout
            </Button>
          ) : (
            <Link to="/auth" className="text-xs md:text-sm font-medium text-[hsl(var(--header-foreground))] hover:opacity-70 transition-opacity">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
