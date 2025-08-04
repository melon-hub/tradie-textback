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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Enhanced Hero Section with Image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
        <Hero />
      </section>

      {/* Enhanced Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              Everything You Need
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Complete Lead Management Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn every missed call into a business opportunity with our automated SMS system
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get set up in minutes and start capturing leads immediately
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Sign Up & Set Your Trade</h3>
                    <p className="text-muted-foreground text-lg">Tell us about your business and service areas</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Customize Your Messages</h3>
                    <p className="text-muted-foreground text-lg">Create SMS templates for different scenarios</p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Connect Your Phone</h3>
                    <p className="text-muted-foreground text-lg">Get a dedicated number or use your existing one</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">Never Miss a Lead</h3>
                    <p className="text-muted-foreground text-lg">Automatic SMS responses capture every opportunity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Aussie Tradies
            </h2>
            <p className="text-xl text-muted-foreground">
              See how we're helping tradies across Australia grow their business
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary text-lg">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{testimonial.name}</p>
                      <p className="text-muted-foreground">{testimonial.trade}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Front and Center */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/90">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-2 text-lg font-semibold bg-white/20 text-white border-white/30">
              Ready to Transform Your Business?
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Start Your <span className="text-accent">14-Day Free Trial</span>
            </h2>
            <p className="text-2xl mb-10 text-white/90 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of tradies who never miss a customer again
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/onboarding')}
                className="text-xl px-12 py-6 h-auto shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-white text-primary hover:bg-white/90 font-bold"
              >
                Get Started Now - It's Free!
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="text-xl px-12 py-6 h-auto border-white/30 text-white hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-white/80 text-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Set up in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">&copy; 2025 Tradie Textback. Made with ❤️ in Australia</p>
          <p className="text-muted-foreground/70 mt-2">Helping tradies capture every lead, every time.</p>
        </div>
      </footer>
    </div>
  );
}