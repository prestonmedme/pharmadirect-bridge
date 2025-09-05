import HomeMap from "./HomeMap";

const HeroSection = () => {
  return (
    <section className="relative py-4" style={{ backgroundColor: 'hsl(var(--hero-bg))' }}>
      <div className="container max-w-4xl mx-auto px-4">
        {/* Main headline */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Find the best{" "}
            <span className="text-primary">pharmacy services</span>{" "}
            near you
          </h1>
        </div>

        {/* Map section */}
        <div className="relative max-w-2xl mx-auto">
          <div className="aspect-[16/9] rounded-2xl border border-border/20 overflow-hidden shadow-card bg-[#073e54]">
            <HomeMap className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;