import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Phone, MessageSquare, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="pt-12 pb-20 lg:pt-20 lg:pb-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit">
              For Australian Tradies
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Never Miss a 
                <span className="text-primary"> Hot Lead</span> Again
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
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
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                Start 14-Day Free Trial
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
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
          
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Tradie using phone on job site" 
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -left-2 sm:-left-6 bg-card border border-border rounded-xl p-4 shadow-lg">
              <div className="text-sm font-medium text-card-foreground">Never miss a lead</div>
              <div className="text-2xl font-bold text-accent">+127%</div>
              <div className="text-sm text-muted-foreground">More callbacks</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;