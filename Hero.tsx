"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headlineRef.current;
    if (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 100);
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col justify-center bg-dark overflow-hidden"
      aria-label="Hero"
    >
      {/* Background texture layers */}
      <div className="absolute inset-0 bg-hero-pattern" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Accent orb */}
      <div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, #8C6B3E 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-semibold tracking-widest uppercase animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Vermont Home Renovations
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-white mb-6"
          >
            Your Home,{" "}
            <span className="italic text-accent">Done Right.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/55 leading-relaxed mb-10 max-w-2xl font-light animate-fade-up">
            Alder Projects connects Vermont homeowners with vetted, skilled
            craftspeople — managing every detail so your renovation stays on
            time, on budget, and exactly as you envisioned it.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-accent hover:bg-accent-light text-white font-semibold text-base transition-all duration-200 hover:shadow-xl hover:shadow-accent/25 active:scale-95 group"
            >
              Start Your Project
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 font-medium text-base transition-all duration-200"
            >
              How It Works
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 pt-10 border-t border-white/5 grid grid-cols-3 gap-6 max-w-sm sm:max-w-md">
            {[
              { value: "100+", label: "Projects Completed" },
              { value: "15+", label: "Vermont Towns Served" },
              { value: "5★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-2xl font-semibold text-accent mb-0.5">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 font-medium leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-xs text-white tracking-widest uppercase font-medium">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
