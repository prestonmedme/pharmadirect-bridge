import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, User, Globe } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-primary">MedMe</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className={cn(
                "text-foreground hover:text-primary transition-colors font-medium",
                location.pathname === '/' && "text-primary"
              )}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/search')}
              className={cn(
                "text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1",
                location.pathname === '/search' && "text-primary"
              )}
            >
              <MapPin className="h-4 w-4" />
              Search
            </button>
            <button className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <User className="h-4 w-4" />
              Account
            </button>
            <button className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <Globe className="h-4 w-4" />
              EN
            </button>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="medical-outline" size="sm">
              Sign In
            </Button>
            <Button variant="medical" size="sm">
              Register
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <nav className="py-4 space-y-4 border-t">
            <a href="#" className="block text-foreground hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#" className="block text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map
            </a>
            <a href="#" className="block text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </a>
            <a href="#" className="block text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              <Button variant="medical-outline" size="sm">
                Sign In
              </Button>
              <Button variant="medical" size="sm">
                Register
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;