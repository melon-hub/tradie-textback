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
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Phone className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-foreground">CallCatch</span>
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
          <Button variant="outline" size="sm">
            Demo
          </Button>
          <Button size="sm">
            Start 14-Day Trial
          </Button>
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
        "md:hidden bg-background border-t border-border transition-all duration-300 ease-in-out",
        isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <nav className="container mx-auto px-4 py-4 space-y-4">
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
          <div className="space-y-3 pt-4">
            <Button variant="outline" className="w-full" onClick={closeMobileMenu}>
              Demo
            </Button>
            <Button className="w-full" onClick={closeMobileMenu}>
              Start 14-Day Trial
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;