import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const Pricing = () => {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold">
            Simple, Fair Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One extra job a month usually pays for itself
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="relative">
            <Badge className="absolute -top-3 left-6 bg-accent text-accent-foreground">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Starter</CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <div className="text-sm text-muted-foreground">+ $149 one-off setup</div>
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
              <Button className="w-full" size="lg">
                Start 14-Day Free Trial
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold">$64<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <div className="text-sm text-muted-foreground">Starter + $15/mo</div>
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
              <Button variant="outline" className="w-full" size="lg">
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