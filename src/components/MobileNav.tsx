import { useState } from "react";
import { Menu, X, Home, BarChart3, Camera, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Submit Job", href: "/intake", icon: Camera },
];

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Bottom Navigation - visible on mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 md:hidden">
        <div className="grid grid-cols-3 h-16">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-colors",
                isActive(item.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5 mb-1" />
                {item.badge && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center" 
                    variant="destructive"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Top Menu Toggle - visible on mobile only */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="space-y-4 pt-4">
              <div className="pb-2 border-b border-border">
                <h2 className="text-lg font-semibold">TradiePro</h2>
                <p className="text-sm text-muted-foreground">Mobile Menu</p>
              </div>
              
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge > 9 ? "9+" : item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileNav;