import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, Clock, DollarSign, Shield, Star, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section - Two Column Layout */}
      <div className="container mx-auto px-4 py-16">
        {/* Header - Centered */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4" variant="secondary">
            🇦🇺 For Australian Tradies
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Turn Missed Calls Into
            <br />
            <span className="text-blue-600">Customers</span>
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center max-w-6xl mx-auto">
          {/* Left Column - All Content */}
          <div className="space-y-6 lg:space-y-8 px-4 lg:px-0 lg:pl-8 order-2 lg:order-1">
            <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
              Automatically respond to missed calls with SMS. Never lose a job because you were on site.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/onboarding')}
                className="text-base lg:text-lg px-6 lg:px-8 w-full sm:w-auto"
              >
                Start 14-Day Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="text-base lg:text-lg px-6 lg:px-8 w-full sm:w-auto"
              >
                Sign In
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6 lg:mb-8">
              No credit card required • Set up in 5 minutes
            </p>

            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                <span className="text-base lg:text-lg">Capture leads you'd normally lose</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                <span className="text-base lg:text-lg">Faster quotes with photos upfront</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                <span className="text-base lg:text-lg">Zero new app to learn</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="relative flex justify-center order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full max-w-sm lg:max-w-md">
              <img 
                src={heroImage} 
                alt="Tradie using phone on job site" 
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Stats card - hidden on mobile, repositioned on larger screens */}
            <div className="hidden lg:block absolute -bottom-6 -left-6 bg-white p-4 lg:p-6 rounded-xl shadow-xl border">
              <div className="text-sm font-semibold text-gray-600 mb-1">Never miss a lead</div>
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">+127%</div>
              <div className="text-sm text-gray-500">More callbacks</div>
            </div>
          </div>
        </div>

        {/* Mobile Stats - Only visible on mobile */}
        <div className="lg:hidden mt-8 max-w-sm mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-xl border text-center">
            <div className="text-sm font-semibold text-gray-600 mb-1">Never miss a lead</div>
            <div className="text-3xl font-bold text-blue-600 mb-1">+127%</div>
            <div className="text-sm text-gray-500">More callbacks</div>
          </div>
        </div>
      </div>

      {/* Features Grid - Enhanced from original */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12">
          Everything You Need to Manage Leads
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works - Original structure with enhanced styling */}
      <div className="bg-gray-100 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg text-sm lg:text-base">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-base lg:text-lg mb-1">Sign Up & Set Your Trade</h3>
                  <p className="text-gray-600 text-sm lg:text-base">Tell us about your business and service areas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg text-sm lg:text-base">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-base lg:text-lg mb-1">Customize Your Messages</h3>
                  <p className="text-gray-600 text-sm lg:text-base">Create SMS templates for different scenarios</p>
                </div>
              </div>
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg text-sm lg:text-base">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-base lg:text-lg mb-1">Connect Your Phone</h3>
                  <p className="text-gray-600 text-sm lg:text-base">Get a dedicated number or use your existing one</p>
                </div>
              </div>
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg text-sm lg:text-base">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-base lg:text-lg mb-1">Never Miss a Lead</h3>
                  <p className="text-gray-600 text-sm lg:text-base">Automatic SMS responses capture every opportunity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials - Enhanced styling */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12">
          Trusted by Aussie Tradies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.trade}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* MASSIVE Enhanced CTA Section - 14-Day Trial Front and Center */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 lg:mb-6 bg-white/20 text-white border-white/30 px-4 lg:px-6 py-2 text-base lg:text-lg">
            🚀 Ready to Transform Your Business?
          </Badge>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
            Start Your <span className="text-yellow-300">14-Day Free Trial</span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 lg:mb-10 opacity-90 max-w-2xl mx-auto">
            Join hundreds of tradies who never miss a customer again
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center mb-6 lg:mb-8">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/onboarding')}
              className="text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6 h-auto bg-white text-blue-600 hover:bg-gray-100 font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Get Started Now - It's FREE!
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-lg lg:text-xl px-8 lg:px-12 py-4 lg:py-6 h-auto border-white/30 text-gray-900 bg-white hover:bg-gray-100 transition-all duration-300 w-full sm:w-auto"
            >
              Watch Demo Video
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-white/90 text-sm lg:text-lg mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
          
          <p className="text-sm opacity-75">
            14 days free • No setup fees • Australian support team
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Tradie Textback. Made with ❤️ in Australia</p>
        </div>
      </footer>
    </div>
  );
}