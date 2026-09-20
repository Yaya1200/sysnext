"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { heroSlides as defaultSlides, HeroSlide } from "../data/siteData";

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load slider content from Supabase through the API
  useEffect(() => {
    async function loadSlides() {
      try {
        const response = await fetch("/api/content?type=slider", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load slider content");
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          return;
        }

        const databaseSlides: HeroSlide[] = data
          .filter((item: any) => item.image)
          .map((item: any, index: number) => ({
            id: item.id || index + 1,
            title: item.title || "",
            subtitle: item.subtitle || "",
            image: item.image,
            link: item.extra_data?.link || "/contact",
            buttonText: item.extra_data?.buttonText || "Contact Us",
          }));

        if (databaseSlides.length > 0) {
          setSlides(databaseSlides);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error("Failed to load hero slides:", error);
      }
    }

    loadSlides();
  }, []);

  // Automatic slide rotation
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((previousIndex) =>
        previousIndex === slides.length - 1 ? 0 : previousIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentIndex] || defaultSlides[0];

  if (!activeSlide) {
    return null;
  }

  return (
    <section
      id="hero"
      className="relative h-[430px] w-full overflow-hidden bg-slate-950 sm:h-[480px] lg:h-[563px]"
    >
      {/* Background / Image */}
      <div className="absolute inset-0">
        <img
          src={activeSlide.image}
          alt={activeSlide.title}
          className="h-full w-full object-cover object-center"
        />

        {/* Main dark overlay */}
        <div className="absolute inset-0 bg-slate-950/50" />

        {/* Stronger gradient behind text */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/70 to-transparent" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            {/* Company badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-950/40 px-3 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/60" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 sm:text-xs">
                SysNet Technologies • Since 2019
              </span>
            </div>

            {/* Title */}
            <h1 className="max-w-2xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            {activeSlide.subtitle && (
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base md:text-lg">
                {activeSlide.subtitle}
              </p>
            )}

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={activeSlide.link || "/contact"}
                className="group rounded-full bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/40 sm:text-sm"
              >
                <span className="flex items-center gap-2">
                  {activeSlide.buttonText || "Contact Us"}

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>

              <Link
                href="/services"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 sm:text-sm"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slider indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">
          {slides.map((slide, index) => (
            <button
              key={slide.id || index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-7 bg-blue-400"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -bottom-32 -left-20 z-10 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
    </section>
  );
}

