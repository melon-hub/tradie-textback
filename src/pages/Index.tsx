import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero - Primary brand colors with gradient */}
      <Hero />
      
      {/* How It Works - Strong muted background */}
      <div className="bg-muted/50 border-t border-b border-border/50">
        <HowItWorks />
      </div>
      
      {/* Pricing - Clean white background with shadow */}
      <div className="bg-card shadow-sm border-y border-border/30">
        <Pricing />
      </div>
      
      {/* FAQ - Strong muted background again */}
      <div className="bg-muted/60 border-t border-b border-border/50">
        <FAQ />
      </div>
      
      {/* CTA - Strong primary accent background */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-t border-primary/20">
        <CTA />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
