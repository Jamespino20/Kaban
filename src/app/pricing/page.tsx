"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BadgeCheck, CheckCircle2, Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid />

      <main className="w-full pt-32 flex flex-col items-center">
        {/* Hero */}
        <section className="w-full py-24 px-6 max-w-7xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" /> Makatarungang Patubuan
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900">
              Presyong <span className="text-emerald-600">Makatao.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl">
              Naniniwala kami sa transparency. Sa Kaban, makikita mo ang bawat
              sentimo na babayaran mo bago mo tanggapin ang pondo.
            </p>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="w-full py-32 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            term="3 Buwan"
            rate="1.5%"
            description="Ideal para sa mabilis na kapital sa paninda o pondo para sa isang maliit na event."
            features={[
              "Fast 24h approval",
              "Daily/Weekly payments",
              "Zero processing fees",
            ]}
          />
          <PricingCard
            term="6 Buwan"
            rate="2.0%"
            description="Sakto para sa pagpapagawa ng kagamitan o pag-upa ng karagdagang puwesto."
            highlight
            features={[
              "Dedicated mentor",
              "Flexible repayment",
              "Digital tracking",
            ]}
          />
          <PricingCard
            term="12 Buwan"
            rate="2.5%"
            description="Pondo para sa pang-matagalang growth at expansion ng iyong negosyo."
            features={[
              "Higher loan limits",
              "Extended support",
              "Automatic record keeping",
            ]}
          />
        </section>

        {/* No Hidden Fees Banner */}
        <section className="w-full py-40 px-6 max-w-7xl">
          <div className="bg-emerald-600 rounded-[4rem] p-16 md:p-24 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-black italic mb-10">
              Tunay na Transparente.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left opacity-90">
              <div className="space-y-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
                <h4 className="text-xl font-bold italic">
                  Walang "Hidden Fees"
                </h4>
                <p className="font-medium">
                  Hindi kami kumukuha ng mga mysterious charges sa gitna ng
                  iyong loan. Kung ano ang nasa kontrata, iyon lang.
                </p>
              </div>
              <div className="space-y-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
                <h4 className="text-xl font-bold italic">
                  Walang Pre-payment Penalty
                </h4>
                <p className="font-medium">
                  Gusto mo bang bayaran nang maaga ang iyong utang? Masaya kami!
                  Wala kaming charge sa maagang pagbayad.
                </p>
              </div>
              <div className="space-y-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
                <h4 className="text-xl font-bold italic">
                  Walang Collateral Trap
                </h4>
                <p className="font-medium">
                  Ang tiwala namin ay nasa iyong negosyo. Hindi namin kailangan
                  ng titulo o pasanin sa bahay.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

function PricingCard({
  term,
  rate,
  description,
  features,
  highlight = false,
}: {
  term: string;
  rate: string;
  description: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-10 rounded-[3rem] flex flex-col ${highlight ? "bg-white border-2 border-emerald-500 shadow-2xl scale-105" : "bg-slate-100/50 border border-slate-200"}`}
    >
      <h3 className="text-lg font-black italic text-slate-500 mb-2">
        {term} Term
      </h3>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-6xl font-black text-emerald-600">{rate}</span>
        <span className="text-lg font-bold text-slate-400">/ buwan</span>
      </div>
      <p className="text-slate-600 font-medium leading-relaxed mb-10">
        {description}
      </p>
      <ul className="space-y-4 mb-12 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-3 text-sm font-bold text-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
          </li>
        ))}
      </ul>
      <Link
        href="/#calculator"
        className={`w-full py-5 rounded-2xl font-black italic text-center transition-all ${highlight ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20" : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"}`}
      >
        Subukan ang Calculator
      </Link>
    </div>
  );
}
