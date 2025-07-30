import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Stethoscope, Syringe, ClipboardCheck, Shield, Heart, Plane, Activity, Brain, Truck, Baby, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
const services = [{
  id: "minor-ailments",
  title: "Minor ailments",
  description: "Get treatment for common health conditions like cold, flu, and minor infections.",
  icon: Stethoscope,
  color: "bg-blue-50 text-blue-600"
}, {
  id: "flu-shots",
  title: "Flu shots",
  description: "Annual influenza vaccination to protect against seasonal flu strains.",
  icon: Syringe,
  color: "bg-purple-50 text-purple-600"
}, {
  id: "medscheck",
  title: "MedsCheck",
  description: "Comprehensive medication review with a pharmacist to optimize your therapy.",
  icon: ClipboardCheck,
  color: "bg-green-50 text-green-600"
}, {
  id: "naloxone",
  title: "Naloxone Kits",
  description: "Free naloxone kits and training to help reverse opioid overdoses.",
  icon: Shield,
  color: "bg-red-50 text-red-600"
}, {
  id: "birth-control",
  title: "Birth Control",
  description: "Contraceptive consultations and prescriptions from qualified pharmacists.",
  icon: Heart,
  color: "bg-pink-50 text-pink-600"
}, {
  id: "travel-vaccines",
  title: "Travel Vaccines",
  description: "Immunizations and health advice for international travel destinations.",
  icon: Plane,
  color: "bg-cyan-50 text-cyan-600"
}, {
  id: "diabetes",
  title: "Diabetes",
  description: "Blood glucose monitoring, medication management, and diabetes education.",
  icon: Activity,
  color: "bg-orange-50 text-orange-600"
}, {
  id: "mental-health",
  title: "Mental Health",
  description: "Mental health support, counseling referrals, and medication management.",
  icon: Brain,
  color: "bg-indigo-50 text-indigo-600"
}, {
  id: "delivery",
  title: "Delivery",
  description: "Home delivery of prescriptions and over-the-counter medications.",
  icon: Truck,
  color: "bg-yellow-50 text-yellow-600"
}, {
  id: "pediatric-vax",
  title: "Pediatric Vax",
  description: "Childhood immunizations and vaccinations for infants and children.",
  icon: Baby,
  color: "bg-teal-50 text-teal-600"
}, {
  id: "open-now",
  title: "Open Now",
  description: "Find pharmacies that are currently open and available for immediate service.",
  icon: Clock,
  color: "bg-emerald-50 text-emerald-600"
}];
const ServicesCarousel = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let animationId: number;
    let scrollPosition = container.scrollLeft;
    const scrollSpeed = 0.3; // Reduced speed for smoother animation

    const autoScroll = () => {
      if (isUserInteracting) {
        animationId = requestAnimationFrame(autoScroll);
        return;
      }

      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      scrollPosition += scrollSpeed;
      
      // Seamless loop without direction change
      if (scrollPosition >= scrollWidth) {
        scrollPosition = 0;
      }
      
      container.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(autoScroll);
    };

    // Start animation after a delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(autoScroll);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isUserInteracting]);
  const handleServiceClick = (serviceId: string) => {
    navigate(`/search?service=${serviceId}`);
  };
  const handleMouseEnter = () => setIsUserInteracting(true);
  const handleMouseLeave = () => {
    // Delay before resuming animation to prevent choppiness
    setTimeout(() => setIsUserInteracting(false), 1000);
  };
  const handleTouchStart = () => setIsUserInteracting(true);
  const handleTouchEnd = () => {
    setTimeout(() => setIsUserInteracting(false), 1000);
  };
  return <section className="py-16 bg-background border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">Search Pharmacy Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the wide range of healthcare services available at our partner pharmacies
          </p>
        </div>

        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
          {services.map(service => {
          const Icon = service.icon;
          return <Button key={service.id} variant="ghost" className="flex-shrink-0 w-80 h-40 p-6 flex flex-col items-start text-left hover:shadow-lg hover:border-primary/20 border border-border rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1" onClick={() => handleServiceClick(service.id)}>
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {service.description}
                </p>
              </Button>;
        })}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Questions about eligibility? Talk to your healthcare provider about what is right for you.
          </p>
        </div>
      </div>
    </section>;
};
export default ServicesCarousel;