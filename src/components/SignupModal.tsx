import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle, Loader2 } from "lucide-react";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadsCount: number;
  onSuccess: (eventId: string) => void;
}

const SignupModal = ({ isOpen, onClose, leadsCount, onSuccess }: SignupModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!eventName.trim()) {
        toast.error("Please enter an event name");
        return;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      let userId: string;

      if (mode === "signup") {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            toast.error("This email is already registered. Please log in instead.");
            setMode("login");
            setLoading(false);
            return;
          }
          throw signUpError;
        }

        if (!signUpData.user) throw new Error("Failed to create account");
        userId = signUpData.user.id;
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast.error("Invalid email or password");
          setLoading(false);
          return;
        }

        if (!signInData.user) throw new Error("Failed to sign in");
        userId = signInData.user.id;
      }

      // Create the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          user_id: userId,
          name: eventName.trim(),
        })
        .select()
        .single();

      if (eventError) throw eventError;

      toast.success(mode === "signup" ? "Account created successfully!" : "Signed in successfully!");
      onSuccess(eventData.id);
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Your CRM is Ready!
          </DialogTitle>
          <DialogDescription className="text-base">
            <span className="text-primary font-semibold">{leadsCount} lead{leadsCount !== 1 ? 's' : ''}</span> extracted and ready to save. 
            {mode === "signup" ? " Create an account" : " Sign in"} to access your leads.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              placeholder="e.g., CES 2025, Tech Conference NYC"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Where did you collect these business cards?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-email">Email</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-password">Password</Label>
            <Input
              id="modal-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "signup" ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              mode === "signup" ? "Create Account & Save Leads" : "Sign In & Save Leads"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
