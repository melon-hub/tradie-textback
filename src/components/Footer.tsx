import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-background text-foreground p-2 rounded-lg">
                <Phone className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">TradieText</span>
            </div>
            <p className="text-background/80">
              Never miss a hot lead again. For Australian tradies who want to capture every opportunity.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Product</h4>
            <ul className="space-y-2 text-background/80">
              <li><Link to="#how-it-works" className="hover:text-background transition-colors">How It Works</Link></li>
              <li><Link to="#pricing" className="hover:text-background transition-colors">Pricing</Link></li>
              <li><Link to="/demo" className="hover:text-background transition-colors">Demo</Link></li>
              <li><Link to="/intake" className="hover:text-background transition-colors">Try Intake Form</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Support</h4>
            <ul className="space-y-2 text-background/80">
              <li><Link to="#faq" className="hover:text-background transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-background transition-colors">Contact</Link></li>
              <li><Link to="/help" className="hover:text-background transition-colors">Help Center</Link></li>
              <li><Link to="/status" className="hover:text-background transition-colors">System Status</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <ul className="space-y-3 text-background/80">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>1300 CATCH 1</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@tradietext.com.au</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Melbourne, Australia</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2025 TradieText. All rights reserved.
          </p>
          <div className="flex space-x-6 text-background/60 text-sm mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-background transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;