import { useGeographic } from "@/contexts/GeographicContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HomeSearchForm from "@/components/home/HomeSearchForm";

const Index = () => {
  const { country, region, isUS, isCA } = useGeographic();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          {region && (
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Showing pharmacies in {region}, {isUS ? 'United States' : 'Canada'}
              </p>
            </div>
          )}
          <HomeSearchForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
