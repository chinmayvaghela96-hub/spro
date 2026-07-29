import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, ChevronLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slides = [] } = useQuery<any[]>({
    queryKey: ["content", "hero-slides"],
    queryFn: async () => {
      const res = await fetch("/api/content/hero-slides");
      if (!res.ok) throw new Error("Failed to fetch hero slides");
      return res.json();
    }
  });

  const { data: homeContent } = useQuery<any>({
    queryKey: ["content", "home"],
    queryFn: async () => {
      const res = await fetch("/api/content/home");
      if (!res.ok) throw new Error("Failed to fetch homepage content");
      return res.json();
    }
  });

  const activeSlides = slides.filter(s => s.isActive !== false);

  const fallbackSlides = [
    {
      id: 0,
      imageUrl: homeContent?.heroBgImage || "/hero-bg.png",
      title: homeContent?.heroTitle || "Advanced Process Optimization & Sustainable Solutions",
      subtitle: homeContent?.heroSubtitle || "Global engineering consultancy specializing in chemical engineering, advanced modeling, and sustainable industrial innovation.",
      buttonText: "Explore Services",
      buttonLink: "/services",
      openInNewTab: false
    }
  ];

  const slidesToRender = activeSlides.length > 0 ? activeSlides : fallbackSlides;

  useEffect(() => {
    if (slidesToRender.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slidesToRender.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesToRender.length) % slidesToRender.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesToRender.length);
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] bg-gray-900 overflow-hidden">
      {/* Background image slider */}
      {slidesToRender.map((slide, index) => {
        const isCurrent = index === currentSlide;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${
              isCurrent ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.imageUrl}
                alt="Hero background slide"
                className="w-full h-full object-cover"
              />
              {/* Dark overlay: 50% opacity */}
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
          </div>
        );
      })}

      {/* Fixed Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 pointer-events-auto">
          <div className="max-w-3xl">
            {homeContent?.heroBadge && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Leaf className="w-3.5 h-3.5" />
                {homeContent.heroBadge}
              </div>
            )}
            
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
              dangerouslySetInnerHTML={{ 
                __html: (homeContent?.heroTitle || "Advanced Process Optimization & Sustainable Solutions")
                  .replace("Optimization", '<span class="text-primary">Optimization</span>') 
              }}
            />
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              {homeContent?.heroSubtitle || "Global engineering consultancy specializing in chemical engineering, advanced modeling, and sustainable industrial innovation."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Link href="/services">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg h-auto shadow-lg shadow-primary/20 cursor-pointer">
                  Explore Services <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Slider Controls (Arrows) */}
      {slidesToRender.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Slider Indicators (Dots) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slidesToRender.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide ? "bg-primary w-8" : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
