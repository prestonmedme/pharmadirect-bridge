import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DynamicLogo } from "@/components/branding/DynamicLogo";
import { MapPin, Users, Shield } from "lucide-react";

const CountrySelector = () => {
  const navigate = useNavigate();

  const handleCountrySelect = (country: string) => {
    navigate(`/${country.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_hsl(var(--primary-light))_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_hsl(var(--primary-light))_0%,_transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center space-x-3">
          <DynamicLogo className="h-10 w-auto" />
          <span className="text-white font-bold text-2xl tracking-tight">medme</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-white/90">
          <a href="#about" className="hover:text-white transition-colors font-medium">About</a>
          <a href="#blog" className="hover:text-white transition-colors font-medium">Blog</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 text-center px-6 pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Operating System for<br />
            <span className="text-primary-lighter">Pharmacies of the Future</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
            Streamline pharmacy workflows to deliver clinical services at scale,
            build patient relationships, and diversify revenue.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-white/80 mb-8">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium text-sm">Find Pharmacies</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium text-sm">Book Services</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium text-sm">Trusted Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Transition */}
      <div className="relative">
        <svg
          className="absolute inset-x-0 bottom-0 text-background"
          fill="currentColor"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
        >
          <path d="M0,200 C300,50 700,50 1000,200 L1000,200 Z" />
        </svg>
      </div>

      {/* Country Selection Section */}
      <section className="relative z-10 bg-background py-12 lg:py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Choose Your Region
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Select your country to access pharmacy services and clinical care in your area
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* Canada */}
            <div className="flex-1 group cursor-pointer" onClick={() => handleCountrySelect('CA')}>
              <div className="bg-card rounded-2xl shadow-card border border-border hover:border-primary/30 hover:shadow-lg-medical transition-all duration-300 group-hover:scale-[1.02] p-8 text-center h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-20 h-14 mx-auto bg-white rounded-xl shadow-medical border-2 border-border flex items-center justify-center mb-4">
                    {/* Simplified Canadian Flag */}
                    <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center relative">
                      <div className="w-2 h-5 bg-white rounded-sm"></div>
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-xs font-bold">🍁</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Canada</h3>
                  <p className="text-muted-foreground">Access Canadian pharmacy network and provincial health services</p>
                </div>
                <div className="mt-auto">
                  <Button 
                    size="lg"
                    className="w-full bg-primary hover:bg-primary-light text-primary-foreground font-semibold shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCountrySelect('CA');
                    }}
                  >
                    Enter Canada Site
                  </Button>
                </div>
              </div>
            </div>

            {/* United States */}
            <div className="flex-1 group cursor-pointer" onClick={() => handleCountrySelect('US')}>
              <div className="bg-card rounded-2xl shadow-card border border-border hover:border-primary/30 hover:shadow-lg-medical transition-all duration-300 group-hover:scale-[1.02] p-8 text-center h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-20 h-14 mx-auto bg-white rounded-xl shadow-medical border-2 border-border flex items-center justify-center mb-4">
                    {/* Simplified US Flag */}
                    <div className="w-12 h-8 relative overflow-hidden rounded">
                      <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-white to-red-500"></div>
                      <div className="absolute top-0 left-0 w-5 h-4 bg-blue-800 flex items-center justify-center">
                        <div className="text-white text-[8px] font-bold">★</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">United States</h3>
                  <p className="text-muted-foreground">Connect with US pharmacy network and state-specific services</p>
                </div>
                <div className="mt-auto">
                  <Button 
                    size="lg"
                    className="w-full bg-primary hover:bg-primary-light text-primary-foreground font-semibold shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCountrySelect('US');
                    }}
                  >
                    Enter US Site
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="bg-gradient-primary text-white py-16 lg:py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your
            </h3>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Pharmacy Experience?
            </p>
            <p className="text-lg text-white/80">
              Join thousands of pharmacies and patients already using MedMe to streamline healthcare delivery
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CountrySelector;