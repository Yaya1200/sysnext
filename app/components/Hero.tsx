"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { heroSlides } from "../data/siteData";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === heroSlides.length - 1 ? 0 : prevIndex + 1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <section id="hero" className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-black">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(5,8,15,0.78), rgba(9,39,82,0.62)), url('${slide.image}')`,
          }}
        />
      ))}

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 text-white">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-blue-200">Since 2019</p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">{heroSlides[currentIndex].title}</h1>
            <p className="mt-5 max-w-2xl text-base text-slate-200 md:text-xl">{heroSlides[currentIndex].subtitle}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/contact" className="primary-btn">
                Contact Us
              </Link>
              <Link href="/services" className="secondary-btn">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}