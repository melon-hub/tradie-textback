import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Phone, MessageSquare, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="section-padding bg-gradient-subtle">
      <div className="container mx-auto container-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <Badge variant="secondary" className="w-fit px-4 py-2 text-sm font-medium shadow-sm">
              For Australian Tradies 🇦🇺
            </Badge>
            
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                Never Miss a 
                <span className="text-gradient"> Hot Lead</span> Again
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-lg">
                When you miss a call on the tools, we instantly text the caller for their suburb + photos. 
                You get a tidy job card by SMS and call back with one tap.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Capture leads you'd normally lose</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Faster quotes with photos upfront</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Zero new app to learn</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Button size="lg" className="btn-primary-gradient text-lg px-10 py-4 h-auto shadow-primary">
                Start 14-Day Free Trial
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-10 py-4 h-auto hover:bg-muted/50 transition-all duration-300">
                See How It Works
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Keep Your Number</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">30 Min Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">No App Required</span>
              </div>
            </div>
          </div>
          
          <div className="relative lg:mt-8">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img 
                src={heroImage} 
                alt="Tradie using phone on job site" 
                className="w-full h-auto transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="absolute -bottom-8 -left-4 sm:-left-8 card-elevated p-6 bg-card/95 backdrop-blur-sm">
              <div className="text-sm font-semibold text-card-foreground mb-1">Never miss a lead</div>
              <div className="text-3xl font-bold text-gradient mb-1">+127%</div>
              <div className="text-sm text-muted-foreground">More callbacks</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;