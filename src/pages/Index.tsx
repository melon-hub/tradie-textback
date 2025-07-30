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
      <div className="relative bg-muted/20">
        <HowItWorks />
      </div>
      
      {/* Pricing - Clean background with subtle gradient */}
      <div className="relative bg-gradient-subtle">
        <Pricing />
      </div>
      
      {/* FAQ - Muted background for alternation */}
      <div className="relative bg-muted/30">
        <FAQ />
      </div>
      
      {/* CTA - Strong gradient finale */}
      <div className="relative bg-gradient-to-t from-primary/10 via-background to-background">
        <CTA />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
