import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, MapPin, User, Globe, LogOut, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { DynamicLogo } from '@/components/branding/DynamicLogo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-[#073e54]/60" style={{ backgroundColor: '#073e54' }}>
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img src="/lovable-uploads/3a8be38a-7422-49cd-b38b-f0831bafd303.png" className="h-8 w-auto" alt="Logo" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className={cn(
                "text-white hover:text-gray-200 transition-colors font-medium",
                location.pathname === '/' && "text-gray-200"
              )}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/search')}
              className={cn(
                "text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-1",
                location.pathname === '/search' && "text-gray-200"
              )}
            >
              <MapPin className="h-4 w-4" />
              Search
            </button>
            <button className="text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-1">
              <User className="h-4 w-4" />
              Account
            </button>
            <button className="text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-1">
              <Globe className="h-4 w-4" />
              EN
            </button>
          </nav>

          {/* Authentication - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.user_metadata?.full_name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/appointments')}>
                    <MapPin className="mr-2 h-4 w-4" />
                    My Appointments
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-white border-white bg-transparent hover:bg-white hover:text-[#073e54] transition-colors"
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-[#c3c430] hover:bg-[#a8a82a] text-black"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:text-gray-200 transition-colors"
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
          <nav className="py-4 space-y-4 border-t border-white/20">
            <a href="#" className="block text-white hover:text-gray-200 transition-colors font-medium">
              Home
            </a>
            <a href="#" className="block text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map
            </a>
            <a href="#" className="block text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </a>
            <a href="#" className="block text-white hover:text-gray-200 transition-colors font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </a>
            {/* Mobile Authentication */}
            <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white">
                    <User className="h-4 w-4" />
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/settings')}
                    className="justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/appointments')}
                    className="justify-start"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    My Appointments
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={signOut}
                    className="justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-primary"
                    size="sm"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;