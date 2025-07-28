import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding">
      <div className="container mx-auto container-padding">
        <div className="text-center space-y-6 mb-20">
          <h2 className="text-4xl lg:text-6xl font-bold">
            Simple, Fair Pricing
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
            One extra job a month usually pays for itself
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <Card className="relative card-elevated hover:transform hover:-translate-y-2 transition-all duration-300 border-2 border-primary/20">
            <Badge className="absolute -top-4 left-6 bg-gradient-primary text-primary-foreground px-4 py-2 shadow-primary">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-10">
              <CardTitle className="text-3xl font-bold">Starter</CardTitle>
              <div className="space-y-3">
                <div className="text-5xl font-bold">$49<span className="text-2xl font-normal text-muted-foreground">/mo</span></div>
                <div className="text-base text-muted-foreground">+ $149 one-off setup</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Missed call text-back</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Job cards by SMS</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Photo collection</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>6pm daily summary</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Keep your current number</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Fair usage limits</span>
                </li>
              </ul>
              <Button className="w-full btn-primary-gradient text-lg py-4 h-auto shadow-primary" size="lg">
                Start 14-Day Free Trial
              </Button>
            </CardContent>
          </Card>
          
          <Card className="card-elevated hover:transform hover:-translate-y-2 transition-all duration-300">
            <CardHeader className="text-center pb-10">
              <CardTitle className="text-3xl font-bold">Pro</CardTitle>
              <div className="space-y-3">
                <div className="text-5xl font-bold">$64<span className="text-2xl font-normal text-muted-foreground">/mo</span></div>
                <div className="text-base text-muted-foreground">Starter + $15/mo</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Branded business number</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>WhatsApp intake (coming soon)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full text-lg py-4 h-auto hover:bg-muted/50 transition-all duration-300" size="lg">
                Upgrade Later
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-12 space-y-4">
          <p className="text-muted-foreground">
            14-day free trial • Cancel anytime • No lock-in contracts
          </p>
          <p className="text-sm text-muted-foreground italic">
            "If you don't see an extra job, cancel" - that's our promise
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;