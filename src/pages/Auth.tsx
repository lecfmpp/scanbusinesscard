import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import SEO from "@/components/SEO";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import TestimonialsSection from "@/components/TestimonialsSection";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const CRM_OPTIONS = [
  { id: "hubspot", label: "HubSpot" },
  { id: "salesforce", label: "Salesforce" },
  { id: "pipedrive", label: "Pipedrive" },
  { id: "zoho", label: "Zoho CRM" },
  { id: "sheets", label: "Google Sheets" },
  { id: "other", label: "Other" },
];

const FEATURES = [
  "Scan 20+ business cards in one photo",
  "Auto-sync leads to HubSpot & Slack",
  "Never lose a lead from events again",
];

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCRM, setSelectedCRM] = useState("");
  const [customCRM, setCustomCRM] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (!selectedCRM || (selectedCRM === "other" && !customCRM.trim())) {
      toast.error("Please select or enter your CRM");
      return;
    }

    const crmValue = selectedCRM === "other" ? customCRM.trim() : selectedCRM;

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          preferred_crm: crmValue
        }
      }
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please log in instead.");
        setIsLoginMode(true);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created successfully!");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message);
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <SEO
        title="Sign In or Create Account"
        description="Sign in to ScanBusinessCard to access your dashboard, manage leads, and export contacts to your CRM."
        canonical="https://scanbusinesscard.com/auth"
        noIndex={true}
      />
      
      {/* Left side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 gradient-backdrop p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-3 mb-12">
            <img src={logo} alt="ScanBusinessCard" className="h-10" />
          </a>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 10,000+ sales pros</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
              Stop losing leads<br />
              from every event.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-md">
              The fastest way to turn a pile of business cards into qualified leads in your CRM.
            </p>
          </div>
          
          <div className="mt-8 space-y-3">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="relative z-10 mt-8">
          <TestimonialsSection />
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b border-border">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="ScanBusinessCard" className="h-8" />
          </a>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {showForgotPassword ? (
              /* Forgot Password Form */
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Reset your password</h2>
                  <p className="text-muted-foreground mt-2">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>
                
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
                
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm text-primary hover:underline"
                >
                  ← Back to login
                </button>
              </div>
            ) : isLoginMode ? (
              /* Login Form */
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                  <p className="text-muted-foreground mt-2">
                    Sign in to manage your leads and integrations.
                  </p>
                </div>
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? "Signing in..." : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsLoginMode(false)}
                    className="text-primary font-medium hover:underline"
                  >
                    Create one
                  </button>
                </div>
              </div>
            ) : (
              /* Sign Up Form */
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
                  <p className="text-muted-foreground mt-2">
                    Start scanning business cards in seconds.
                  </p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Work email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 6 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>What CRM do you use?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {CRM_OPTIONS.map((crm) => (
                        <button
                          key={crm.id}
                          type="button"
                          onClick={() => setSelectedCRM(crm.id)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            selectedCRM === crm.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:border-primary/50 text-foreground"
                          }`}
                        >
                          {crm.label}
                        </button>
                      ))}
                    </div>
                    {selectedCRM === "other" && (
                      <Input
                        type="text"
                        placeholder="Enter your CRM or tool name"
                        value={customCRM}
                        onChange={(e) => setCustomCRM(e.target.value)}
                        className="mt-2 h-12"
                        autoFocus
                      />
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? "Creating account..." : (
                      <>
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
                
                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-foreground">Terms</a>
                  {" "}and{" "}
                  <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
                </p>
                
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
