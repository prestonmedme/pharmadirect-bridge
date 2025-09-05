import HomeMap from "./HomeMap";

const HeroSection = () => {
  return (
    <section className="relative py-8 bg-gradient-subtle">
      {/* Trust indicator */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-lighter/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Trusted by over 12M Canadians</span>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4">
        {/* Main headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Find the best{" "}
            <span className="text-primary">pharmacy services</span>{" "}
            near you
          </h1>
        </div>

        {/* Map section */}
        <div className="relative max-w-2xl mx-auto">
          <div className="aspect-[16/9] bg-white rounded-2xl border border-border/20 overflow-hidden shadow-card">
            <HomeMap className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;