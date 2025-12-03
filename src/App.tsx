import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Pricing from "./pages/Pricing";
import CompareCamcard from "./pages/CompareCamcard";
import CompareAbbyy from "./pages/CompareAbbyy";
import CompareSansan from "./pages/CompareSansan";
import CompareHubspotScanner from "./pages/CompareHubspotScanner";
import CompareEvernote from "./pages/CompareEvernote";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import Events from "./pages/dashboard/Events";
import Leads from "./pages/dashboard/Leads";
import Billing from "./pages/dashboard/Billing";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/compare/camcard" element={<CompareCamcard />} />
            <Route path="/compare/abbyy" element={<CompareAbbyy />} />
            <Route path="/compare/sansan" element={<CompareSansan />} />
            <Route path="/compare/hubspot-scanner" element={<CompareHubspotScanner />} />
            <Route path="/compare/evernote" element={<CompareEvernote />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Events />} />
              <Route path="events" element={<Events />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/:eventId" element={<Leads />} />
              <Route path="billing" element={<Billing />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
