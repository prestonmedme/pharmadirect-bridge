import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
      </main>
    </div>
  );
};

export default Index;
