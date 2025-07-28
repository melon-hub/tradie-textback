import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Clock, TrendingUp } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <Card className="bg-primary text-primary-foreground overflow-hidden relative">
          <CardContent className="p-12 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Ready to Catch Every Lead?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join hundreds of tradies who never miss a hot lead. 
                Start your 14-day free trial today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Book a Demo
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 pt-8">
              <div className="flex flex-col items-center space-y-2">
                <Phone className="h-8 w-8 opacity-80" />
                <span className="font-semibold">30-min setup</span>
                <span className="text-sm opacity-80">Keep your number</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Clock className="h-8 w-8 opacity-80" />
                <span className="font-semibold">14-day trial</span>
                <span className="text-sm opacity-80">Cancel anytime</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-8 w-8 opacity-80" />
                <span className="font-semibold">More leads</span>
                <span className="text-sm opacity-80">Guaranteed results</span>
              </div>
            </div>
          </CardContent>
          
          {/* Background decoration */}
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary-foreground/10 rounded-full"></div>
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary-foreground/10 rounded-full"></div>
        </Card>
      </div>
    </section>
  );
};

export default CTA;