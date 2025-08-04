import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, Clock, DollarSign, Shield, Star } from "lucide-react";
import Hero from "@/components/Hero";

export default function LandingPageAlternative() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Phone,
      title: "Never Miss a Call",
      description: "Automatically respond to missed calls with SMS messages"
    },
    {
      icon: MessageSquare,
      title: "Customizable Messages",
      description: "Create templates for different scenarios and times"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Focus on your work while we handle customer communications"
    },
    {
      icon: DollarSign,
      title: "Increase Revenue",
      description: "Convert more missed calls into paying customers"
    }
  ];

  const testimonials = [
    {
      name: "Mike Thompson",
      trade: "Plumber",
      content: "This service has transformed my business. I used to lose jobs when I couldn't answer calls on site. Now I capture every lead!"
    },
    {
      name: "Sarah Chen",
      trade: "Electrician",
      content: "Game changer! My customers love the quick response, and I love not stressing about missed calls."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Using the visually enhanced Hero component */}
      <Hero />

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Manage Leads
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sign Up & Set Your Trade</h3>
                  <p className="text-muted-foreground">Tell us about your business and service areas</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Customize Your Messages</h3>
                  <p className="text-muted-foreground">Create SMS templates for different scenarios</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Connect Your Phone</h3>
                  <p className="text-muted-foreground">Get a dedicated number or use your existing one</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Never Miss a Lead</h3>
                  <p className="text-muted-foreground">Automatic SMS responses capture every opportunity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Trusted by Aussie Tradies
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.trade}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of tradies who never miss a customer again
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/onboarding')}
            className="text-lg px-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            Start Your Free Trial
          </Button>
          <p className="text-sm mt-4 opacity-75">
            14 days free • No credit card • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2025 Tradie Textback. Made with ❤️ in Australia</p>
        </div>
      </footer>
    </div>
  );
}