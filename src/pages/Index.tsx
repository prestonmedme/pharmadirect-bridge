import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import ServicesCarousel from "@/components/home/ServicesCarousel";
import { ThemeDemo } from "@/components/branding/ThemeDemo";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesCarousel />
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <ThemeDemo />
        </section>
      </main>
    </div>
  );
};

export default Index;
