import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LandingPageArchived from "./pages/LandingPageArchived";
import LandingPage from "./pages/LandingPageAlternative";
import Intake from "./pages/Intake";
import JobCard from "./pages/JobCard";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import SecureJobAccess from "./pages/SecureJobAccess";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SentryTest from "./pages/SentryTest";
import Onboarding from "./pages/Onboarding";
import OnboardingPublic from "./pages/OnboardingPublic";
import AuthCallback from "./pages/AuthCallback";
import { AdminRoute } from "./components/AdminRoute";
import { ImpersonationBanner } from "./components/admin/ImpersonationBanner";
import AuthUrlSanitizer from "./components/AuthUrlSanitizer";
import { DevDrawer } from "./components/DevDrawer";
import { RequireOnboarding } from "./components/RequireOnboarding";
import { DevPreviewBanner } from "./components/DevPreviewBanner";
import { PasswordProtect } from "./components/PasswordProtect";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PasswordProtect>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ImpersonationBanner />
          <DevPreviewBanner />
          {import.meta.env.DEV && <DevDrawer />}
          <AuthUrlSanitizer />
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/index" element={<Index />} />
          <Route path="/get-started" element={<OnboardingPublic />} />
          <Route path="/onboarding" element={<OnboardingPublic />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireOnboarding>
                <Dashboard />
              </RequireOnboarding>
            }
          />
          <Route path="/job/:jobId" element={<JobCard />} />
          <Route path="/secure/:jobId" element={<SecureJobAccess />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireOnboarding>
                <Settings />
              </RequireOnboarding>
            }
          />
          <Route path="/onboarding/complete" element={<Onboarding />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {import.meta.env.DEV && <Route path="/sentry-test" element={<SentryTest />} />}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </PasswordProtect>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
