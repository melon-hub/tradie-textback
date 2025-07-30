import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Clock, TrendingUp } from "lucide-react";

const CTA = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto container-padding">
        <Card className="bg-gradient-primary text-primary-foreground overflow-hidden relative shadow-xl">
          <CardContent className="p-8 md:p-12 lg:p-16 text-center space-y-8 lg:space-y-10">
            <div className="space-y-4 lg:space-y-6">
              <h2 className="text-2xl lg:text-6xl font-bold leading-tight">
                Ready to Catch Every Lead?
              </h2>
              <p className="text-xl lg:text-2xl opacity-95 max-w-3xl mx-auto leading-relaxed">
                Join hundreds of tradies who never miss a hot lead. 
                Start your 14-day free trial today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-4 h-auto hover:scale-105 transition-transform duration-200 shadow-lg">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-4 h-auto bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/90 hover:text-primary transition-all duration-300">
                Book a Demo
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 lg:gap-10 pt-8 lg:pt-12">
              <div className="flex flex-col items-center space-y-3 group">
                <div className="bg-primary-foreground/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-10 w-10 opacity-90" />
                </div>
                <span className="font-bold text-lg">30-min setup</span>
                <span className="text-base opacity-85">Keep your number</span>
              </div>
              <div className="flex flex-col items-center space-y-3 group">
                <div className="bg-primary-foreground/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-10 w-10 opacity-90" />
                </div>
                <span className="font-bold text-lg">14-day trial</span>
                <span className="text-base opacity-85">Cancel anytime</span>
              </div>
              <div className="flex flex-col items-center space-y-3 group">
                <div className="bg-primary-foreground/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-10 w-10 opacity-90" />
                </div>
                <span className="font-bold text-lg">More leads</span>
                <span className="text-base opacity-85">Guaranteed results</span>
              </div>
            </div>
          </CardContent>
          
          {/* Enhanced background decoration */}
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-foreground/10 rounded-full blur-xl"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-primary-foreground/10 rounded-full blur-lg"></div>
          <div className="absolute right-10 top-10 w-6 h-6 bg-primary-foreground/30 rounded-full"></div>
          <div className="absolute left-20 bottom-20 w-4 h-4 bg-primary-foreground/40 rounded-full"></div>
        </Card>
      </div>
    </section>
  );
};

export default CTA;