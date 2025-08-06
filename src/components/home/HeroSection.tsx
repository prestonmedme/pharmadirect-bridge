import { ThemedButton } from "@/components/branding/ThemedButton";
import { Search, Shield, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FeatureCard from "./FeatureCard";
import HomeMap from "./HomeMap";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-subtle overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-light/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                Find and schedule
                <span className="block text-primary-light">
                  pharmacy services
                </span>
              </h1>
              
              <div className="space-y-4 text-lg text-muted-foreground">
                <p className="flex items-start gap-3">
                  <Search className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  Browse provider locations from several pharmacies
                </p>
                <p className="flex items-start gap-3">
                  <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  Book appointments directly with MedMe providers
                </p>
                <p className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  Check your eligibility for different services
                </p>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <FeatureCard
                icon={Search}
                title="Find Nearby Pharmacies"
                description="Locate pharmacies in your area with real-time availability and services offered."
                className="text-center"
              />
              <FeatureCard
                icon={Calendar}
                title="Easy Online Booking"
                description="Schedule appointments directly through our platform with instant confirmation."
                className="text-center"
              />
              <FeatureCard
                icon={Shield}
                title="Verified Providers"
                description="All pharmacies are verified and meet our strict quality and safety standards."
                className="text-center"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <ThemedButton 
                variant="medical" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => navigate('/search')}
              >
                Find a Pharmacy
              </ThemedButton>
              <ThemedButton variant="medical-outline" size="lg" className="w-full sm:w-auto">
                Check Eligibility
              </ThemedButton>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by healthcare providers across Canada
              </p>
              <div className="flex items-center gap-8 opacity-60">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-8 w-18 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Map */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-10" />
              <div className="absolute inset-4 bg-white rounded-2xl border border-border/20 overflow-hidden">
                <HomeMap className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;