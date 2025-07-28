import { Card, CardContent } from "@/components/ui/card";
import { PhoneOff, MessageSquare, Smartphone } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: PhoneOff,
      title: "Caller rings → not answered",
      description: "Your phone rings while you're on the tools. No worries if you can't pick up."
    },
    {
      icon: MessageSquare,
      title: "Instant SMS to caller",
      description: "They get a text with a link to send suburb, photos, and job details in 30 seconds."
    },
    {
      icon: Smartphone,
      title: "You get a job card",
      description: "SMS with one-tap call back, photos, and all the details you need to quote fast."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to turn missed calls into qualified leads
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary/20">
                    {index + 1}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;