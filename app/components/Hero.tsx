"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { heroSlides as defaultSlides, HeroSlide } from "../data/siteData";

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/content?type=slider")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(
            data.map((item: any, idx: number) => ({
              id: item.id || idx + 1,
              title: item.title,
              subtitle: item.subtitle || "",
              image: item.image || "/images/hero/hero1.webp",
              link: item.extra_data?.link || "/contact",
              buttonText: item.extra_data?.buttonText || "Contact Us",
            }))
          );
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]);

  const activeSlide = slides[currentIndex] || slides[0] || defaultSlides[0];

  return (
    <section id="hero" className="relative h-[80vh] min-h-[580px] w-full overflow-hidden bg-black">
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(5,8,15,0.85), rgba(9,39,82,0.65)), url('${slide.image}')`,
          }}
        />
      ))}

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 text-white">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-blue-300">
              SysNet Technologies • Since 2019
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl text-white">
              {activeSlide.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-200 sm:text-lg md:text-xl leading-relaxed">
              {activeSlide.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={activeSlide.link || "/contact"}
                className="rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition hover:bg-blue-700 hover:scale-105"
              >
                {activeSlide.buttonText || "Contact Us"}
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-slate-400/40 bg-slate-900/60 px-7 py-3.5 text-sm font-bold text-slate-200 backdrop-blur-sm transition hover:bg-slate-800 hover:text-white"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex ? "w-8 bg-blue-500" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}