import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HomeSearchForm from "@/components/home/HomeSearchForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HomeSearchForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
