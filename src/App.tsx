import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Intake from "./pages/Intake";
import JobCard from "./pages/JobCard";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import SecureJobAccess from "./pages/SecureJobAccess";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import { AdminRoute } from "./components/AdminRoute";
import { ImpersonationBanner } from "./components/admin/ImpersonationBanner";
import { DevDrawer } from "./components/DevDrawer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ImpersonationBanner />
        <DevDrawer />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/job/:jobId" element={<JobCard />} />
          <Route path="/secure/:jobId" element={<SecureJobAccess />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
