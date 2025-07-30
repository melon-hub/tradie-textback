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
    <section id="how-it-works" className="section-padding relative">
      <div className="container mx-auto container-padding">
        <div className="text-center space-y-4 lg:space-y-6 mb-12 lg:mb-20 fade-in-up">
          <h2 className="text-2xl lg:text-6xl font-bold">
            How It Works
          </h2>
          <p className="text-lg lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Three simple steps to turn missed calls into qualified leads
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {steps.map((step, index) => (
            <Card key={index} className="card-elevated group hover:transform hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6 lg:p-10 space-y-6 lg:space-y-8">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-primary p-4 rounded-2xl shadow-primary group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="text-4xl lg:text-7xl font-bold text-primary/15 group-hover:text-primary/25 transition-colors duration-300">
                    {index + 1}
                  </div>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  <h3 className="text-xl lg:text-2xl font-bold leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
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