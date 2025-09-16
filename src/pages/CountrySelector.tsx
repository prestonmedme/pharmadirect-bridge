import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DynamicLogo } from "@/components/branding/DynamicLogo";

const CountrySelector = () => {
  const navigate = useNavigate();

  const handleCountrySelect = (country: string) => {
    // For now, just navigate to the home page with country parameter
    // Later we'll add state/province selection
    navigate(`/?country=${country}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-primary-dark relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-2">
          <DynamicLogo className="h-8 w-auto" />
          <span className="text-white font-bold text-xl">medme</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-white">
          <a href="#about" className="hover:text-primary-light transition-colors">About</a>
          <a href="#blog" className="hover:text-primary-light transition-colors">Blog</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Operating System for<br />
          Pharmacies of the Future
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          Streamline pharmacy workflows to deliver clinical services at scale,
          build patient relationships, and diversify revenue.
        </p>
      </section>

      {/* Curved Divider */}
      <div className="relative">
        <svg
          className="absolute inset-x-0 bottom-0 text-background"
          fill="currentColor"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
        >
          <path d="M0,300 C200,100 400,0 600,50 C800,100 900,200 1000,150 L1000,300 Z" />
        </svg>
      </div>

      {/* Country Selection Section */}
      <section className="relative z-10 bg-background py-16 lg:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Choose your country
          </h2>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 lg:gap-12">
            {/* Canada */}
            <div className="flex flex-col items-center group cursor-pointer" onClick={() => handleCountrySelect('CA')}>
              <div className="w-24 h-16 md:w-32 md:h-20 bg-white rounded-lg shadow-lg border-2 border-border hover:border-primary transition-all duration-300 group-hover:scale-105 flex items-center justify-center mb-4">
                <div className="w-16 h-10 md:w-20 md:h-12 bg-red-500 rounded flex items-center justify-center relative">
                  <div className="w-3 h-6 md:w-4 md:h-8 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-2 h-4 md:w-3 h-6 border-l-2 border-r-2 border-red-500"></div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleCountrySelect('CA')}
              >
                CA Site
              </Button>
            </div>

            {/* United States */}
            <div className="flex flex-col items-center group cursor-pointer" onClick={() => handleCountrySelect('US')}>
              <div className="w-24 h-16 md:w-32 md:h-20 bg-white rounded-lg shadow-lg border-2 border-border hover:border-primary transition-all duration-300 group-hover:scale-105 flex items-center justify-center mb-4">
                <div className="w-16 h-10 md:w-20 md:h-12 relative">
                  {/* US Flag representation */}
                  <div className="w-full h-full bg-gradient-to-b from-red-500 via-red-500 to-red-500 rounded flex flex-col">
                    <div className="flex-1 bg-red-500"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-red-500"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-red-500"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 bg-blue-800 rounded-sm flex items-center justify-center">
                      <div className="text-white text-xs">★</div>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleCountrySelect('US')}
              >
                US Site
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Enhance
          </h3>
          <p className="text-lg text-white/90">
            Your Pharmacy Operations?
          </p>
        </div>
      </section>
    </div>
  );
};

export default CountrySelector;