import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet, useSearchParams } from "react-router-dom";
import { Calendar, Users, Receipt, LogOut, Home, Link2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-icon.png";

// `tabLabel` is the compact form for the mobile tab bar — five tabs have to fit
// across a 390px screen, where "Integrations" would wrap or truncate.
const navItems = [
  { href: "/dashboard", icon: Calendar, label: "Events", tabLabel: "Events" },
  { href: "/dashboard/leads", icon: Users, label: "All Leads", tabLabel: "Leads" },
  { href: "/dashboard/integrations", icon: Link2, label: "Integrations", tabLabel: "Connect" },
  { href: "/dashboard/billing", icon: Receipt, label: "Billing", tabLabel: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", tabLabel: "Settings" },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Handle OAuth success/error messages from callbacks
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'hubspot') {
      toast.success('HubSpot connected successfully!');
      setSearchParams({});
      // Navigate to leads page
      if (!location.pathname.includes('/leads')) {
        navigate('/dashboard/leads');
      }
    } else if (success === 'slack') {
      toast.success('Slack connected successfully!');
      setSearchParams({});
      // Navigate to leads page
      if (!location.pathname.includes('/leads')) {
        navigate('/dashboard/leads');
      }
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, navigate, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/events";
    }
    return location.pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoIcon} alt="ScanBusinessCard" className="h-7 w-7" />
            <span className="font-bold text-lg">ScanBusinessCard</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header — pt-safe keeps it clear of the notch / status bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoIcon} alt="ScanBusinessCard" className="h-7 w-7" />
            <span className="font-bold">ScanBusinessCard</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content. The mobile offsets clear the fixed header above and the
          tab bar below, both of which grow by the device's safe-area insets. */}
      <main
        className={cn(
          "flex-1 overflow-auto p-4 md:p-8",
          "pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] md:pt-8",
          "pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] md:pb-8"
        )}
      >
        <Outlet />
      </main>

      {/* Mobile tab bar. Replaces the hamburger drawer: primary navigation is
          always one thumb-reach tap away, which is what iOS users expect. */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t pb-safe">
        <ul className="flex items-stretch">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
                  <span className="text-[10px] font-medium leading-none">{item.tabLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default DashboardLayout;
