"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { normalizeImageUrl } from "@/lib/utils";

const SLIDES = [
  {
    title: "New Season Collection",
    subtitle: "Discover the latest trends in ethnic & western wear",
    cta: "Shop Now",
    href: "/shop",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&h=500&fit=crop&auto=format",
  },
  {
    title: "Festive Specials",
    subtitle: "Up to 40% off on selected ethnic wear",
    cta: "View Sale",
    href: "/shop/women",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=500&fit=crop&auto=format",
  },
  {
    title: "Men's Collection",
    subtitle: "Premium shirts, kurtas & more",
    cta: "Explore",
    href: "/shop/men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&h=500&fit=crop&auto=format",
  },
];

const AUTO_MS = 6000;

function SlideImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = normalizeImageUrl(src);

  if (!url || failed) {
    return <div className="absolute inset-0 bg-gradient-to-br from-brand-300 to-brand-600" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />
  );
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const touchDelta = useRef(0);

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
    setPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current < 0) next();
      else prev();
    }
    touchStart.current = null;
    setTimeout(() => setPaused(false), 3000);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div key={i} className="relative min-w-full flex-shrink-0">
            <div className="relative aspect-[16/9] min-h-[180px] bg-gradient-to-br from-brand-300 to-brand-500 sm:aspect-[21/9] sm:min-h-[260px] md:min-h-[320px]">
              <SlideImage src={slide.image} alt={slide.title} priority={i === 0} />
              <div className="absolute inset-0 flex items-center bg-black/35">
                <div className="px-4 sm:px-10 md:px-12">
                  <h2 className="text-lg font-bold text-white sm:text-3xl md:text-4xl">{slide.title}</h2>
                  <p className="mt-1 max-w-md text-xs text-white/90 sm:mt-2 sm:text-base">{slide.subtitle}</p>
                  <Link
                    href={slide.href}
                    className="mt-3 inline-block rounded-md bg-brand-900 px-4 py-2 text-xs font-medium text-white hover:bg-brand-800 sm:mt-4 sm:px-6 sm:py-2.5 sm:text-sm"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md opacity-90 hover:bg-white sm:left-4 sm:p-2"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md opacity-90 hover:bg-white sm:right-4 sm:p-2"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="ml-1 rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
        >
          {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
