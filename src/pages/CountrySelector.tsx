import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DynamicLogo } from "@/components/branding/DynamicLogo";
import canadaFlag from "@/assets/flags/canada-flag.png";
import usFlag from "@/assets/flags/us-flag.png";
import medmeLogo from "@/assets/medme-logo-updated.png";

const CountrySelector = () => {
  const navigate = useNavigate();

  const handleCountrySelect = (country: string) => {
    navigate(`/${country.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-3">
          <img 
            src={medmeLogo} 
            alt="MedMe Logo" 
            className="h-6 w-auto"
          />
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-white/90">
          <a href="#about" className="hover:text-white transition-colors font-medium">About</a>
          <a href="#blog" className="hover:text-white transition-colors font-medium">Blog</a>
        </nav>
      </header>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Operating System for<br />
              <span className="text-accent">Pharmacies of the Future</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Streamline pharmacy workflows to deliver clinical services at scale,
              build patient relationships, and diversify revenue.
            </p>
          </div>

          {/* Country Selection */}
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12">
              Choose Your Country
            </h2>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 lg:gap-16">
              {/* Canada */}
              <div 
                className="group cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => handleCountrySelect('CA')}
              >
                <div className="text-center">
                  <div className="w-32 h-24 mx-auto mb-6 rounded-xl overflow-hidden shadow-lg border-4 border-border hover:border-primary transition-colors duration-300">
                    <img 
                      src={canadaFlag} 
                      alt="Canada Flag" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">CA Site</h3>
                </div>
              </div>

              {/* United States */}
              <div 
                className="group cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => handleCountrySelect('US')}
              >
                <div className="text-center">
                  <div className="w-32 h-24 mx-auto mb-6 rounded-xl overflow-hidden shadow-lg border-4 border-border hover:border-primary transition-colors duration-300">
                    <img 
                      src={usFlag} 
                      alt="United States Flag" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">US Site</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountrySelector;