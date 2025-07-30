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
      
      {/* How It Works - Muted background for contrast */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background"></div>
        <div className="relative">
          <HowItWorks />
        </div>
      </div>
      
      {/* Pricing - Clean background with subtle gradient */}
      <div className="relative bg-gradient-subtle">
        <Pricing />
      </div>
      
      {/* FAQ - Muted background for alternation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background"></div>
        <div className="relative">
          <FAQ />
        </div>
      </div>
      
      {/* CTA - Strong gradient finale */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-background to-background"></div>
        <div className="relative">
          <CTA />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
