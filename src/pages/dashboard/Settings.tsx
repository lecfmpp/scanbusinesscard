import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Loader2, ShieldAlert } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be signed in.");
        return;
      }

      const { error } = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      await supabase.auth.signOut();
      toast.success("Your account has been deleted.");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Delete account failed:", message);
      toast.error(`Failed to delete account: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and data
        </p>
      </div>

      <Card className="p-6 border-destructive/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Delete account</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Permanently delete your account and all associated data: events,
              leads, integrations, and subscription records. This cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete my account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your account, all your scanned
                    leads, events, and connected integrations. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
