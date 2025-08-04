import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { User, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingPreset {
  id: string;
  name: string;
  description: string;
  route: string;
  trade: string;
  location: string;
  userEmail: string;
  userPassword: string;
  step: number;
  stepDescription: string;
}

const ONBOARDING_PRESETS: OnboardingPreset[] = [
  {
    id: 'mike-plumber',
    name: 'Mike - Not Started',
    description: 'Plumber, hasn\'t started onboarding',
    route: '/onboarding',
    trade: 'plumber',
    location: 'Sydney',
    userEmail: 'mike.plumber@test.local',
    userPassword: 'testpass123',
    step: 0,
    stepDescription: 'Step 0 - Welcome',
  },
  {
    id: 'sarah-electrician',
    name: 'Sarah - Basic Info',
    description: 'Electrician, completed basic info',
    route: '/onboarding',
    trade: 'electrician',
    location: 'Melbourne',
    userEmail: 'sarah.sparky@test.local',
    userPassword: 'testpass123',
    step: 2,
    stepDescription: 'Step 2 - Basic Info Complete',
  },
  {
    id: 'dave-carpenter',
    name: 'Dave - Business Details',
    description: 'Carpenter, completed business details',
    route: '/onboarding',
    trade: 'carpenter',
    location: 'Brisbane',
    userEmail: 'dave.carpenter@test.local',
    userPassword: 'testpass123',
    step: 4,
    stepDescription: 'Step 4 - Business Details Complete',
  },
  {
    id: 'lisa-hvac',
    name: 'Lisa - Service Areas',
    description: 'HVAC, completed service areas',
    route: '/onboarding',
    trade: 'hvac',
    location: 'Perth',
    userEmail: 'lisa.hvac@test.local',
    userPassword: 'testpass123',
    step: 6,
    stepDescription: 'Step 6 - Service Areas Complete',
  },
  {
    id: 'tom-handyman',
    name: 'Tom - SMS Templates',
    description: 'Handyman, completed SMS templates',
    route: '/onboarding',
    trade: 'handyman',
    location: 'Adelaide',
    userEmail: 'tom.handyman@test.local',
    userPassword: 'testpass123',
    step: 8,
    stepDescription: 'Step 8 - SMS Templates Complete',
  },
  {
    id: 'emma-landscaper',
    name: 'Emma - Fully Onboarded',
    description: 'Landscaper, fully onboarded',
    route: '/dashboard',
    trade: 'landscaper',
    location: 'Darwin',
    userEmail: 'emma.landscape@test.local',
    userPassword: 'testpass123',
    step: 10,
    stepDescription: 'Step 10 - Fully Onboarded',
  },
  {
    id: 'jack-locksmith',
    name: 'Jack - Emergency Services',
    description: 'Locksmith, 24/7 emergency services',
    route: '/dashboard',
    trade: 'locksmith',
    location: 'Canberra',
    userEmail: 'jack.locksmith@test.local',
    userPassword: 'testpass123',
    step: 10,
    stepDescription: 'Step 10 - Fully Onboarded (24/7)',
  },
  {
    id: 'maria-painter',
    name: 'Maria - Multi-trade',
    description: 'Painter, multi-trade specialist',
    route: '/dashboard',
    trade: 'painter',
    location: 'Sydney',
    userEmail: 'maria.painter@test.local',
    userPassword: 'testpass123',
    step: 10,
    stepDescription: 'Step 10 - Multi-trade Specialist',
  },
];

export function OnboardingPresets() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Apply onboarding test user preset (direct login)
  const applyOnboardingPreset = async (preset: OnboardingPreset) => {
    setLoading(true);
    
    try {
      // Sign out current user first
      await supabase.auth.signOut();
      
      // Clear caches and session data
      queryClient.clear();
      sessionStorage.clear();
      
      // Sign in as the specific test user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: preset.userEmail,
        password: preset.userPassword
      });
      
      if (error) {
        console.error('Test user login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "❌ Test User Not Found",
            description: "Please run the onboarding test data script first: scripts/create-onboarding-test-data.sql",
            variant: "destructive",
          });
        } else {
          toast({
            title: "❌ Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      // Store preset data for debugging
      localStorage.setItem('devTrade', preset.trade);
      localStorage.setItem('devLocation', preset.location);
      localStorage.setItem('devOnboardingStep', preset.step.toString());
      
      // Invalidate queries to refetch with new user
      await queryClient.invalidateQueries();
      
      // Small delay to ensure auth state propagates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to preset route
      navigate(preset.route);
      
      toast({
        title: "✅ Test User Loaded",
        description: `Logged in as ${preset.name}`,
      });
      
    } catch (error) {
      console.error('Onboarding preset error:', error);
      toast({
        title: "❌ Preset Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  // Copy login credentials for manual testing
  const copyCredentials = (preset: OnboardingPreset) => {
    const credentials = `Email: ${preset.userEmail}\nPassword: ${preset.userPassword}`;
    navigator.clipboard.writeText(credentials);
    toast({
      title: "✅ Credentials Copied",
      description: "Login credentials copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Onboarding Test Users</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Login as specific test users at different onboarding stages
        </p>
      </div>
      
      <div className="space-y-3">
        {ONBOARDING_PRESETS.map((preset) => (
          <div key={preset.id} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {preset.trade}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {preset.location}
                  </Badge>
                  <Badge variant={preset.step === 10 ? "default" : "secondary"} className="text-xs">
                    {preset.stepDescription}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => applyOnboardingPreset(preset)}
                disabled={loading}
              >
                <User className="h-3 w-3 mr-1" />
                Login & Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCredentials(preset)}
                title="Copy login credentials"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• All test users use password: testpass123</p>
        <p>• Run scripts/create-onboarding-test-data.sql first</p>
        <p>• Each user represents a different onboarding stage</p>
        <p>• Fully onboarded users have complete profiles</p>
      </div>
    </div>
  );
}