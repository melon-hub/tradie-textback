import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Mail, ArrowLeft, CheckCircle, Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const AuthPage = () => {
  const [step, setStep] = useState<'phone' | 'sent' | 'verified'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('email'); // Default to email for dev
  const [userType, setUserType] = useState<'tradie' | 'client'>('client');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const location = useLocation();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(redirectTo);
      }
    };
    checkAuth();
  }, [navigate, redirectTo]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setStep('verified');
          toast({
            title: "Welcome back!",
            description: "You're now signed in",
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate(redirectTo);
          }, 1500);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo, toast]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Australian mobile number
    if (digits.startsWith('61')) {
      return `+${digits}`;
    } else if (digits.startsWith('04')) {
      return `+61${digits.substring(1)}`;
    } else if (digits.startsWith('4')) {
      return `+614${digits.substring(1)}`;
    } else if (digits.length === 9) {
      return `+614${digits}`;
    }
    
    return `+61${digits}`;
  };

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let authOptions;
      let successMessage;

      if (authMethod === 'email') {
        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }

        authOptions = {
          email: email,
          options: {
            shouldCreateUser: true,
            data: {
              name: name || 'User',
              email: email,
              user_type: userType,
              address: address || null
            }
          }
        };
        successMessage = "Check your email for the login link";

      } else {
        const formattedPhone = formatPhoneNumber(phone);
        
        if (formattedPhone.length < 12) {
          throw new Error('Please enter a valid Australian mobile number');
        }

        authOptions = {
          phone: formattedPhone,
          options: {
            shouldCreateUser: true,
            data: {
              name: name || 'User',
              phone: formattedPhone,
              user_type: userType,
              address: address || null
            }
          }
        };
        successMessage = "Check your SMS for the login link";
      }

      const { error } = await supabase.auth.signInWithOtp(authOptions);

      if (error) throw error;

      setStep('sent');
      toast({
        title: "Magic link sent!",
        description: successMessage,
      });

    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Failed to send magic link');
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resendLink = async () => {
    await sendMagicLink({ preventDefault: () => {} } as React.FormEvent);
  };

  if (step === 'verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6 space-y-6">
            <div className="bg-success/10 p-6 rounded-full w-fit mx-auto">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Welcome Back!</h2>
              <p className="text-muted-foreground">
                You're successfully signed in. Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 backdrop-blur-sm border border-primary/20 rounded-xl p-4 mb-4">
            <h1 className="text-xl font-bold text-primary">TradiePro Access</h1>
            <p className="text-sm text-muted-foreground">Quick & secure mobile login</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {step === 'phone' ? (
                <>
                  <Smartphone className="h-5 w-5" />
                  Login with Phone
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Check Your SMS
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {step === 'phone' && (
              <form onSubmit={sendMagicLink} className="space-y-4">
                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={userType === 'tradie' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setUserType('tradie')}
                    >
                      Tradie
                    </Button>
                    <Button
                      type="button"
                      variant={userType === 'client' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setUserType('client')}
                    >
                      Client
                    </Button>
                  </div>
                </div>

                {/* Authentication Method Selection */}
                <div className="space-y-2">
                  <Label>Login Method</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={authMethod === 'email' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setAuthMethod('email')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={authMethod === 'phone' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setAuthMethod('phone')}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Phone
                    </Button>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Address Input */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your full address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Email or Phone Input */}
                {authMethod === 'email' ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send you a secure login link via email
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0412 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send you a secure login link via SMS
                    </p>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Login Link
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === 'sent' && (
              <div className="text-center space-y-4">
                <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Check your SMS</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a secure login link to <strong>{formatPhoneNumber(phone)}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tap the link in your SMS to sign in instantly
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={resendLink}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Sending...' : 'Resend Link'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep('phone')}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Use Different Number
                  </Button>
                </div>
              </div>
            )}

            {/* Back to home link */}
            <div className="text-center">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help text */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Secure authentication powered by Supabase</p>
          <p>Your phone number is used only for login verification</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;