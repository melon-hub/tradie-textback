import { Button } from "@/components/ui/button";
import { Phone, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
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
          <Link to="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </Link>
          <Link to="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Button variant="outline" size="sm">
            Demo
          </Button>
          <Button size="sm">
            Start 14-Day Trial
          </Button>
        </nav>
        
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;