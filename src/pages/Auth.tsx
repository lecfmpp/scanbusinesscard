import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import SEO from "@/components/SEO";
import { CheckCircle2, ArrowRight, Sparkles, Apple } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import TestimonialsSection from "@/components/TestimonialsSection";
import { lovable } from "@/integrations/lovable";
import { isNative, isIOS } from "@/lib/platform";
import { signInWithAppleNative } from "@/lib/platform/apple-auth";

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

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return; // browser redirect
    // session set
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      if (isNative && isIOS) {
        await signInWithAppleNative();
      } else {
        const result = await lovable.auth.signInWithOAuth("apple", {
          redirect_uri: window.location.origin + "/dashboard",
        });
        if (result.error) throw result.error;
        if (result.redirected) return;
      }
    } catch (err: any) {
      toast.error(err?.message || "Apple sign-in failed.");
      setLoading(false);
    }
  };

  const SocialButtons = () => (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-12"
        onClick={handleGoogle}
        disabled={loading}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full h-12"
        onClick={handleApple}
        disabled={loading}
      >
        <Apple className="w-4 h-4 mr-2" />
        Continue with Apple
      </Button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
    </div>
  );

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
      <div className="hidden lg:flex lg:w-1/2 gradient-orange p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-2 mb-8">
            <img src={logoIcon} alt="ScanBusinessCard" className="w-10 h-10" />
            <span className="text-xl font-bold text-foreground">ScanBusinessCard</span>
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
            <img src={logoIcon} alt="ScanBusinessCard" className="w-8 h-8" />
            <span className="text-lg font-bold text-foreground">ScanBusinessCard</span>
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

                <SocialButtons />

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
