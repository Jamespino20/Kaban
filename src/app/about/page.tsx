"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Shield, Target, Users, BadgeCheck, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

export default function AboutPage() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.15 },
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 1s cubic-bezier(0.22, 1, 0.36, 1),
            transform 1s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
        .reveal-active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" /> Higit Pa sa Pondo
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              Ang Kwento ng <span className="text-emerald-600">Agapay.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl">
              Nagsimula kami sa isang simpleng pangarap: Ang bigyan ang bawat
              Pilipinong negosyante ng pagkakataong umagapay nang walang takot
              sa mapang-abusong patubuan.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section
          ref={addToRefs}
          className="reveal w-full py-32 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16"
        >
          <div className="p-12 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
            <Target className="w-12 h-12 text-emerald-600 mb-8" />
            <h2 className="text-3xl font-black italic mb-6">
              Ang aming Layunin
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Magmula sa mga sari-sari store hanggang sa mga online sellers,
              layunin naming maging katuwang sa pananalapi ng bawat Pilipino sa
              pamamagitan ng mabilis, maasahan, at makatarungang microfinancing.
            </p>
          </div>
          <div className="p-12 rounded-[3rem] bg-emerald-900 text-white shadow-xl shadow-emerald-950/20">
            <Shield className="w-12 h-12 text-emerald-400 mb-8" />
            <h2 className="text-3xl font-black italic mb-6">
              Ang aming Pangako
            </h2>
            <p className="text-lg text-emerald-50/80 leading-relaxed font-medium">
              Katapatan sa bawat sentimo. Kami ay isang SEC-registered
              institution na sumusunod sa pinakamataas na pamantayan ng consumer
              protection at data privacy.
            </p>
          </div>
        </section>

        {/* Regulatory Info */}
        <section
          ref={addToRefs}
          className="reveal w-full py-32 px-6 max-w-7xl bg-slate-100 rounded-[4rem] mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black italic mb-4">
              Regulatory Compliance
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
              SEC-Registered · BSP-Supervised
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <BadgeCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-black italic">Legitimacy</h3>
              <p className="text-slate-500 font-medium">
                Sertipikado at rehistrado sa Securities and Exchange Commission.
              </p>
            </div>
            <div className="space-y-4">
              <Shield className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-black italic">Protection</h3>
              <p className="text-slate-500 font-medium">
                Sumusunod sa strict guidelines ng Data Privacy Act of 2012.
              </p>
            </div>
            <div className="space-y-4">
              <Users className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-black italic">Fair Lending</h3>
              <p className="text-slate-500 font-medium">
                Ipinapatupad ang Truth in Lending Act para sa buong
                transparency.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
