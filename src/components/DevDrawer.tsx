import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  User,
  Navigation,
  Database,
  Copy,
  RefreshCw,
  Key,
  Home,
  FileText,
  Settings,
  Shield,
  Briefcase,
  LogIn,
  LogOut,
  Search,
  FormInput,
} from "lucide-react";
import { DevAuthSwitch, DevRole } from "@/lib/dev-auth-switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingMockDataFiller } from "@/components/dev/OnboardingMockDataFiller";
import { useDevPreview } from "@/hooks/useDevPreview";
import { devPreview } from "@/lib/dev-preview";
import { devExistingSession } from "@/lib/dev-existing-session";
import { TestDataManagerComponent } from "@/components/dev/TestDataManager";

// Route configuration
const ROUTES = [
  { path: "/", label: "Home", icon: Home },
  { path: "/intake", label: "Job Intake", icon: FileText },
  { path: "/dashboard", label: "Dashboard", icon: Briefcase },
  { path: "/onboarding", label: "Onboarding", icon: User },
  { path: "/admin", label: "Admin Panel", icon: Shield },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/auth", label: "Auth/Login", icon: LogIn },
];

// Check environment flags
const isDevMode =
  import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS === "true";
const isDemoMode = import.meta.env.VITE_DEMO_TOOLS === "true";
const isEnabled = isDevMode || isDemoMode;

// Demo presets for quick scenario setup
interface DemoPreset {
  id: string;
  name: string;
  description: string;
  role: DevRole;
  route: string;
  trade?: string;
  location?: string;
  onboardingStep?: string;
  twilioStatus?: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "new-job-flow",
    name: "New Job Flow",
    description: "Client with new urgent job",
    role: "client" as DevRole,
    route: "/intake",
  },
  {
    id: "tradie-dashboard",
    name: "Tradie View",
    description: "Tradie viewing available jobs",
    role: "tradie" as DevRole,
    route: "/dashboard",
  },
  {
    id: "admin-overview",
    name: "Admin Overview",
    description: "Admin monitoring system",
    role: "admin" as DevRole,
    route: "/admin",
  },
  {
    id: "plumber-sydney",
    name: "Plumber Sydney",
    description: "Complete profile, licensed plumber",
    role: "tradie" as DevRole,
    route: "/dashboard",
    trade: "plumbing",
    location: "Sydney",
    onboardingStep: "complete",
  },
  {
    id: "electrician-melbourne",
    name: "Electrician Melbourne",
    description: "Licensed electrician with certifications",
    role: "tradie" as DevRole,
    route: "/dashboard",
    trade: "electrical",
    location: "Melbourne",
    onboardingStep: "complete",
  },
  {
    id: "incomplete-onboarding",
    name: "Incomplete Setup",
    description: "Tradie stuck at step 2 onboarding",
    role: "tradie" as DevRole,
    route: "/onboarding",
    onboardingStep: "2",
  },
  {
    id: "twilio-configured",
    name: "SMS Ready",
    description: "Twilio configured and active",
    role: "tradie" as DevRole,
    route: "/dashboard",
    twilioStatus: "configured",
  },
  {
    id: "twilio-pending",
    name: "SMS Pending",
    description: "Twilio setup pending verification",
    role: "tradie" as DevRole,
    route: "/settings",
    twilioStatus: "pending",
  },
];

export function DevDrawer() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role: previewRole, setRole: setPreviewRole, clear: clearPreview } = useDevPreview();

  // Memoize DevAuthSwitch to prevent recreation on every render
  const devAuth = useMemo(() => new DevAuthSwitch(queryClient), [queryClient]);

  // Debug auth state changes
  useEffect(() => {
    console.log('DevDrawer auth state updated:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileName: profile?.name,
      isAdmin: profile?.is_admin,
      userType: profile?.user_type
    });
  }, [user, profile]);

  // Keyboard shortcut: Ctrl+` - must be called before early return
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Only show in development or demo mode
  if (!isEnabled) return null;

  // Filter routes based on search
  const filteredRoutes = ROUTES.filter(
    (route) =>
      route.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.path.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle role switch
  const handleRoleSwitch = async (role: DevRole) => {
    setLoading(true);
    const result = await devAuth.switchToRole(role, {
      navigateTo: getDefaultRouteForRole(role),
      clearAll: false,
    });

    if (result.success) {
      toast({
        title: "✅ Switched Role",
        description: `Now logged in as ${role}`,
      });

      // Close drawer
      setOpen(false);

      // Navigate to appropriate route for the role
      const targetRoute = result.navigateTo || getDefaultRouteForRole(role);
      if (targetRoute) {
        navigate(targetRoute);
      }
    } else {
      toast({
        title: "❌ Switch Failed",
        description: result.error,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Get default route for role
  const getDefaultRouteForRole = (role: DevRole): string => {
    switch (role) {
      case "admin":
        return "/admin";
      case "tradie":
        return "/dashboard";
      case "client":
        return "/intake";
      default:
        return "/";
    }
  };

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  // Seed demo data
  const seedDemoData = async () => {
    setLoading(true);
    try {
      // Add more demo jobs
      const demoJobs = [
        {
          customer_name: "John Demo",
          phone: "+61412345678",
          address: "456 Demo St, Sydney NSW",
          job_type: "Plumbing",
          location: "Sydney NSW",
          urgency: "urgent",
          status: "new",
          description: "Burst pipe in bathroom - URGENT",
          estimated_value: 800,
        },
        {
          customer_name: "Sarah Test",
          phone: "+61498765432",
          address: "789 Test Ave, Melbourne VIC",
          job_type: "Electrical",
          location: "Melbourne VIC",
          urgency: "medium",
          status: "contacted",
          description: "Install outdoor lighting",
          estimated_value: 1200,
        },
      ];

      for (const job of demoJobs) {
        const { error } = await supabase.from("jobs").insert(job);
        if (error) console.error("Error seeding job:", error);
      }

      toast({
        title: "✅ Demo Data Seeded",
        description: "Added demo jobs to database",
      });

      queryClient.invalidateQueries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed demo data",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Clear local storage
  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "✅ Storage Cleared",
      description: "Local and session storage cleared",
    });
  };

  // Copy deep link
  const copyDeepLink = (preset?: DemoPreset) => {
    const currentRole = devAuth.getCurrentRole() || "client";
    const params = new URLSearchParams();

    // Add role parameter
    params.set("devRole", preset?.role || currentRole);

    // Add preset-specific parameters if provided
    if (preset) {
      params.set("preset", preset.id);
      if (preset.trade) params.set("trade", preset.trade);
      if (preset.location) params.set("location", preset.location);
      if (preset.onboardingStep)
        params.set("onboardingStep", preset.onboardingStep);
      if (preset.twilioStatus) params.set("twilioStatus", preset.twilioStatus);
    }

    const deepLink = `${window.location.origin}${preset?.route || location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(deepLink);
    toast({
      title: "✅ Link Copied",
      description: "Deep link copied to clipboard",
    });
  };

  // Get current role display
  const getCurrentRoleDisplay = () => {
    if (!user) return "Not logged in";

    const isAdmin = profile?.is_admin;
    const role = profile?.user_type;

    if (isAdmin) return "admin";
    if (role === 'tradie') return "tradie";
    if (role === 'client') return "client";
    
    // If we have a user but no profile yet, show loading
    return "Loading...";
  };

  // Get display name
  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.email) return user.email;
    return "Unknown User";
  };

  // Apply demo preset
  const applyPreset = async (preset: DemoPreset) => {
    setLoading(true);

    // First switch role with preset-specific navigation
    const result = await devAuth.switchToRole(preset.role, {
      navigateTo: preset.route,
      clearAll: false,
    });

    if (result.success) {
      // Store preset-specific data for the application to use
      if (preset.trade) localStorage.setItem("devTrade", preset.trade);
      if (preset.location) localStorage.setItem("devLocation", preset.location);
      if (preset.onboardingStep)
        localStorage.setItem("devOnboardingStep", preset.onboardingStep);
      if (preset.twilioStatus)
        localStorage.setItem("devTwilioStatus", preset.twilioStatus);

      // Navigate to preset route
      navigate(preset.route);
      setOpen(false);

      toast({
        title: "✅ Preset Applied",
        description: `Switched to ${preset.name}`,
      });
    } else {
      toast({
        title: "❌ Preset Failed",
        description: result.error,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium z-50">
          🎭 DEMO MODE - Using safe demo data only
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        {/* Floating FAB with responsive positioning */}
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 z-50">
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg transition-all hover:scale-105"
              onClick={() => setOpen(true)}
              title="Dev Tools (Ctrl+`)"
            >
              <Code2 className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="right" className="w-full sm:w-[400px] md:w-[450px] lg:w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Dev Tools</SheetTitle>
            <SheetDescription>
              Quick navigation and role switching (Ctrl+`)
            </SheetDescription>
          </SheetHeader>

          {/* Current Status */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Role</p>
                <p className="text-lg font-bold capitalize">
                  {getCurrentRoleDisplay()}
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                {getDisplayName()}
              </Badge>
            </div>
            {profile?.phone && (
              <p className="text-xs text-muted-foreground mt-1">
                {profile.phone}
              </p>
            )}
          </div>

          <Tabs defaultValue="navigate" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="navigate">
                <Navigation className="h-4 w-4 mr-1" />
                Navigate
              </TabsTrigger>
              <TabsTrigger value="auth">
                <User className="h-4 w-4 mr-1" />
                Auth
              </TabsTrigger>
              <TabsTrigger value="tools">
                <Database className="h-4 w-4 mr-1" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="onboarding">
                <FormInput className="h-4 w-4 mr-1" />
                Onboard
              </TabsTrigger>
            </TabsList>

            {/* Navigation Tab */}
            <TabsContent value="navigate" className="space-y-4">
              <div>
                <Label htmlFor="route-search">Search Routes</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="route-search"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredRoutes.map((route) => {
                  const Icon = route.icon;
                  const isActive = location.pathname === route.path;

                  return (
                    <Button
                      key={route.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigate(route.path)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {route.label}
                      {isActive && (
                        <Badge className="ml-auto" variant="secondary">
                          Current
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </TabsContent>

            {/* Auth Tab */}
            <TabsContent value="auth" className="space-y-4">
              {/* Preview Mode Section */}
              <div>
                <Label>Preview Mode (Instant - No Auth)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  View pages as different roles without authentication
                </p>
                
                {/* Show current preview if active */}
                {previewRole && (
                  <div className="bg-primary/10 border border-primary/20 rounded p-2 mb-3 flex items-center justify-between">
                    <span className="text-sm">Previewing as: <strong>{devPreview.getDisplayName(previewRole)}</strong></span>
                    <Button
                      onClick={() => {
                        clearPreview();
                        toast({
                          title: "Preview Mode Cleared",
                          description: "Returned to normal authentication"
                        });
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      Clear
                    </Button>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button 
                    onClick={() => {
                      setPreviewRole('tradie');
                      devPreview.navigateToRolePage('tradie');
                      setOpen(false);
                      toast({
                        title: "Preview Mode Active",
                        description: "Viewing as Tradie"
                      });
                    }}
                    variant={previewRole === 'tradie' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Tradie
                  </Button>
                  <Button 
                    onClick={() => {
                      setPreviewRole('client');
                      devPreview.navigateToRolePage('client');
                      setOpen(false);
                      toast({
                        title: "Preview Mode Active", 
                        description: "Viewing as Client"
                      });
                    }}
                    variant={previewRole === 'client' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Client
                  </Button>
                  <Button 
                    onClick={() => {
                      setPreviewRole('admin');
                      devPreview.navigateToRolePage('admin');
                      setOpen(false);
                      toast({
                        title: "Preview Mode Active",
                        description: "Viewing as Admin"
                      });
                    }}
                    variant={previewRole === 'admin' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Admin
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Show sign out button if logged in */}
              {user && (
                <>
                  <div>
                    <Label>Current Session</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Signed in as {user.email}
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await supabase.auth.signOut();
                          toast({
                            title: "Signed Out",
                            description: "You have been signed out successfully"
                          });
                          navigate('/');
                        } catch (error) {
                          toast({
                            title: "Sign Out Failed",
                            description: "Could not sign out",
                            variant: "destructive"
                          });
                        }
                        setLoading(false);
                      }}
                      disabled={loading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                  <Separator />
                </>
              )}

              {/* Only show login options when not logged in */}
              {!user && (
                <div>
                  <Label>Quick Magic Link Login</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign in as a test user
                  </p>
                  <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const result = await devExistingSession('tradie');
                        if (!result.success) {
                          throw new Error(result.error || "Login failed");
                        }
                        // Magic link will redirect automatically
                      } catch (error: any) {
                        console.error("Dev login error:", error);
                        toast({
                          title: "Login Failed",
                          description:
                            error.message || "Could not generate magic link",
                          variant: "destructive",
                        });
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    🔧 Login as Tradie
                    <Badge className="ml-auto" variant="secondary">
                      testtradie@dev.local
                    </Badge>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const result = await devExistingSession('client');
                        if (!result.success) {
                          throw new Error(result.error || "Login failed");
                        }
                        // Magic link will redirect automatically
                      } catch (error: any) {
                        console.error("Dev login error:", error);
                        toast({
                          title: "Login Failed",
                          description:
                            error.message || "Could not generate magic link",
                          variant: "destructive",
                        });
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    👤 Login as Client
                    <Badge className="ml-auto" variant="secondary">
                      testclient@dev.local
                    </Badge>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const result = await devExistingSession('admin');
                        if (!result.success) {
                          throw new Error(result.error || "Login failed");
                        }
                        // Magic link will redirect automatically
                      } catch (error: any) {
                        console.error("Dev login error:", error);
                        toast({
                          title: "Login Failed",
                          description:
                            error.message || "Could not generate magic link",
                          variant: "destructive",
                        });
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    👑 Login as Admin
                    <Badge className="ml-auto" variant="secondary">
                      testadmin@dev.local
                    </Badge>
                  </Button>
                </div>
                </div>
              )}

              <Separator />

              <div>
                <Label>Session Info</Label>
                <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
                  <p>User ID: {user?.id?.slice(0, 8) || "None"}</p>
                  <p>Email: {user?.email || "None"}</p>
                  <p>Role: {getCurrentRoleDisplay()}</p>
                </div>
              </div>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-4">
              {/* Demo Presets (Always Available) */}
              <div>
                <Label>Demo Scenarios</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Quick setup for common demo flows
                </p>
                <div className="space-y-2">
                  {DEMO_PRESETS.map((preset) => (
                    <div key={preset.id} className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 justify-start"
                        onClick={() => applyPreset(preset)}
                        disabled={loading}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {preset.description}
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyDeepLink(preset)}
                        title="Copy deep link for this preset"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Demo-Safe Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => copyDeepLink()}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Current Deep Link
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    queryClient.invalidateQueries();
                    toast({
                      title: "✅ Refreshed",
                      description: "All data refreshed from server",
                    });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All Data
                </Button>

                {/* Dev-Only Actions */}
                {isDevMode && !isDemoMode && (
                  <>
                    <Separator />
                    <Label>Dev-Only Actions</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={seedDemoData}
                      disabled={loading}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Seed Demo Data
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={clearStorage}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Storage
                    </Button>
                  </>
                )}
              </div>

              <Separator />

              <div>
                <Label>Quick Tips</Label>
                <div className="mt-2 space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    • Press Ctrl+` to toggle this drawer
                  </p>
                  {isDemoMode ? (
                    <p className="text-muted-foreground">
                      • Demo mode - safe actions only
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      • Dev mode - all actions available
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    • Changes persist in database
                  </p>
                </div>
              </div>
              
              {/* Test Data Manager - Only for authenticated users */}
              {user && (
                <>
                  <Separator />
                  <TestDataManagerComponent />
                </>
              )}
            </TabsContent>

            {/* Onboarding Tab */}
            <TabsContent value="onboarding" className="space-y-4">
              <OnboardingMockDataFiller />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
