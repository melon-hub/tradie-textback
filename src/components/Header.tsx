import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto container-padding py-4 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold text-gradient hover:scale-105 transition-transform duration-200">
          CallCatch
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
          <Link to="/intake">
            <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
              Demo
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="secondary" className="hover:bg-secondary/80 transition-colors">
              Tradie Login
            </Button>
          </Link>
          <Link to="/intake">
            <Button className="btn-primary-gradient shadow-primary hover:scale-105 transition-transform duration-200">
              Start 14-Day Trial
            </Button>
          </Link>
        </nav>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden bg-background/95 backdrop-blur-md border-t border-border transition-all duration-300 ease-in-out shadow-lg",
        isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <nav className="container mx-auto container-padding py-6 space-y-6">
          <a 
            href="#how-it-works" 
            className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={closeMobileMenu}
          >
            How it Works
          </a>
          <a 
            href="#pricing" 
            className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={closeMobileMenu}
          >
            Pricing
          </a>
          <a 
            href="#faq" 
            className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={closeMobileMenu}
          >
            FAQ
          </a>
          <div className="space-y-4 pt-6">
            <Link to="/intake">
              <Button variant="outline" className="w-full py-3 h-auto hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300" onClick={closeMobileMenu}>
                Demo
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary" className="w-full py-3 h-auto hover:bg-secondary/80 transition-colors" onClick={closeMobileMenu}>
                Tradie Login
              </Button>
            </Link>
            <Link to="/intake">
              <Button className="w-full btn-primary-gradient py-3 h-auto shadow-primary" onClick={closeMobileMenu}>
                Start 14-Day Trial
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;